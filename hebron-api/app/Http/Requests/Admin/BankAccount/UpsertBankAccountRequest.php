<?php

namespace App\Http\Requests\Admin\BankAccount;

use Illuminate\Foundation\Http\FormRequest;

class UpsertBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_name' => ['required', 'string', 'max:100'],
            'account_number' => ['required', 'string', 'max:50'],
            'account_holder' => ['required', 'string', 'max:100'],
            'qr_url' => ['nullable', 'url', 'max:500'],
        ];
    }
}
