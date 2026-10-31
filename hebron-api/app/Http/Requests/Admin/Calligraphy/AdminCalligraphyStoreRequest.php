<?php

namespace App\Http\Requests\Admin\Calligraphy;

use App\Enums\CalligraphyType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminCalligraphyStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image_path' => ['required', 'string', 'max:500'],
            'type' => ['required', Rule::enum(CalligraphyType::class)],
            'text' => ['nullable', 'string', 'max:500'],
        ];
    }
}
