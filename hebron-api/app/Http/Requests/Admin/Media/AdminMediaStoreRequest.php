<?php

namespace App\Http\Requests\Admin\Media;

use App\Enums\PostCategoryPageType;
use App\Enums\SiteType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminMediaStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'site_type' => ['nullable', Rule::enum(SiteType::class)],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('post_categories', 'id')->where(
                    'page_type',
                    PostCategoryPageType::MEDIA->value,
                ),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file_path' => ['nullable', 'string', 'max:500'],
            'thumbnail_path' => ['nullable', 'string', 'max:500'],
            'url' => ['nullable', 'url', 'max:500'],
            'link_url' => ['nullable', 'url', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
