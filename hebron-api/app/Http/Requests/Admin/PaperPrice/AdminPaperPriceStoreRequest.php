<?php

namespace App\Http\Requests\Admin\PaperPrice;

use App\Enums\PaperSizeDivisionCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminPaperPriceStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper_id' => 'required|exists:papers,id',
            'paper_size_division_code' => [
                'required',
                'string',
                Rule::enum(PaperSizeDivisionCode::class),
            ],
            'supply_price' => 'required|numeric|min:0',
            'cost' => 'required|numeric|min:0',
            'is_hot_deal' => 'nullable|boolean',
        ];
    }
}
