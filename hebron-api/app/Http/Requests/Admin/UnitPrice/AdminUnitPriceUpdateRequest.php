<?php

namespace App\Http\Requests\Admin\UnitPrice;

use App\Enums\UnitPriceCategory;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class AdminUnitPriceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'erp_option_id' => ['nullable', 'integer'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'category' => ['sometimes', 'required', 'string', 'in:' . implode(',', UnitPriceCategory::values())],
            'unit_price_tab' => ['nullable', 'string', 'max:100'],
            'unit_price_name' => ['sometimes', 'required', 'string', 'max:255'],
            'unit_price_key' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('unit_prices', 'unit_price_key')->ignore($this->route('id')),
            ],
            'combination_key' => ['nullable', 'string', 'max:100'],
            'combination_options' => ['nullable', 'array'],
            'applicable_estimate' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'items' => ['nullable', 'array'],
            'items.*.price_value' => ['required_with:items', 'numeric', 'min:0'],
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
