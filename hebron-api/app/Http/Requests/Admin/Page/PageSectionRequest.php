<?php

namespace App\Http\Requests\Admin\Page;

use App\Enums\SectionType;
use App\Models\PageSection;
use App\Support\AboutCtaContentSchema;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PageSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    private ?PageSection $targetSection = null;

    protected function prepareForValidation(): void
    {
        $data = $this->all();
        foreach (['content', 'metadata'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $decoded = json_decode($data[$field], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data[$field] = $decoded;
                }
            }
        }
        $this->replace($data);
    }

    public function rules(): array
    {
        $section = $this->targetSection();
        $sectionType = $section?->section_type;

        if ($sectionType === SectionType::HERO_SECTION->value && $this->isBrandStoryHero($section)) {
            return [
                'section_type' => ['sometimes', 'string', Rule::in([$sectionType])],
                'title' => ['sometimes', 'nullable', 'string', 'max:255'],
                'description' => ['sometimes', 'nullable', 'string'],
                'content' => ['sometimes', 'array'],
                'content.stats' => ['sometimes', 'nullable', 'array'],
                'content.animation' => ['sometimes', 'nullable', 'string', 'max:100'],
                'content.primary_cta' => ['sometimes', 'nullable', 'array'],
                'content.items' => ['sometimes', 'array', 'max:100'],
                'content.items.*' => ['array'],
                'content.items.*.title' => ['required', 'string', 'max:255'],
                'content.items.*.image_url' => ['required', 'string', 'max:500'],
                'content.items.*.mobile_image_url' => ['nullable', 'string', 'max:500'],
                'content.items.*.link' => ['nullable', 'string', 'max:500'],
                'content.items.*.is_active' => ['required', 'boolean'],
                'content.items.*.sort_order' => ['required', 'integer', 'min:0'],
                'link' => ['sometimes', 'nullable', 'string', 'max:500'],
                'is_active' => ['sometimes', 'boolean'],
            ];
        }

        if ($sectionType === SectionType::HERO_SECTION->value) {
            return [
                // Admin clients may send the section object returned by the
                // read endpoint. Validate the identifier when present and
                // silently ignore the remaining read-only fields.
                'section_type' => ['sometimes', 'string', Rule::in([$sectionType])],
                'title' => ['sometimes', 'nullable', 'string', 'max:255'],
                'description' => ['sometimes', 'nullable', 'string'],
                'content' => ['sometimes', 'array'],
                'content.stats' => ['sometimes', 'nullable', 'array'],
                'content.animation' => ['sometimes', 'nullable', 'string', 'max:100'],
                'content.primary_cta' => ['sometimes', 'nullable', 'array'],
                'link' => ['sometimes', 'nullable', 'string', 'max:500'],
                'is_active' => ['sometimes', 'boolean'],
            ];
        }

        if ($sectionType === SectionType::CRAFTSMANSHIP_VALUES->value) {
            return [
                'section_type' => ['sometimes', 'string', Rule::in([$sectionType])],
                'title' => ['sometimes', 'nullable', 'string', 'max:255'],
                'description' => ['sometimes', 'nullable', 'string'],
                'subtitle' => ['sometimes', 'nullable', 'string', 'max:255'],
                'content' => ['sometimes', 'array'],
                'content.limit' => ['sometimes', 'integer', 'min:1', 'max:100'],
                'is_active' => ['sometimes', 'boolean'],
            ];
        }

        if ($sectionType === SectionType::PORTFOLIO_PREVIEW->value) {
            return [
                'section_type' => ['sometimes', 'string', Rule::in([$sectionType])],
                'title' => ['sometimes', 'nullable', 'string', 'max:255'],
                'description' => ['sometimes', 'nullable', 'string'],
                'content' => ['sometimes', 'array'],
                'content.limit' => ['sometimes', 'integer', 'min:1', 'max:100'],
                'content.portfolio_ids' => ['prohibited'],
            ];
        }

        return array_merge([
            // The URL identifies the row; section_type is only an optional
            // consistency check and cannot be used to change its type.
            'section_type' => array_values(array_filter([
                'sometimes',
                'string',
                $sectionType !== null ? Rule::in([$sectionType]) : null,
            ])),
            'title' => 'nullable|string|max:255', 'description' => 'nullable|string', 'subtitle' => 'nullable|string|max:255',
            'content' => 'nullable|array', 'image' => 'nullable|string|max:500', 'link' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean', 'metadata' => 'nullable|array',
        ], $this->contentRules($sectionType));
    }

    public function messages(): array
    {
        return [
            'content.portfolio_ids.prohibited' => 'Portfolio selection is automatic for this section.',
        ];
    }

    /** @return array<string, mixed> */
    private function contentRules(?string $sectionType): array
    {
        $common = [
            'content.limit' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'content.page_size' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];

        return match ($sectionType) {
            SectionType::PRODUCT_PREVIEW->value => array_merge($common, [
                ...$this->categoryRules(),
                'content.category_slug' => ['sometimes', 'string', 'max:255'],
                'content.category_slugs' => ['sometimes', 'array', 'max:100'],
                'content.category_slugs.*' => ['string', 'max:255'],
                'content.product_ids' => ['sometimes', 'array', 'max:100'],
                'content.product_ids.*' => ['integer', 'exists:products,id'],
                'content.product_limit' => ['sometimes', 'integer', 'min:1', 'max:100'],
            ]),
            SectionType::CATEGORY_PRODUCT_SHOWCASE->value => array_merge($common, [
                ...$this->categoryRules(),
                'content.category_slug' => ['sometimes', 'string', 'max:255'],
                'content.category_slugs' => ['sometimes', 'array', 'max:100'],
                'content.category_slugs.*' => ['required', 'array'],
                'content.category_slugs.*.slug' => ['required', 'string', 'max:255'],
                'content.category_slugs.*.image_url' => ['required', 'string', 'max:500'],
                'content.product_ids' => ['sometimes', 'array', 'max:100'],
                'content.product_ids.*' => ['integer', 'exists:products,id'],
                'content.product_limit' => ['sometimes', 'integer', 'min:1', 'max:100'],
            ]),
            SectionType::CATEGORY_SHORTCUTS->value => array_merge($common, [
                'content.items' => ['sometimes', 'array', 'max:100'],
                'content.items.*' => ['array'],
                'content.items.*.icon' => ['required', 'string', 'max:500'],
                'content.items.*.image_url' => ['sometimes', 'nullable', 'string', 'max:500'],
                'content.items.*.type' => ['sometimes', 'string', 'max:100'],
                'content.items.*.label' => ['required', 'string', 'max:255'],
                'content.items.*.link' => ['required', 'string', 'max:500'],
                'content.items.*.slug' => ['sometimes', 'string', 'max:255'],
            ]),
            SectionType::NOTICES_PREVIEW->value => array_merge($common, [
                'content.notice_ids' => ['sometimes', 'array', 'max:100'],
                'content.notice_ids.*' => ['integer', 'exists:media,id'],
            ]),
            SectionType::SECONDARY_BANNER->value => [
                'content.items' => ['sometimes', 'array', 'max:2'],
                'content.items.*' => ['array'],
                'content.items.*.name' => ['required', 'string', 'max:255'],
                'content.items.*.image' => ['required', 'string', 'max:500'],
                'content.items.*.link' => ['nullable', 'string', 'max:500'],
            ],
            SectionType::STEADY_SELLER->value => array_merge($common, [
                ...$this->categoryRules(),
                'content.category_slug' => ['sometimes', 'string', 'max:255'],
                'content.category_slugs' => ['sometimes', 'array', 'max:100'],
                'content.category_slugs.*' => ['string', 'max:255'],
                'content.product_ids' => ['sometimes', 'array', 'max:100'],
                'content.product_ids.*' => ['integer', 'exists:products,id'],
                'content.product_limit' => ['sometimes', 'integer', 'min:1', 'max:100'],
            ]),
            SectionType::FOOTER_QUICK_LINKS->value => [
                'content.items' => ['sometimes', 'array', 'size:3'],
                'content.items.*' => ['array'],
                'content.items.*.image' => ['required', 'string', 'max:500'],
            ],
            SectionType::FAQ_SECTION->value => array_merge($common, [
                'content.faq_ids' => ['sometimes', 'array', 'max:100'],
                'content.faq_ids.*' => ['integer', 'exists:faqs,id'],
            ]),
            SectionType::ABOUT_CTA->value => AboutCtaContentSchema::validationRules(),
            SectionType::PRODUCT_CATALOG->value => $common,
            SectionType::PRESS_PREVIEW->value => array_merge($common, [
                'content.media_ids' => ['sometimes', 'array', 'max:100'],
                'content.media_ids.*' => ['integer', 'exists:media,id'],
            ]),
            default => [],
        };
    }

    /** @return array<string, array<int, string>> */
    private function categoryRules(): array
    {
        $category = data_get($this->all(), 'content.category');

        if (is_array($category)) {
            return [
                'content.category' => ['sometimes', 'array', 'max:100'],
                'content.category.*' => ['string', 'max:255'],
            ];
        }

        return [
            'content.category' => ['sometimes', 'string', 'max:255'],
        ];
    }

    private function targetSection(): ?PageSection
    {
        if ($this->targetSection !== null) {
            return $this->targetSection;
        }

        $siteType = $this->route('siteType');
        $pageType = $this->route('pageType');
        $sectionType = $this->route('sectionType');

        if (! is_string($siteType) || ! is_string($pageType) || ! is_string($sectionType)) {
            return null;
        }

        return $this->targetSection = PageSection::query()
            ->where('section_type', $sectionType)
            ->whereHas('page', fn ($query) => $query
                ->where('site_type', $siteType)
                ->where('page_type', $pageType))
            ->first();
    }

    private function isBrandStoryHero(?PageSection $section): bool
    {
        return $section?->page()
            ->where('site_type', 'BRAND_SITE')
            ->where('page_type', 'brand_story')
            ->exists() ?? false;
    }
}
