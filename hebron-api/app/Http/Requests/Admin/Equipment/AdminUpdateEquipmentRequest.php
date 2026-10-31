<?php

namespace App\Http\Requests\Admin\Equipment;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => 'sometimes|required|string|max:255',
            'name'         => 'sometimes|required|string|max:255',
            'image'        => 'nullable|string|max:500',
            'work_process' => 'sometimes|required|string|in:coating,cutting,output,printing',
            'work_type'    => 'nullable|string|max:255',
            'status'       => 'nullable|string|in:active,inactive,maintenance',
            'notes'        => 'nullable|string',
        ];
    }
}
