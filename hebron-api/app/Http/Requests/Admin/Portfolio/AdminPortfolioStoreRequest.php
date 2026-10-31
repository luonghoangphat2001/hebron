<?php

namespace App\Http\Requests\Admin\Portfolio;

use App\Enums\SiteType;
use App\Enums\PostCategoryPageType;
use App\Http\Requests\Concerns\HasPostCategoryInput;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class AdminPortfolioStoreRequest extends FormRequest
{
    use HasPostCategoryInput;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'site_type' => ['nullable', new Enum(SiteType::class)],
            'client' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:120'],
            'category_id' => $this->postCategoryIdRules(PostCategoryPageType::PORTFOLIO),
            'year' => ['nullable', 'integer', 'min:1900', 'max:2200'],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string', 'max:500'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['string', 'max:500'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
