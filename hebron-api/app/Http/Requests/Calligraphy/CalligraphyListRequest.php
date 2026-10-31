<?php

namespace App\Http\Requests\Calligraphy;

use App\Enums\CalligraphyType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CalligraphyListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['nullable', Rule::enum(CalligraphyType::class)],
            'search' => ['nullable', 'string', 'max:500'],
            'sort_by' => ['nullable', 'string', 'in:created_at,updated_at'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
