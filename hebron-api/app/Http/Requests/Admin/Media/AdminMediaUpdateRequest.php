<?php

namespace App\Http\Requests\Admin\Media;

use App\Enums\PostCategoryPageType;
use App\Http\Requests\Concerns\HasPostCategoryInput;
use App\Enums\SiteType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminMediaUpdateRequest extends FormRequest
{
    use HasPostCategoryInput;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['sometimes', 'nullable', 'integer'],
            'site_type' => ['sometimes', 'required', Rule::enum(SiteType::class)],
            'category_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('post_categories', 'id')->where(
                    'page_type',
                    PostCategoryPageType::MEDIA->value,
                ),
            ],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'file_path' => ['sometimes', 'nullable', 'string', 'max:500'],
            'thumbnail_path' => ['sometimes', 'nullable', 'string', 'max:500'],
            'url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'link_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
