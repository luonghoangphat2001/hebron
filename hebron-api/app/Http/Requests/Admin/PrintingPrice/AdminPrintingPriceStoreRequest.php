<?php

namespace App\Http\Requests\Admin\PrintingPrice;

use App\Enums\MachineType;
use App\Enums\BookPrintingSizeType;
use App\Enums\PrintSideType;
use App\Enums\BookPrintingType;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminPrintingPriceStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'machine_type' => ['required', 'string', 'in:' . implode(',', MachineType::values())],
            'book_printing_size_type' => ['required', 'string', 'in:' . implode(',', BookPrintingSizeType::values())],
            'side_type' => ['required', 'string', 'in:' . implode(',', PrintSideType::values())],
            'name' => ['required', 'string', 'max:255'],
            'book_printing_type' => ['required', 'string', 'in:' . implode(',', BookPrintingType::values())],
            'is_hot_deal' => ['boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.supply_price' => ['required', 'integer', 'min:0'],
            'items.*.cost' => ['required', 'integer', 'min:0'],
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