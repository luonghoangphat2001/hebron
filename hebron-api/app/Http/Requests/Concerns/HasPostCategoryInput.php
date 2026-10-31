<?php

namespace App\Http\Requests\Concerns;

use App\Enums\PostCategoryPageType;
use Illuminate\Validation\Rule;

trait HasPostCategoryInput
{
    protected function prepareForValidation(): void
    {
        if ($this->has('category') && ! $this->has('category_id') && is_numeric($this->input('category'))) {
            $input = $this->all();
            unset($input['category']);
            $this->replace($input + ['category_id' => (int) $this->input('category')]);
        }
    }

    protected function postCategoryIdRules(PostCategoryPageType $pageType): array
    {
        return [
            'sometimes',
            'nullable',
            'integer',
            Rule::exists('post_categories', 'id')->where('page_type', $pageType->value),
        ];
    }
}
