<?php

namespace App\Http\Requests\Brand;

use App\Enums\BudgetType;
use App\Enums\ProductType;
use App\Enums\QuantityType;
use App\Enums\SiteType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductionInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (!is_array($this->input('attachments'))) {
            return;
        }

        $attachments = [];
        foreach ($this->input('attachments') as $attachment) {
            if (blank($attachment)) {
                continue;
            }

            if (is_string($attachment)) {
                $attachments[] = ['file_path' => $attachment];
                continue;
            }

            $attachments[] = [
                'file_path' => $attachment['file_path'] ?? $attachment['path'] ?? $attachment['url'] ?? null,
                'file_name' => $attachment['file_name'] ?? $attachment['name'] ?? null,
                'file_size' => $attachment['file_size'] ?? $attachment['size'] ?? null,
                'file_type' => $attachment['file_type'] ?? $attachment['mime_type'] ?? null,
            ];
        }

        $this->merge(['attachments' => $attachments]);
    }

    protected function attachmentRules(): array
    {
        return [
            'attachments' => ['sometimes', 'array'],
            'attachments.*' => ['array'],
            'attachments.*.file_path' => ['required', 'string', 'max:500'],
            'attachments.*.file_name' => ['sometimes', 'string', 'max:255'],
            'attachments.*.file_size' => ['sometimes', 'nullable', 'integer'],
            'attachments.*.file_type' => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'manager_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'product_type' => ['required', 'string', Rule::in(ProductType::values())],
            'site_type' => ['required', 'string', Rule::in(SiteType::values())],
            'quantity_type' => ['required', 'string', Rule::in(QuantityType::values())],
            'deadline' => ['required', 'date'],
            'budget_type' => ['required', 'string', Rule::in(BudgetType::values())],
            'message' => ['required', 'string', 'max:5000'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            ...$this->attachmentRules(),
        ];
    }
}
