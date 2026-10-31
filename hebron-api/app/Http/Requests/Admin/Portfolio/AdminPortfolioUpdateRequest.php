<?php

namespace App\Http\Requests\Admin\Portfolio;

use App\Enums\PostCategoryPageType;
use App\Http\Requests\Concerns\HasPostCategoryInput;

class AdminPortfolioUpdateRequest extends AdminPortfolioStoreRequest
{
    use HasPostCategoryInput;

    public function rules(): array
    {
        $rules = parent::rules();
        $rules['category_id'] = $this->postCategoryIdRules(PostCategoryPageType::PORTFOLIO);

        foreach ($rules as $field => $fieldRules) {
            $rules[$field] = $field === 'title'
                ? ['sometimes', 'string', 'max:255']
                : array_merge(['sometimes'], $fieldRules);
        }

        return $rules;
    }
}
