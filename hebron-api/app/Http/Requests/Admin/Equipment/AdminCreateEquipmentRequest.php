<?php

namespace App\Http\Requests\Admin\Equipment;

use Illuminate\Foundation\Http\FormRequest;

class AdminCreateEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => 'required|string|max:255',
            'name'         => 'required|string|max:255',
            'image'        => 'nullable|string|max:500',
            'work_process' => 'required|string|in:coating,cutting,output,printing',
            'work_type'    => 'nullable|string|max:255',
            'status'       => 'nullable|string|in:active,inactive,maintenance',
            'notes'        => 'nullable|string',
        ];
    }
}
