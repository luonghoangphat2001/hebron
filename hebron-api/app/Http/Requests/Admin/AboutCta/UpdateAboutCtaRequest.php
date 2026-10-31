<?php

namespace App\Http\Requests\Admin\AboutCta;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAboutCtaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['sometimes', 'array'],
            'content.item' => ['sometimes', 'nullable', 'array', 'max:20'],
            'content.item.*' => ['required', 'array:product_id,image'],
            'content.item.*.product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where('is_active', true),
            ],
            'content.item.*.image' => ['required', 'nullable', 'string', 'max:500'],
        ];
    }
}
