<?php

namespace App\Http\Requests\Admin\ExampleSentenceSample;

use Illuminate\Foundation\Http\FormRequest;

class AdminExampleSentenceSampleListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'keyword' => ['nullable', 'string', 'max:255'],
            'board_category_no' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        foreach (['is_active', 'is_featured'] as $field) {
            if (! is_string($this->input($field))) {
                continue;
            }

            $this->merge([$field => match (strtolower(trim($this->input($field)))) {
                'true' => true,
                'false' => false,
                default => $this->input($field),
            }]);
        }
    }
}
