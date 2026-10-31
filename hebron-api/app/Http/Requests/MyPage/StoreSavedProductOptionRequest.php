<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreSavedProductOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
            'product_quantity_price_id' => 'nullable|integer|exists:product_quantity_prices,id',
            'order_name' => 'nullable|string|max:255',
            'summary_text' => 'nullable|string|max:2000',
            'detail' => 'nullable|array',
            'design_id' => ['nullable', 'integer', Rule::excludeIf(fn () => is_array($this->input('design_ids')))],
            'design_ids' => 'nullable|array',
            'design_ids.front' => 'nullable|integer',
            'design_ids.back' => 'nullable|integer',
            'design_ids.file' => 'nullable|integer',
            'quantity' => 'required|integer|min:1',
            'number_of_cases' => 'nullable|numeric|min:0.01',
            'options' => 'nullable|array',
            'notes' => 'nullable|string|max:500',
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
