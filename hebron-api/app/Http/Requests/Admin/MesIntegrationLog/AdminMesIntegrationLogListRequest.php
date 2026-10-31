<?php

namespace App\Http\Requests\Admin\MesIntegrationLog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminMesIntegrationLogListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'direction' => ['nullable', Rule::in(\App\Enums\MesIntegrationDirection::values())],
            'status' => ['nullable', Rule::in(\App\Enums\MesIntegrationStatus::values())],
            'trigger_type' => ['nullable', Rule::in(\App\Enums\MesTriggerType::values())],
            'keyword' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'direction.in' => 'Direction must be either outbound or inbound.',
            'status.in' => 'Status must be either success or failed.',
            'trigger_type.in' => 'Invalid trigger type.',
            'end_date.after_or_equal' => 'End date must be after or equal to start date.',
        ];
    }
}