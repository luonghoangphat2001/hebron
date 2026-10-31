<?php

namespace App\Http\Requests\Admin\DeliveryTracking;

use Illuminate\Foundation\Http\FormRequest;

class AdminCreateDeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'order_number' => ['required', 'string', 'max:255'],
        ];
    }
}
