<?php

namespace App\Http\Requests\Admin\Inquiry;

use Illuminate\Foundation\Http\FormRequest;

class AdminInquiryStatisticsRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'customer_ids' => 'nullable|array',
            'customer_ids.*' => 'exists:customers,id',
            'period' => 'nullable|string|in:7d,30d,90d,365d',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ];
    }
}
