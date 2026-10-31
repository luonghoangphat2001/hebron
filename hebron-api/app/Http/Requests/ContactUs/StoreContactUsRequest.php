<?php

namespace App\Http\Requests\ContactUs;

use App\Enums\ProductType;
use App\Enums\SiteType;
use App\Http\Requests\Brand\StoreProductionInquiryRequest;
use Illuminate\Validation\Rule;

class StoreContactUsRequest extends StoreProductionInquiryRequest
{
    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'manager_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'product_type' => ['required', 'string', Rule::in(ProductType::values())],
            'site_type' => ['required', 'string', Rule::in(SiteType::values())],
            'message' => ['required', 'string', 'max:500'],
            ...$this->attachmentRules(),
        ];
    }

    protected function attachmentRules(): array
    {
        return [
            'attachments' => ['nullable', 'array', 'min:1'],
            'attachments.*' => ['array'],
            'attachments.*.file_path' => ['required', 'url', 'max:500'],
            'attachments.*.file_name' => ['sometimes', 'string', 'max:255'],
            'attachments.*.file_size' => ['sometimes', 'nullable', 'integer'],
            'attachments.*.file_type' => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }
}
