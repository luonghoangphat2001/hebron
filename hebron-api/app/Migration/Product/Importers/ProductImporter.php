<?php

namespace App\Migration\Product\Importers;

use App\Migration\Product\DTO\ProductCategoryData;
use App\Migration\Product\DTO\ProductImageData;
use App\Migration\Product\DTO\ProductImportData;
use App\Migration\Product\DTO\ProductOptionData;
use App\Migration\Product\DTO\ProductOptionGroupData;
use App\Models\Category;
use App\Models\CategoryProduct;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\ProductOptionGroup;
use App\Models\ProductOptionGroupProduct;
use App\Models\ProductSpecification;
use DOMDocument;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ProductImporter
{
    public function __construct() {}

    /**
     * Import a single product (idempotent via legacy_product_id).
     */
    public function import(ProductImportData $dto): Product
    {
        $resolved = $this->resolveCategoryIds($dto->categories);

        $dryRun = (bool) config('migration.dry_run', false);

        if ($dryRun) {
            Log::info('[dry-run] ProductImporter::import', [
                'legacy_id' => $dto->legacyId,
                'name' => $dto->name,
                'primary_category_id' => $resolved['primary'],
                'category_count' => count($resolved['mapping']),
            ]);

            return new Product([
                'id' => 0,
                'legacy_product_id' => $dto->legacyId,
                'name' => $dto->name,
                'category_id' => $resolved['primary'],
            ]);
        }

        return DB::transaction(function () use ($dto, $resolved) {
            $product = $this->upsertProduct($dto);
            $this->syncCategories($product, $dto->categories, $resolved);
            $this->syncImages($product, $dto->images);
            $this->syncOptionGroups($product, $dto->optionGroups);
            $this->syncSpecification($product, $dto);

            return $product;
        });
    }

    protected function upsertProduct(ProductImportData $dto): Product
    {
        $product = Product::updateOrCreate(
            ['legacy_product_id' => $dto->legacyId],
            [
                'legacy_product_id' => $dto->legacyId,
                'name' => $dto->name,
                'name_en' => $dto->nameEn,
                'slug' => $this->ensureUniqueSlug($dto->slug, $dto->legacyId),
                'sku' => $dto->sku,
                'description' => $this->desciptionSyncImage($dto->description),
                'short_description' => $dto->shortDescription,
                'mobile_description' => $dto->mobileDescription,
                'supply_price' => $dto->supplyPrice,
                'selling_price' => $dto->price,
                'brand_site_price' => $dto->price,
                'plain_site_price' => $dto->price,
                'shipping_fee' => $dto->shippingFee,
                'price_content' => $dto->priceContent,
                'stock_quantity' => $dto->stockQuantity,
                'stock_inventory_enabled' => $dto->stockInventoryEnabled,
                'min_quantity' => $dto->minQuantity,
                'max_quantity' => $dto->maxQuantity,
                'sort_order' => $dto->sortOrder,
                'is_active' => $dto->isActive,
                'is_popular' => false,
                'is_featured' => false,
                'has_option' => $dto->hasOption,
                'option_type' => $dto->optionType,
            ]
        );
        Log::info('Product imported', [
            'legacy_id' => $dto->legacyId,
            'product_id' => $product->id,
            'name' => $product->name,
            'stock_inventory_enabled' => $dto->stockInventoryEnabled,
        ]);

        return $product;
    }

    /**
     * Resolve all legacy category ids against the local `categories` table.
     *
     * @param  array<int, ProductCategoryData>  $categories
     * @return array{primary:?int, mapping:array<int, int>}
     */
    protected function resolveCategoryIds(array $categories): array
    {
        $mapping = [];
        $primary = null;

        foreach ($categories as $cat) {
            $id = Category::where('legacy_category_id', $cat->legacyCategoryId)->value('id');
            if ($id) {
                $mapping[$cat->legacyCategoryId] = (int) $id;
                if ($primary === null || $cat->isPrimary) {
                    $primary = (int) $id;
                }
            }
        }

        return ['primary' => $primary, 'mapping' => $mapping];
    }

    /**
     * @param  array<int, ProductCategoryData>  $categories
     * @param  array{primary:?int, mapping:array<int, int>}  $resolved
     */
    protected function syncCategories(Product $product, array $categories, array $resolved): void
    {
        if (empty($categories)) {
            $this->detachAllCategories($product);

            return;
        }

        $incomingLocalIds = [];
        $anyPrimary = false;

        foreach ($categories as $cat) {
            $localId = $resolved['mapping'][$cat->legacyCategoryId] ?? null;
            if ($localId === null) {
                Log::warning('Skipping missing legacy category during import', [
                    'product_id' => $product->id,
                    'legacy_category_id' => $cat->legacyCategoryId,
                ]);

                continue;
            }

            CategoryProduct::updateOrCreate(
                [
                    'product_id' => $product->id,
                    'category_id' => $localId,
                ],
                [
                    'sort_order' => $cat->sortOrder,
                    'is_primary' => $cat->isPrimary,
                    'recommend' => $cat->recommend,
                    'new' => $cat->new,
                    'deleted_at' => null,
                ]
            );

            $incomingLocalIds[] = $localId;
            $anyPrimary = $anyPrimary || $cat->isPrimary;
        }

        $this->detachMissingCategories($product, $incomingLocalIds);
    }

    /**
     * @param  array<int, int>  $incomingLocalIds
     */
    protected function detachMissingCategories(Product $product, array $incomingLocalIds): void
    {
        $query = CategoryProduct::where('product_id', $product->id);

        if (! empty($incomingLocalIds)) {
            $query->whereNotIn('category_id', $incomingLocalIds);
        }

        $query->delete();
    }

    protected function detachAllCategories(Product $product): void
    {
        CategoryProduct::where('product_id', $product->id)->delete();
    }

    /**
     * @param  array<int, ProductImageData>  $images
     */
    protected function syncImages(Product $product, array $images): void
    {
        if (! (bool) config('migration.images.enabled', true)) {
            return;
        }

        $stored = [];
        foreach ($images as $img) {
            $stored[] = $this->changeUrlImage($img->url);
        }

        $filtered = array_values(array_filter($stored, fn ($v) => $v !== null && $v !== ''));

        if (! empty($filtered)) {
            $product->forceFill(['images' => $filtered])->save();
        }
    }

    protected function storeImage(string $url, string $directory = 'products/legacy'): ?string
    {
        if ($url === '') {
            return null;
        }

        $disk = config('filesystems.public_disk');

        try {
            $contents = @file_get_contents($url);
        } catch (Throwable $e) {
            Log::warning('Failed to download product image', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            $contents = false;
        }

        if ($contents === false) {
            return $url;
        }

        $urlPath = parse_url($url, PHP_URL_PATH) ?? '';
        $extension = pathinfo($urlPath, PATHINFO_EXTENSION) ?: 'jpg';
        $filename = Str::random(20).'.'.strtolower($extension);
        $path = $directory.'/'.$filename;

        Storage::disk($disk)->put($path, $contents);

        return Storage::disk($disk)->url($path);
    }

    public function desciptionSyncImage(?string $html): string
    {
        if (blank($html)) {
            return $html ?? '';
        }

        $previousErrorMode = libxml_use_internal_errors(true);

        try {
            $dom = new DOMDocument('1.0', 'UTF-8');
            $rootId = '__product_description_root__';
            $document = '<?xml encoding="UTF-8"><html><body><div id="'.$rootId.'">'.$html.'</div></body></html>';
            $loaded = $dom->loadHTML($document, LIBXML_HTML_NODEFDTD);
            $root = $loaded ? $dom->getElementById($rootId) : null;

            if ($root === null) {
                return $html;
            }

            foreach ($root->getElementsByTagName('img') as $image) {
                $src = $image->getAttribute('src');

                if (blank($src)) {
                    continue;
                }

                $newUrl = $this->changeUrlImage($src);

                if ($newUrl) {
                    $image->setAttribute('src', $newUrl);
                }
            }

            $result = '';
            foreach ($root->childNodes as $child) {
                $result .= $dom->saveHTML($child);
            }

            return $result;
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previousErrorMode);
        }
    }

    public function changeUrlImage(string $url): string
    {
        if (blank($url)) {
            return $url;
        }

        if (Str::startsWith($url, '//')) {
            $url = 'https:'.$url;
        }

        $legacyPrefix = rtrim(config('migration.images.legacy_prefix'), '/');
        $publicPrefix = rtrim(config('migration.images.public_prefix'), '/');

        return Str::replaceFirst(
            $legacyPrefix,
            $publicPrefix,
            $url
        );
    }

    /**
     * @param  array<int, ProductOptionGroupData>  $groups
     */
    protected function syncOptionGroups(Product $product, array $groups): void
    {
        if (! (bool) config('migration.options.import', true)) {
            return;
        }

        if (empty($groups)) {
            $this->detachAllGroups($product);

            return;
        }

        $incomingGroupIds = [];

        foreach ($groups as $groupData) {
            $group = $this->upsertSharedGroup($groupData);
            $this->attachGroupToProduct($product, $group, $groupData->sortOrder);

            $incomingGroupIds[] = $group->id;

            $this->syncOptions($group, $groupData->options);
        }

        $this->detachMissingGroups($product, $incomingGroupIds);
    }

    /**
     * Resolve a shared ProductOptionGroup (no product_id) by its unique `code`,
     * creating it on first sight. Cafe24 may reuse the same `option_code`
     * across products, so we treat the group as a global entity.
     */
    protected function upsertSharedGroup(ProductOptionGroupData $groupData): ProductOptionGroup
    {
        $values = [
            'name' => $groupData->name,
            'display_type' => $groupData->displayType,
            'is_required' => $groupData->isRequired,
        ];

        $group = ProductOptionGroup::updateOrCreate(
            ['code' => $groupData->code],
            $values
        );

        return $group;
    }

    protected function attachGroupToProduct(Product $product, ProductOptionGroup $group, int $sortOrder): void
    {
        ProductOptionGroupProduct::updateOrCreate(
            [
                'product_id' => $product->id,
                'product_option_group_id' => $group->id,
            ],
            [
                'sort_order' => $sortOrder,
                'deleted_at' => null,
            ]
        );
    }

    /**
     * @param  array<int, int>  $incomingGroupIds
     */
    protected function detachMissingGroups(Product $product, array $incomingGroupIds): void
    {
        $query = ProductOptionGroupProduct::where('product_id', $product->id);

        if (! empty($incomingGroupIds)) {
            $query->whereNotIn('product_option_group_id', $incomingGroupIds);
        }

        // Soft-delete the pivot row, keep the shared group around.
        $query->delete();
    }

    protected function detachAllGroups(Product $product): void
    {
        ProductOptionGroupProduct::where('product_id', $product->id)->delete();
    }

    /**
     * @param  array<int, ProductOptionData>  $options
     */
    protected function syncOptions(ProductOptionGroup $group, array $options): void
    {
        if (empty($options)) {
            ProductOption::where('option_group_id', $group->id)->delete();

            return;
        }

        $incomingIds = [];

        foreach ($options as $opt) {
            $metadata = $opt->metadata;
            if ($opt->valueNo !== null) {
                $metadata['value_no'] = $opt->valueNo;
                $metadata['legacy_option_no'] = $opt->valueNo;
            }
            if ($opt->imageFile) {
                $metadata['option_image_file'] = $opt->imageFile;
            }
            if ($opt->linkImage) {
                $metadata['option_link_image'] = $opt->linkImage;
            }
            if ($opt->color) {
                $metadata['option_color'] = $opt->color;
            }

            $values = [
                'name' => $opt->value,
                'additional_price' => (int) round($opt->additionalPrice),
                'sort_order' => $opt->sortOrder,
                'is_active' => $opt->isActive,
                'metadata' => $metadata,
            ];

            if ($opt->valueNo !== null) {
                $existing = ProductOption::where('option_group_id', $group->id)
                    ->whereJsonContains('metadata->value_no', $opt->valueNo)
                    ->first();

                if ($existing) {
                    $existing->update($values);
                    $incomingIds[] = $existing->id;

                    continue;
                }
            }

            $option = ProductOption::create([
                'option_group_id' => $group->id,
                'name' => $opt->name,
                ...$values,
            ]);
            $incomingIds[] = $option->id;
        }

        ProductOption::where('option_group_id', $group->id)
            ->whereNotIn('id', $incomingIds)
            ->delete();
    }

    protected function syncSpecification(Product $product, ProductImportData $dto): void
    {
        if (! (bool) config('migration.options.import_specifications', true)) {
            return;
        }

        $info = $dto->additionalInformation;
        $rawDetail = $dto->rawDetail;

        $hasData = ! empty($info)
            || $dto->productWeight !== null
            || $dto->productMaterial !== null;

        if (! $hasData) {
            return;
        }
        $spec = ProductSpecification::firstOrNew(['product_id' => $product->id]);

        $size = $info['사이즈'] ?? $info['size'] ?? null;
        $materials = $info['소재'] ?? $info['materials'] ?? $info['재질'] ?? $dto->productMaterial;
        $case = $info['케이스'] ?? $info['case'] ?? null;
        $period = $info['제작기간'] ?? $info['product_period'] ?? null;
        $totalAmount = $info['총 상품금액'] ?? $info['total_product_amount'] ?? null;
        $shipping = $info['배송정보'] ?? $info['shipping_info'] ?? null;
        $notes = $info['비고'] ?? $info['notes'] ?? $rawDetail['product_memo'] ?? null;

        $spec->forceFill([
            'size' => $size ? (string) $size : $spec->size,
            'materials' => $materials ? (string) $materials : $spec->materials,
            'case' => $case ? (string) $case : $spec->case,
            'product_period' => $period ? (string) $period : $spec->product_period,
            'total_product_amount' => $totalAmount ? (string) $totalAmount : $spec->total_product_amount,
            'shipping_info' => $shipping ? (string) $shipping : $spec->shipping_info,
            'weight' => $dto->productWeight ?: $spec->weight,
            'notes' => $notes ? (string) $notes : $spec->notes,
        ]);

        $spec->save();
    }

    protected function resolveOptionType(ProductImportData $dto): string
    {
        if (! $dto->hasOption) {
            return 'none';
        }

        $types = array_map(
            fn (ProductOptionGroupData $g) => $g->code,
            $dto->optionGroups,
        );

        $type = implode(',', array_filter($types));
        if ($type === '' && $dto->optionType) {
            return $dto->optionType;
        }

        return $type !== '' ? $type : 'custom';
    }

    protected function ensureUniqueSlug(string $base, int $legacyId): string
    {
        $slug = Str::limit($base, 190, '');
        $candidate = $slug !== '' ? $slug : 'product-'.$legacyId;

        $original = $candidate;
        $i = 1;

        while (
            Product::where('slug', $candidate)
                ->where('legacy_product_id', '!=', $legacyId)
                ->exists()
        ) {
            $candidate = $original.'-'.(++$i);
        }

        return $candidate;
    }
}
