<?php

namespace App\Http\Requests\Admin\Background;

use Illuminate\Foundation\Http\FormRequest;

class AdminBackgroundUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image_path' => ['sometimes', 'string', 'max:500'],
        ];
    }
}
