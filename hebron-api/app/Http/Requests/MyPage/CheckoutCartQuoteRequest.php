<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class CheckoutCartQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    
    public function rules(): array
    {
        return [
            'item_ids' => 'nullable|array|min:1',
            'item_ids.*' => 'integer|exists:cart_items,id',
        ];
    }
}