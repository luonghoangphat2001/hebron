<?php

namespace App\Http\Requests\Admin\Order;

use App\Enums\OrderStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminOrderBulkChangeStatusRequest extends FormRequest
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
        $orderStatusValues = array_map(fn ($case) => $case->value, OrderStatus::cases());

        return [
            'order_numbers' => ['required', 'array'],
            'order_numbers.*' => ['required', 'string'],
            'status' => ['required', 'string', 'in:'.implode(',', $orderStatusValues)],
            'reason' => ['required', 'string'],
        ];
    }
}
