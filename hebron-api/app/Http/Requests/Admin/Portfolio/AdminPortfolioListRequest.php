<?php

namespace App\Http\Requests\Admin\Portfolio;

use App\Enums\SiteType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class AdminPortfolioListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['nullable', 'string', 'max:120'],
            'title' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:2200'],
            'is_active' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'site_type' => ['nullable', new Enum(SiteType::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $booleanFilters = [];

        foreach (['is_active', 'is_featured'] as $field) {
            $value = $this->input($field);

            if (! is_string($value)) {
                continue;
            }

            $booleanFilters[$field] = match (strtolower(trim($value))) {
                'true' => true,
                'false' => false,
                default => $value,
            };
        }

        if ($booleanFilters !== []) {
            $this->merge($booleanFilters);
        }
    }
}
