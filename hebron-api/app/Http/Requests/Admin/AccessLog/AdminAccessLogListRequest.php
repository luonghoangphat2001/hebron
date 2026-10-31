<?php

namespace App\Http\Requests\Admin\AccessLog;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminAccessLogListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'login_id' => ['nullable', 'string', 'max:255'],
            'ip_address' => ['nullable', 'string', 'max:45'],
            'event_type' => ['nullable', 'string', 'in:login,logout,login_failed'],
            'browser_info' => ['nullable', 'string', 'max:255'],
            'access_date_from' => ['nullable', 'date', 'date_format:Y-m-d'],
            'access_date_to' => ['nullable', 'date', 'date_format:Y-m-d', 'after_or_equal:access_date_from'],
            'connection_time_from' => ['nullable', 'date', 'date_format:Y-m-d H:i:s'],
            'connection_time_to' => ['nullable', 'date', 'date_format:Y-m-d H:i:s', 'after_or_equal:connection_time_from'],
            'show_abnormal_only' => ['nullable', 'boolean'],
            'sort_by' => ['nullable', 'string', 'in:login_id,ip_address,connection_time,access_date'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            // Pagination - Support both 'page' and 'current_page' for backward compatibility
            'page' => ['nullable', 'integer', 'min:1'],
            'current_page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalize: Use 'page' if provided, otherwise use 'current_page'
        $page = $this->input('page') ?? $this->input('current_page');
        $showAbnormalOnly = $this->input('show_abnormal_only');

        // Query-string booleans arrive as strings. Laravel's boolean rule
        // accepts 1/0 but not the common "true"/"false" string values.
        if (is_string($showAbnormalOnly)) {
            $normalized = strtolower($showAbnormalOnly);
            if ($normalized === 'true') {
                $showAbnormalOnly = true;
            } elseif ($normalized === 'false') {
                $showAbnormalOnly = false;
            }
        }

        $this->merge([
            'current_page' => $page,
            'show_abnormal_only' => $showAbnormalOnly,
        ]);
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
