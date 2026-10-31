<?php

namespace App\Http\Requests\Admin\Calligraphy;

use App\Enums\CalligraphyType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminCalligraphyBulkUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'calligraphy_ids' => ['required', 'array', 'min:1'],
            'calligraphy_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('calligraphies', 'id')->whereNull('deleted_at'),
            ],
            'field' => ['required', 'string', Rule::in(['type'])],
            'value' => ['required', Rule::enum(CalligraphyType::class)],
        ];
    }
}
