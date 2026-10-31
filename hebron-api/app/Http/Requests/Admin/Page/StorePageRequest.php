<?php

namespace App\Http\Requests\Admin\Page;

use App\Enums\SiteType;
use App\Enums\PageType;
use App\Enums\SectionType;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StorePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();
        foreach (['metadata', 'sections'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $decoded = json_decode($data[$field], true);
                if (json_last_error() === JSON_ERROR_NONE) $data[$field] = $decoded;
            }
        }
        if (isset($data['sections']) && is_array($data['sections'])) {
            foreach ($data['sections'] as &$section) {
                foreach (['content', 'metadata'] as $field) {
                    if (isset($section[$field]) && is_string($section[$field])) {
                        $decoded = json_decode($section[$field], true);
                        if (json_last_error() === JSON_ERROR_NONE) $section[$field] = $decoded;
                    }
                }
            }
        }
        $this->replace($data);
    }
    public function rules(): array
    {
        return [
            'site_type' => ['nullable', new Enum(SiteType::class)],
            'page_type' => [
                'required',
                Rule::in(PageType::valuesForSite($this->input('site_type', SiteType::BRAND_SITE->value))),
            ],
            'slug' => 'required|string|max:120',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'metadata' => 'nullable|array',
            'sections' => 'nullable|array',
            'sections.*.id' => 'nullable|integer',
            'sections.*.section_type' => ['required', new \Illuminate\Validation\Rules\Enum(SectionType::class)],
            'sections.*.title' => 'nullable|string|max:255',
            'sections.*.description' => 'nullable|string',
            'sections.*.subtitle' => 'nullable|string|max:255',
            'sections.*.content' => 'nullable|array',
            'sections.*.image' => 'nullable|string|max:500',
            'sections.*.link' => 'nullable|string|max:500',
            'sections.*.sort_order' => 'nullable|integer|min:0',
            'sections.*.is_active' => 'nullable|boolean',
            'sections.*.metadata' => 'nullable|array',
        ];
    }
}
