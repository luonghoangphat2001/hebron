<?php

namespace App\Http\Requests\MyPage;

use App\Enums\InquiryCategory;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('attachments'))) {
            $this->merge([
                'attachments' => [$this->input('attachments')],
            ]);
        }
    }

    public function rules(): array
    {
        $categoryValues = array_map(fn ($case) => $case->value, InquiryCategory::cases());

        $rules = [
            'category' => ['sometimes', 'required', 'string', Rule::in($categoryValues)],
            'product_id' => ['sometimes', 'nullable', 'integer', 'exists:products,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'required', 'string'],
            'order_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'contact' => ['sometimes', 'required', 'string', 'max:20'],
        ];

        $rules['attachments'] = ['sometimes', 'array'];
        $rules['attachments.*'] = ['nullable'];
        $rules['attachments.*.file_path'] = ['sometimes', 'string'];
        $rules['attachments.*.file_name'] = ['sometimes', 'string'];
        $rules['attachments.*.file_size'] = ['sometimes', 'nullable', 'integer'];
        $rules['attachments.*.file_type'] = ['sometimes', 'nullable', 'string'];

        return $rules;
    }

    protected function failedValidation(Validator $validator)
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
