<?php

namespace App\Http\Requests\Admin\UnitPrice;

use App\Enums\UnitPriceCategory;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminUnitPriceStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'erp_option_id' => ['nullable', 'integer', 'exists:erp_options,id'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'category' => ['required', 'string', 'in:'.implode(',', UnitPriceCategory::values())],
            'unit_price_tab' => ['nullable', 'string', 'max:100'],
            'unit_price_name' => ['required', 'string', 'max:255'],
            'combination_key' => ['nullable', 'string', 'max:100'],
            'combination_options' => ['nullable', 'array'],
            'applicable_estimate' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'items' => ['required', 'array'],
            'items.*.price_value' => ['required', 'numeric', 'min:0'],
            'items.*.raw_cost' => ['nullable', 'numeric', 'min:0'],
            'items.*.attributes' => ['nullable', 'array'],
            'items.*.quality_min' => ['nullable', 'integer', 'min:0'],
            'items.*.is_active' => ['boolean'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}