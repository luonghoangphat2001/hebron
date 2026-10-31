<?php

namespace App\Http\Requests\Design;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDesignRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'layout_data' => ['sometimes', 'array'],
            'layout_s3_path' => ['sometimes', 'string'],
            'logo_path' => ['sometimes', 'string'],
            'metadata' => ['sometimes', 'array'],
            'preview_image_path' => ['sometimes', 'string'],
        ];
    }
}
