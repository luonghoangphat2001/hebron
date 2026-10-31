<?php

namespace App\Http\Requests\Payment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TossConfirmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validate payload sent from FE after Toss redirects back.
     * The API uses orderNumber to make it explicit that this is orders.order_number.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'paymentKey' => ['required', 'string', 'max:255'],
            'orderNumber' => ['required', 'string', 'exists:orders,order_number'],
            'amount' => ['required', 'integer', 'min:1'],
        ];
    }
}
