<?php

namespace App\Http\Requests\Payment;

use App\Enums\PaymentMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InitiatePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'order_number' => ['required', 'string', 'exists:orders,order_number'],
            'payment_method' => ['required', 'string', Rule::in(array_column(PaymentMethod::cases(), 'value'))],
            'bank_account_holder' => ['nullable', 'string', 'max:100'],
            'return_url' => ['nullable', 'url', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'order_number.required' => 'Order number is required.',
            'order_number.exists' => 'Order not found.',
            'payment_method.required' => 'Payment method is required.',
            'payment_method.in' => 'Invalid payment method.',
            'return_url.url' => 'Return URL must be a valid URL.',
        ];
    }
}
