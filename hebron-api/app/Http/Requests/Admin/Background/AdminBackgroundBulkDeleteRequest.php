<?php

namespace App\Http\Requests\Admin\Background;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminBackgroundBulkDeleteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'background_ids' => ['required', 'array', 'min:1'],
            'background_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('backgrounds', 'id')->whereNull('deleted_at'),
            ],
        ];
    }
}
