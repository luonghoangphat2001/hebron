<?php

namespace App\Http\Requests\Design;

use Illuminate\Foundation\Http\FormRequest;

class StoreDesignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'layout_data' => ['nullable', 'array'],
            'layout_s3_path' => ['nullable', 'string'],
            'logo_path' => ['nullable', 'string'],
            'preview_image_path' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ];

        return $rules;
    }
}
