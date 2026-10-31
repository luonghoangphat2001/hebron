<?php

namespace App\Http\Requests\Inquiry;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class InquiryOrderDetailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'order_number' => ['required', 'string', 'max:100'],
            'mobile_phone' => ['sometimes', 'nullable', 'string', 'max:50'],
        ];
    }
}
