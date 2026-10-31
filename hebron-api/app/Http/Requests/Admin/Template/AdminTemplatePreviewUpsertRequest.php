<?php

namespace App\Http\Requests\Admin\Template;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminTemplatePreviewUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'side' => ['required', 'string', Rule::in(['front', 'back'])],
            'file' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'side.required' => 'Preview side is required.',
            'side.in' => 'Preview side must be front or back.',
            'file.required' => 'Preview image is required.',
            'file.image' => 'Preview file must be an image.',
            'file.mimes' => 'Allowed preview formats: jpeg, jpg, png, webp.',
            'file.max' => 'Preview image must not exceed 10MB.',
        ];
    }
}
