<?php

namespace App\Http\Requests\Admin\ExampleSentenceSample;

use App\Enums\PostCategoryPageType;
use App\Http\Requests\Concerns\HasPostCategoryInput;
use Illuminate\Foundation\Http\FormRequest;

class AdminExampleSentenceSampleUpdateRequest extends FormRequest
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
            'category_id' => $this->postCategoryIdRules(PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE),
            'title' => ['sometimes', 'string', 'max:255'],
            'board_category_no' => ['sometimes', 'integer', 'min:0'],
            'content' => ['sometimes', 'string'],
            'attachments' => ['sometimes', 'array'],
            'attachments.*' => ['array'],
            'attachments.*.no' => ['nullable', 'integer'],
            'attachments.*.name' => ['nullable', 'string', 'max:255'],
            'attachments.*.url' => ['nullable', 'string', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ];
    }
}
