<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\PageType;
use App\Enums\SectionType;
use App\Enums\SiteType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Page\PageSectionRequest;
use App\Http\Resources\Admin\AdminPageSectionResource;
use App\Models\Page;
use App\Models\PageSection;
use App\Services\Cache;
use App\Services\PageDataAssembler;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminPageSectionController extends BaseController
{
    private const FOOTER_QUICK_LINK_FIELD_NAMES = [
        'order_method',
        'order_shipping',
        'one_to_one_inquiry',
    ];

    public function __construct(
        private readonly Cache $cache,
        private readonly PageDataAssembler $pageDataAssembler,
    ) {}

    public function update(PageSectionRequest $request, string $siteType, string $pageType, string $sectionType): JsonResponse
    {
        $section = $this->findSection($siteType, $pageType, $sectionType);
        $page = $section->page;
        $site = $page->site_type instanceof SiteType ? $page->site_type : SiteType::from($page->site_type);
        $pageType = $page->page_type instanceof PageType ? $page->page_type : PageType::tryFrom($page->page_type);
        if ($request->exists('sort_order')) {
            Log::warning('Ignored admin page section sort_order update.', [
                'page_id' => $page->id,
                'page_slug' => $page->slug,
                'site_type' => $site->value,
                'page_type' => $pageType?->value ?? $page->page_type,
                'section_id' => $section->id,
                'section_type' => $section->section_type,
                'current_sort_order' => $section->sort_order,
                'requested_sort_order' => $request->input('sort_order'),
                'user_id' => $request->user()?->id,
                'ip' => $request->ip(),
            ]);
        }
        $data = Arr::except($request->validated(), ['section_type', 'sort_order']);
        $isBrandStoryHero = $site === SiteType::BRAND_SITE
            && $pageType === PageType::BRAND_STORY
            && $section->section_type === SectionType::HERO_SECTION->value;
        $isHeroUpdate = $section->section_type === SectionType::HERO_SECTION->value;

        if ($pageType === null || ! in_array($section->section_type, SectionType::valuesForPage($site, $pageType), true)) {
            return $this->responseError(422, 'This section is not registered for the selected page.');
        }

        if ($sectionType !== $section->section_type) {
            return $this->responseError(422, 'section_type cannot be changed.');
        }

        if (isset($data['content']) && is_array($data['content'])) {
            $data['content'] = Arr::except($data['content'], ['heading', 'description']);
        }

        DB::transaction(function () use ($section, $data, $isBrandStoryHero): void {
            if ($section->section_type === SectionType::HERO_SECTION->value) {
                $sectionData = Arr::only($data, [
                    'title', 'description', 'link', 'is_active',
                ]);

                if (array_key_exists('content', $data)) {
                    $content = Arr::only($section->content ?? [], [
                        'stats', 'animation', 'primary_cta', ...($isBrandStoryHero ? ['items'] : []),
                    ]);
                    $editableContent = Arr::only($data['content'], [
                        'stats', 'animation', 'primary_cta', ...($isBrandStoryHero ? ['items'] : []),
                    ]);

                    if ($isBrandStoryHero && is_array($editableContent['items'] ?? null)) {
                        $editableContent['items'] = array_map(
                            static fn (array $item): array => Arr::only($item, [
                                'title', 'image_url', 'mobile_image_url', 'link', 'is_active', 'sort_order',
                            ]),
                            $editableContent['items'],
                        );
                    }

                    $sectionData['content'] = array_replace($content, $editableContent);
                }

                $section->update($sectionData);

                return;
            }

            if ($section->section_type === SectionType::CRAFTSMANSHIP_VALUES->value) {
                $sectionData = Arr::only($data, [
                    'title', 'description', 'subtitle', 'sort_order', 'is_active',
                ]);

                if (array_key_exists('content', $data)) {
                    $sectionData['content'] = array_replace(
                        $section->content ?? [],
                        Arr::only($data['content'], ['limit']),
                    );
                }

                $section->update($sectionData);

                return;
            }

            if ($section->section_type === SectionType::PORTFOLIO_PREVIEW->value) {
                $sectionData = Arr::only($data, ['title', 'description']);

                if (array_key_exists('content', $data)) {
                    $sectionData['content'] = array_replace(
                        $section->content ?? [],
                        Arr::only($data['content'], ['limit']),
                    );
                }

                $section->update($sectionData);

                return;
            }

            if (in_array($section->section_type, [
                SectionType::SECONDARY_BANNER->value,
                SectionType::STEADY_SELLER->value,
                SectionType::FOOTER_QUICK_LINKS->value,
                SectionType::CATEGORY_SHORTCUTS->value,
            ], true)) {
                $sectionData = Arr::only($data, ['is_active']);

                if (array_key_exists('content', $data)) {
                    $allowedContent = match ($section->section_type) {
                        SectionType::SECONDARY_BANNER->value,
                        SectionType::FOOTER_QUICK_LINKS->value => ['items'],
                        SectionType::CATEGORY_SHORTCUTS->value => ['items'],
                        SectionType::STEADY_SELLER->value => [
                            'limit', 'category_slug', 'category_slugs', 'category',
                            'product_limit', 'product_ids',
                        ],
                    };
                    $content = Arr::only($data['content'], $allowedContent);

                    if ($section->section_type === SectionType::FOOTER_QUICK_LINKS->value
                        && is_array($content['items'] ?? null)) {
                        $content['items'] = array_map(
                            static fn (array $item, int $index): array => [
                                'field_name' => self::FOOTER_QUICK_LINK_FIELD_NAMES[$index],
                                'image' => $item['image'],
                            ],
                            $content['items'],
                            array_keys($content['items']),
                        );
                    }

                    $sectionData['content'] = array_replace(
                        $section->content ?? [],
                        $content,
                    );
                }

                $section->update($sectionData);

                return;
            }

            $section->update($data);
        });
        $page->load('sections');
        if (! $isHeroUpdate) {
            $this->pageDataAssembler->assemble($page);
        }
        $this->cache->invalidate('pages');

        $resolvedSection = $isHeroUpdate
            ? $section->fresh()
            : $page->sections->firstWhere('section_type', $sectionType);

        if ($isHeroUpdate && $resolvedSection !== null) {
            $this->pageDataAssembler->assembleAdminHeroImage($page, $resolvedSection);
        }

        return $this->responseSuccess(200, 'Page section updated successfully.', [
            'section' => new AdminPageSectionResource($resolvedSection ?? $section->fresh()),
        ]);
    }

    private function findSection(string $siteType, string $pageType, string $sectionType): PageSection
    {
        return Page::query()
            ->where('site_type', $siteType)
            ->where('page_type', $pageType)
            ->firstOrFail()
            ->sections()
            ->where('section_type', $sectionType)
            ->firstOrFail();
    }
}
