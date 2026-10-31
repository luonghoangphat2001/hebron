<?php

namespace App\Http\Requests\Admin\CraftsmanshipValue;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CraftsmanshipValueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'title' => [$required, 'string', 'max:255'],
            'subtitle' => ['sometimes', 'nullable', 'string', 'max:255'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'description' => ['sometimes', 'nullable', 'string'],
            'button_label' => ['sometimes', 'nullable', 'string', 'max:100'],
            'product_ids' => ['sometimes', 'array', 'max:6'],
            'product_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('products', 'id')->whereNull('deleted_at'),
            ],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
