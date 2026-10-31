<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validation for reorder creation.
 * Validates the source order number from the URL path.
 */
class CreateReOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * User authentication is handled by middleware, this just returns true.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get validation rules for reorder creation.
     */
    public function rules(): array
    {
        return [
            // Order number validation from route path parameter.
            'orderNumber' => [
                'required',
                'string',
                'max:100',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'orderNumber.required' => 'Order number is required.',
            'orderNumber.max' => 'Order number cannot exceed 100 characters.',
        ];
    }

    /**
     * Merge route parameters into validation data.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'orderNumber' => $this->route('orderNumber'),
        ]);
    }
}
