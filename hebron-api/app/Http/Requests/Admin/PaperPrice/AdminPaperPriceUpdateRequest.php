<?php

namespace App\Http\Requests\Admin\PaperPrice;

use App\Enums\PaperSizeDivisionCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminPaperPriceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper_id' => 'sometimes|exists:papers,id',
            'paper_size_division_code' => [
                'sometimes',
                'string',
                Rule::enum(PaperSizeDivisionCode::class),
            ],
            'supply_price' => 'sometimes|numeric|min:0',
            'cost' => 'sometimes|numeric|min:0',
            'is_hot_deal' => 'nullable|boolean',
        ];
    }
}
