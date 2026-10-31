<?php

namespace App\Http\Requests\Admin\PostCategory;

use Illuminate\Foundation\Http\FormRequest;

class AdminPostCategoryListRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'is_active' => ['nullable', 'boolean'],
            'keyword' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $value = $this->input('is_active');

        if (is_string($value)) {
            $this->merge([
                'is_active' => match (strtolower(trim($value))) {
                    'true' => true,
                    'false' => false,
                    default => $value,
                },
            ]);
        }
    }
}
