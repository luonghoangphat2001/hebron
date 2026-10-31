<?php

namespace App\Http\Requests\Admin\Background;

use Illuminate\Foundation\Http\FormRequest;

class AdminBackgroundStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image_path' => ['required_without:file', 'nullable', 'string', 'max:500'],
            'file' => ['required_without:image_path', 'nullable', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:51200'],
        ];
    }
}
