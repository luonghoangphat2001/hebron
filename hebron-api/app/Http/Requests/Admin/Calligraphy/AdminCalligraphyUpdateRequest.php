<?php

namespace App\Http\Requests\Admin\Calligraphy;

use App\Enums\CalligraphyType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminCalligraphyUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image_path' => ['sometimes', 'required', 'string', 'max:500'],
            'type' => ['sometimes', 'required', Rule::enum(CalligraphyType::class)],
            'text' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }
}
