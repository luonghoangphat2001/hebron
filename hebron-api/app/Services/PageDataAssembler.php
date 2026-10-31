<?php

namespace App\Services;

use App\Enums\PageType;
use App\Enums\SectionType;
use App\Enums\SiteType;
use App\Http\Resources\BannerResource;
use App\Http\Resources\CraftsmanshipValueResource;
use App\Http\Resources\FaqResource;
use App\Http\Resources\MediaResource;
use App\Http\Resources\PageProductResource;
use App\Http\Resources\PortfolioResource;
use App\Models\AboutCta;
use App\Models\Banner;
use App\Models\Category;
use App\Models\CraftsmanshipValue;
use App\Models\Faq;
use App\Models\Media;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\Portfolio;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class PageDataAssembler
{
    /** @var array<string, AboutCta|null> */
    private array $aboutCtaCache = [];

    public function assemble(Page $page): void
    {
        $this->assembleSections($page);
    }

    public function assembleAdminPage(Page $page): void
    {
        // Hero content.items and image are resolved from banners even in the
        // admin page listing. Editable hero fields remain stored on the section.
        $this->assembleSections($page);
    }

    private function assembleSections(Page $page): void
    {
        $site = $page->site_type instanceof SiteType ? $page->site_type->value : $page->site_type;
        $pageType = $page->page_type instanceof PageType ? $page->page_type->value : $page->page_type;

        foreach ($page->sections as $section) {
            // Inactive CMS sections remain in the admin response, but do not need
            // their linked data resolved for this request.
            if (! $section->is_active) {
                continue;
            }

            $type = SectionType::tryFrom($section->section_type);
            $content = $this->resolveSectionContent($page, $section, $site, $pageType, $type);

            if ($content !== null) {
                $section->setAttribute('content', $content);
            }
        }
    }

    private function resolveSectionContent(
        Page $page,
        PageSection $section,
        string $site,
        string $pageType,
        ?SectionType $type,
    ): ?array {
        if ($type === SectionType::HERO_SECTION) {
            return $this->heroContent($page, $section, $site, $pageType);
        }

        if ($type === SectionType::ABOUT_CTA && $this->supportsAboutCta($site, $pageType)) {
            return $this->aboutCta($page, $section);
        }

        if ($site === SiteType::SHOPPING_MALL->value && $pageType === PageType::HOME_PAGE->value) {
            return $this->shoppingMallHomeContent($page, $section, $type);
        }

        if ($site === SiteType::BRAND_SITE->value && $pageType === PageType::HOME_PAGE->value) {
            return $this->brandHomeContent($page, $section, $type);
        }

        return match ([$site, $pageType, $type]) {
            [SiteType::BRAND_SITE->value, PageType::MEDIA->value, SectionType::MEDIA_LIST] => $this->mediaListConfig($section),
            [SiteType::BRAND_SITE->value, PageType::STANDARD_PRODUCTS->value, SectionType::PRODUCT_LIST] => $this->productListConfig($section),
            [SiteType::BRAND_SITE->value, PageType::PORTFOLIO->value, SectionType::PORTFOLIO_FEATURED] => $this->portfolioFeatured($page, $section),
            [SiteType::PLAIN_SITE->value, PageType::HOME_PAGE->value, SectionType::PRODUCT_CATALOG] => $this->productCatalog($section),
            default => null,
        };
    }

    private function heroContent(Page $page, PageSection $section, string $site, string $pageType): ?array
    {
        return match ([$site, $pageType]) {
            [SiteType::SHOPPING_MALL->value, PageType::HOME_PAGE->value],
            [SiteType::SHOPPING_MALL->value, PageType::ORDER_LOOKUP->value],
            [SiteType::SHOPPING_MALL->value, PageType::TERMS->value],
            [SiteType::SHOPPING_MALL->value, PageType::PRIVACY->value],
            [SiteType::BRAND_SITE->value, PageType::HOME_PAGE->value],
            [SiteType::PLAIN_SITE->value, PageType::HOME_PAGE->value] => $this->hero($page, $section),
            [SiteType::BRAND_SITE->value, PageType::BRAND_STORY->value] => $this->brandStoryHero($page, $section),
            [SiteType::BRAND_SITE->value, PageType::PORTFOLIO->value],
            [SiteType::BRAND_SITE->value, PageType::PORTFOLIO_DETAIL->value],
            [SiteType::BRAND_SITE->value, PageType::PROCESS->value],
            [SiteType::BRAND_SITE->value, PageType::MEDIA->value],
            [SiteType::BRAND_SITE->value, PageType::FAQS->value],
            [SiteType::BRAND_SITE->value, PageType::CONTACT_US->value],
            [SiteType::BRAND_SITE->value, PageType::PRODUCTION_INQUIRY->value],
            [SiteType::BRAND_SITE->value, PageType::STANDARD_PRODUCTS->value] => $this->pageHero($page, $section),
            default => null,
        };
    }

    private function supportsAboutCta(string $site, string $pageType): bool
    {
        return in_array("{$site}:{$pageType}", [
            SiteType::SHOPPING_MALL->value.':'.PageType::HOME_PAGE->value,
            SiteType::BRAND_SITE->value.':'.PageType::HOME_PAGE->value,
            SiteType::BRAND_SITE->value.':'.PageType::PORTFOLIO->value,
            SiteType::BRAND_SITE->value.':'.PageType::FAQS->value,
            SiteType::BRAND_SITE->value.':'.PageType::PROCESS->value,
            SiteType::BRAND_SITE->value.':'.PageType::PRODUCTION_INQUIRY->value,
            SiteType::BRAND_SITE->value.':'.PageType::CONTACT_US->value,
            SiteType::BRAND_SITE->value.':'.PageType::MEDIA->value,
            SiteType::BRAND_SITE->value.':'.PageType::STANDARD_PRODUCTS->value,
        ], true);
    }

    private function shoppingMallHomeContent(Page $page, PageSection $section, ?SectionType $type): ?array
    {
        return match ($type) {
            SectionType::CATEGORY_SHORTCUTS => $this->categoryShortcuts($section),
            SectionType::PRODUCT_PREVIEW, SectionType::CATEGORY_PRODUCT_SHOWCASE => $this->categoryShowcase($page, $section),
            SectionType::FAQ_SECTION => $this->faq($page, $section),
            SectionType::NOTICES_PREVIEW => $this->noticesPreview($page, $section),
            SectionType::SECONDARY_BANNER, SectionType::FOOTER_QUICK_LINKS => $this->manualItems($section),
            SectionType::STEADY_SELLER => $this->steadySeller($page, $section),
            default => null,
        };
    }

    private function brandHomeContent(Page $page, PageSection $section, ?SectionType $type): ?array
    {
        return match ($type) {
            SectionType::PRODUCT_PREVIEW, SectionType::CATEGORY_PRODUCT_SHOWCASE => $this->categoryShowcase($page, $section),
            SectionType::CRAFTSMANSHIP_VALUES => $this->craftsmanshipValues($section),
            SectionType::PORTFOLIO_PREVIEW => $this->portfolioFeatured($page, $section),
            SectionType::PRESS_PREVIEW => $this->pressPreview($section),
            default => null,
        };
    }

    public function assembleAdminHeroImage(Page $page, PageSection $section): void
    {
        $section->setAttribute('image', $this->bannerImage($this->latestHeroBanner($page)));
    }

    private function hero(Page $page, PageSection $section): array
    {
        $content = Arr::only($section->content ?? [], [
            'stats', 'animation', 'primary_cta',
        ]);
        $content['items'] = $this->heroBannerItems($page);

        $section->setAttribute('image', $content['items'][0]['image_url'] ?? null);

        return $content;
    }

    private function pageHero(Page $page, PageSection $section): array
    {
        $banner = $this->latestHeroBanner($page);

        $section->setAttribute('image', $this->bannerImage($banner));

        return [
            ...Arr::only($section->content ?? [], ['stats', 'animation', 'primary_cta']),
            'items' => $this->heroBannerItems($page),
        ];
    }

    private function heroBannerItems(Page $page): array
    {
        $site = $page->site_type instanceof SiteType ? $page->site_type->value : $page->site_type;
        $pageType = $page->page_type instanceof PageType ? $page->page_type->value : $page->page_type;
        $banners = Banner::visible()->select([
            'id', 'name', 'image_path', 'image_path_mobile', 'link_url',
            'site_type', 'page_type', 'exposure_location', 'sort_order',
        ])->where('site_type', $site)->where('page_type', $pageType)
            ->where('exposure_location', 'main_hero')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        return array_map(static fn (array $banner): array => [
            'link' => $banner['link_url'] ?? null,
            'title' => $banner['name'] ?? null,
            'image_url' => $banner['image_url'] ?? null,
            'mobile_image_url' => $banner['image_url_mobile'] ?? null,
            'is_active' => true,
            'sort_order' => $banner['sort_order'] ?? null,
        ], BannerResource::collection($banners)->resolve());
    }

    private function brandStoryHero(Page $page, PageSection $section): array
    {
        $section->setAttribute('image', $this->bannerImage($this->latestHeroBanner($page)));

        return [
            ...Arr::only($section->content ?? [], ['stats', 'animation', 'items']),
            'items' => data_get($section->content, 'items', []),
        ];
    }

    private function latestHeroBanner(Page $page): ?Banner
    {
        $site = $page->site_type instanceof SiteType ? $page->site_type->value : $page->site_type;
        $pageType = $page->page_type instanceof PageType ? $page->page_type->value : $page->page_type;

        return Banner::visible()
            ->where('site_type', $site)
            ->where('page_type', $pageType)
            ->where('exposure_location', 'main_hero')
            ->latest('created_at')
            ->latest('id')
            ->first();
    }

    private function bannerImage(?Banner $banner): ?string
    {
        return $banner === null ? null : (new BannerResource($banner))->resolve()['image_url'];
    }

    private function aboutCta(Page $page, PageSection $section): ?array
    {
        $site = $page->site_type instanceof SiteType ? $page->site_type->value : $page->site_type;
        $aboutCta = $this->aboutCtaCache[$site]
            ??= AboutCta::query()->where('site_type', $site)->first();

        if ($aboutCta === null) {
            return null;
        }

        $content = $aboutCta->content ?? [];
        $this->applyAboutCtaFields($section, $aboutCta, $content);

        $content = Arr::except($content, ['heading', 'description']);
        $content['item'] = $this->resolveAboutCtaItems($content['item'] ?? []);

        return $content;
    }

    private function applyAboutCtaFields(PageSection $section, AboutCta $aboutCta, array $content): void
    {
        foreach (['subtitle', 'image', 'link', 'metadata'] as $field) {
            $section->setAttribute($field, $aboutCta->getAttribute($field));
        }

        $section->setAttribute('title', $content['heading'] ?? $aboutCta->title);
        $section->setAttribute('description', $content['description'] ?? null);
    }

    private function resolveAboutCtaItems(array $items): array
    {
        $productIds = collect($items)->pluck('product_id')->filter()->map(fn ($id) => (int) $id)->values();
        if ($productIds->isEmpty()) {
            return [];
        }

        $productsById = Product::query()
            ->whereIn('id', $productIds)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('visible_roles')
                    ->orWhereJsonContains('visible_roles', 'ALL')
                    ->orWhereJsonContains('visible_roles', 'MEMBER');
            })
            ->get(['id', 'slug'])
            ->keyBy('id');

        return collect($items)
            ->map(fn (array $item): ?array => $this->aboutCtaItem($item, $productsById))
            ->filter()
            ->values()
            ->all();
    }

    private function aboutCtaItem(array $item, Collection $productsById): ?array
    {
        $product = $productsById->get((int) ($item['product_id'] ?? 0));
        if ($product === null) {
            return null;
        }

        return [
            'slug' => $product->slug,
            'image' => $item['image'] ?? null,
        ];
    }

    private function mediaListConfig(PageSection $section): array
    {
        return [
            ...Arr::except($section->content ?? [], ['items']),
            'api_endpoint' => '/api/brand/media',
        ];
    }

    private function productListConfig(PageSection $section): array
    {
        return [
            ...Arr::except($section->content ?? [], ['items']),
            'category_endpoint' => '/api/categories',
            'product_endpoint' => '/api/brand/products',
            'category_product_endpoint' => '/api/categories/{slug}/products',
        ];
    }

    private function categoryShortcuts(PageSection $section): array
    {
        return $this->manualItems($section);
    }

    private function categoryShowcase(Page $page, PageSection $section, bool $onlyTopProducts = false): array
    {
        $content = $section->content ?? [];
        $productIds = $this->idsFromContent($content, 'product_ids');
        $hasProductSelection = array_key_exists('product_ids', $content);
        $categories = $this->selectedShowcaseCategories($content);
        $categoryImages = collect($content['category_slugs'] ?? [])
            ->filter(static fn ($item): bool => is_array($item) && isset($item['slug'], $item['image_url']))
            ->mapWithKeys(static fn (array $item): array => [$item['slug'] => $item['image_url']]);
        $categoryData = $categories->map(fn (Category $category): array => $this->formatShowcaseCategory(
            $category,
            $section,
            $content,
            $productIds,
            $hasProductSelection,
            $onlyTopProducts,
            $categoryImages,
        ))->all();

        if (! array_key_exists('category_slugs', $content)) {
            $content['category_slugs'] = $categories->pluck('slug')->values()->all();
        }
        $content['items'] = $categories->map(fn (Category $category): array => $this->formatShowcaseItem($category, $categoryImages))->all();
        $content['categories'] = $categoryData;
        $content['category_slug'] = $categories->first()?->slug;
        // Backward-compatible field for the currently selected category.
        $content['products'] = $categoryData[0]['products'] ?? [];

        return $content;
    }

    private function selectedShowcaseCategories(array $content): Collection
    {
        $query = Category::active()->select([
            'id', 'name', 'slug', 'description', 'subtitle', 'image', 'icon', 'sort_order', 'is_best', 'exposure_order',
        ]);

        $slugs = $this->categorySlugs($content);
        if ($this->hasAnyKey($content, ['category_slugs', 'category_slug', 'category']) && $slugs === []) {
            return collect();
        }

        if ($slugs !== []) {
            return $this->orderBySlugList($query, $slugs)->limit($this->limit($content, 8))->get();
        }

        return $query
            ->orderByDesc('is_best')
            ->orderBy('exposure_order')
            ->orderBy('sort_order')
            ->limit($this->limit($content, 8))
            ->get();
    }

    private function formatShowcaseCategory(
        Category $category,
        PageSection $section,
        array $content,
        array $productIds,
        bool $hasProductSelection,
        bool $onlyTopProducts,
        Collection $categoryImages,
    ): array {
        $products = $hasProductSelection && $productIds === []
            ? collect()
            : $this->showcaseProducts($category, $section, $content, $productIds, $onlyTopProducts);

        return [
            'category_slug' => $category->slug,
            'category_name' => $category->name,
            'subtitle' => $category->subtitle,
            'image_url' => $this->showcaseCategoryImage($category, $categoryImages),
            'icon' => $category->icon,
            'link' => $category->slug,
            'products' => $this->productCards($products),
        ];
    }

    private function showcaseProducts(
        Category $category,
        PageSection $section,
        array $content,
        array $productIds,
        bool $onlyTopProducts,
    ): Collection {
        $query = $category->products()->select($this->productColumns())
            ->where('products.is_active', true)
            ->when($section->section_type === SectionType::PRODUCT_PREVIEW->value,
                fn ($query) => $query->where('products.is_featured', true))
            ->when($section->section_type === SectionType::CATEGORY_PRODUCT_SHOWCASE->value,
                fn ($query) => $query->where('products.is_popular', true))
            ->where(function ($query) {
                $query->whereNull('products.visible_roles')
                    ->orWhereJsonContains('products.visible_roles', 'ALL')
                    ->orWhereJsonContains('products.visible_roles', 'MEMBER');
            })
            ->when($onlyTopProducts, fn ($query) => $query->where('products.is_top_product', true))
            ->with('categories:id,name,slug,image,icon,sort_order')
            ->when($productIds !== [], fn ($query) => $query->whereIn('products.id', $productIds))
            ->orderBy('category_product.sort_order')
            ->limit($this->limit($content, 5))
            ->get();

        return $productIds === []
            ? $query
            : $query->sortBy(fn (Product $product) => array_search($product->id, $productIds, true))->values();
    }

    private function formatShowcaseItem(Category $category, Collection $categoryImages): array
    {
        return [
            'link' => $category->slug,
            'slug' => $category->slug,
            'label' => $category->name,
            'image_url' => $this->showcaseCategoryImage($category, $categoryImages),
            'icon' => $category->icon,
        ];
    }

    private function showcaseCategoryImage(Category $category, Collection $categoryImages): ?string
    {
        return $categoryImages->get($category->slug) ?? $category->image ?? $category->icon;
    }

    private function craftsmanshipValues(PageSection $section): array
    {
        $content = $section->content ?? [];

        $values = CraftsmanshipValue::query()
            ->active()
            ->with(['products' => fn ($query) => $query
                ->where('products.is_active', true)
                ->where(function ($query) {
                    $query->whereNull('products.visible_roles')
                        ->orWhereJsonContains('products.visible_roles', 'ALL')
                        ->orWhereJsonContains('products.visible_roles', 'MEMBER');
                })
                ->with('categories:id,name,slug')])
            ->ordered()
            ->limit($this->limit($content, 3))
            ->get();

        $values->each(fn (CraftsmanshipValue $value) => $value->setRelation(
            'products',
            $value->products->take(6)->values(),
        ));

        $content['items'] = CraftsmanshipValueResource::collection($values)->resolve();

        return $content;
    }

    private function faq(Page $page, PageSection $section): array
    {
        $content = $section->content ?? [];
        $site = $page->site_type instanceof SiteType ? $page->site_type->value : $page->site_type;
        $faqIds = $this->idsFromContent($content, 'faq_ids');
        $faqsQuery = Faq::active()->select([
            'id', 'category', 'question', 'answer', 'sort_order', 'is_active',
            'view_count', 'site_type', 'created_at', 'updated_at',
        ])->where('site_type', $site)->where(fn ($q) => $q->whereJsonContains('exposure_target', 'all')->orWhereNull('exposure_target'));
        $faqs = $this->resolveByIdsOrAuto($faqsQuery, $faqIds, 'faq_ids', $content, 8, [
            ['sort_order', 'asc'], ['id', 'asc'],
        ]);
        $content['items'] = FaqResource::collection($faqs)->resolve();

        return $content;
    }

    private function noticesPreview(Page $page, PageSection $section): array
    {
        $content = $section->content ?? [];
        $mediaIds = $this->idsFromContent($content, 'notice_ids');
        $media = $mediaIds === []
            ? collect()
            : Media::query()
                ->whereKey($mediaIds)
                ->with('categories')
                ->get()
                ->sortBy(fn (Media $item) => array_search($item->id, $mediaIds, true))
                ->values();

        $content['items'] = MediaResource::collection($media)->resolve();

        return $content;
    }

    private function manualItems(PageSection $section): array
    {
        $content = $section->content ?? [];
        $content['items'] = array_values(array_filter(
            $content['items'] ?? [],
            static fn ($item): bool => is_array($item),
        ));

        return $content;
    }

    private function steadySeller(Page $page, PageSection $section): array
    {
        return $this->categoryShowcase($page, $section, true);
    }

    private function portfolioFeatured(Page $page, PageSection $section): array
    {
        $content = $section->content ?? [];
        $site = $page->site_type instanceof SiteType ? $page->site_type->value : $page->site_type;
        $query = Portfolio::active()
            ->ofSite($site)
            ->where('is_featured', true)
            ->select([
                'id', 'site_type', 'title', 'client', 'year',
                'description', 'cover_image', 'gallery', 'is_featured',
                'sort_order', 'created_at', 'updated_at',
            ])
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($section->section_type === SectionType::PORTFOLIO_PREVIEW->value) {
            $query->limit($this->limit($content, 6));
        }

        $content['items'] = PortfolioResource::collection($query->get())->resolve();

        return $content;
    }

    private function pressPreview(PageSection $section): array
    {
        $content = $section->content ?? [];
        $mediaIds = $this->idsFromContent($content, 'media_ids');

        $media = $mediaIds === []
            ? collect()
            : Media::query()
                ->whereKey($mediaIds)
                ->with('categories')
                ->get()
                ->sortBy(fn (Media $item) => array_search($item->id, $mediaIds, true))
                ->values();

        $content['items'] = MediaResource::collection($media)->resolve();

        return $content;
    }

    private function productCatalog(PageSection $section): array
    {
        // Product data is delivered by the catalog endpoint declared in the
        // section config. Keep this page response configuration-only.
        return $section->content ?? [];
    }

    /** @return array<int, string> */
    private function categorySlugs(array $content): array
    {
        $values = Arr::wrap($content['category_slugs'] ?? $content['category_slug'] ?? $content['category'] ?? []);

        return array_values(array_filter(array_map(
            static fn ($value) => is_array($value) ? ($value['slug'] ?? null) : $value,
            $values,
        ), static fn ($slug) => is_string($slug) && trim($slug) !== ''));
    }

    /** @return array<int, int> */
    private function idsFromContent(array $content, string $key): array
    {
        return array_values(array_filter(
            array_map('intval', Arr::wrap($content[$key] ?? [])),
            static fn (int $id): bool => $id > 0,
        ));
    }

    /** @return Collection<int, Model> */
    private function resolveByIdsOrAuto($query, array $ids, string $selectionKey, array $content, int $defaultLimit, array $autoOrders): Collection
    {
        $limit = $this->limit($content, $defaultLimit);

        if ($ids !== []) {
            $selectedIds = array_slice($ids, 0, $limit);

            return $query->whereIn('id', $selectedIds)->get()
                ->sortBy(fn ($item) => array_search($item->id, $selectedIds, true))
                ->values();
        }

        if (array_key_exists($selectionKey, $content)) {
            return collect();
        }

        foreach ($autoOrders as [$column, $direction]) {
            $query->orderBy($column, $direction);
        }

        return $query->limit($limit)->get();
    }

    /** @param array<int, string> $keys */
    private function hasAnyKey(array $content, array $keys): bool
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $content)) {
                return true;
            }
        }

        return false;
    }

    private function orderBySlugList($query, array $slugs)
    {
        $cases = collect($slugs)
            ->values()
            ->map(fn (string $slug, int $index): string => "WHEN ? THEN {$index}")
            ->implode(' ');

        return $query
            ->whereIn('slug', $slugs)
            ->orderByRaw("CASE slug {$cases} ELSE ? END", [...$slugs, count($slugs)]);
    }

    private function orderByIdList($query, array $ids)
    {
        $cases = collect($ids)
            ->values()
            ->map(fn (int $id, int $index): string => "WHEN ? THEN {$index}")
            ->implode(' ');

        return $query
            ->whereIn('id', $ids)
            ->orderByRaw("CASE id {$cases} ELSE ? END", [...$ids, count($ids)]);
    }

    /** @return array<int, string> */
    private function productColumns(): array
    {
        return [
            'products.id', 'products.sku', 'products.name', 'products.name_en',
            'products.slug', 'products.selling_price', 'products.supply_price',
            'products.price_content',
            'products.images', 'products.is_popular', 'products.is_featured',
            'products.is_top_product',
            'products.is_active', 'products.sort_order',
        ];
    }

    private function productCards($products): array
    {
        $products = PageProductResource::collection($products)->resolve();

        return array_map(function (array $product): array {
            $name = $product['name']['ko'] ?? $product['slug'];
            $card = [
                'link' => $product['slug'],
                'title' => $name,
                'image_url' => $product['first_image'],
                'product_id' => $product['product_id'],
                'product_code' => $product['product_code'],
                'is_popular' => $product['is_popular'],
                'is_featured' => $product['is_featured'],
                'price' => $product['selling_price'],
                'sale_price' => $product['selling_price'],
                'original_price' => $product['original_price'],
                'price_content' => $product['price_content'] ?? null,
                'discount_rate' => $product['discount_percentage'],
                'has_discount' => $product['has_discount'],
            ];

            return $card;
        }, $products);
    }

    private function limit(array $content, int $default): int
    {
        return max(1, min((int) ($content['limit'] ?? $content['product_limit'] ?? $content['page_size'] ?? $default), 100));
    }
}
