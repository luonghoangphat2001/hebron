<?php

namespace App\Http\Requests\Payment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class WebhookRequest extends FormRequest
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
            'eventType' => ['nullable', 'string'],
            'data' => ['nullable', 'array'],
            'data.paymentKey' => ['nullable', 'string', 'max:255'],
            'data.orderId' => ['nullable', 'string', 'max:255'],
            'paymentKey' => ['nullable', 'string', 'max:255'],
            'orderId' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator): void {
            if (! $this->input('data.paymentKey') && ! $this->input('paymentKey')) {
                $validator->errors()->add('paymentKey', 'Toss paymentKey is required.');
            }
        });
    }
}
