<?php

namespace App\Http\Requests\Admin\SettlementReport;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminSettlementReportExportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'export_type' => ['required', 'string', Rule::in(['ALL', 'CURRENT_PAGE', 'SELECTED'])],
            'selected_ids' => ['required_if:export_type,SELECTED', 'array', 'min:1'],
            // Selected report rows are identified by payment transaction_id, not the model id.
            'selected_ids.*' => ['string', 'exists:payment_transactions,transaction_id'],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
            'search_term' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:50'],
            'inquiry_type' => ['nullable', 'string', 'max:50'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'inquirer_name' => ['nullable', 'string', 'max:255'],
            'assigned_to' => ['nullable', 'integer'],
            'created_from' => ['nullable', 'date'],
            'created_to' => ['nullable', 'date', 'after_or_equal:created_from'],
            'has_attachment' => ['nullable', 'boolean'],
            'sort_by' => ['nullable', 'string', 'in:created_at,updated_at'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            // Keep the report endpoint compatible with the existing date filter names.
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'start_date' => $this->input('start_date') ?? $this->input('created_from'),
            'end_date' => $this->input('end_date') ?? $this->input('created_to'),
        ]);
    }
}
