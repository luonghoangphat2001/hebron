<?php

namespace App\Http\Requests\Design;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveLayoutRequest extends FormRequest
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
            'layout_data' => [
                Rule::requiredIf(function () {
                    return $this->input('format') !== 'svg';
                }),
                'array',
            ],
            'svg_content' => [
                Rule::requiredIf(function () {
                    return $this->input('format') === 'svg';
                }),
                'string',
            ],
            'format' => ['sometimes', 'string', 'in:json,svg'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'layout_data.required' => 'Layout data is required when format is json',
            'layout_data.array' => 'Layout data must be an array',
            'svg_content.required' => 'SVG content is required when format is svg',
            'svg_content.string' => 'SVG content must be a string',
            'format.in' => 'Format must be either json or svg',
        ];
    }
}
