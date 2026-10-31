<?php

namespace App\Http\Requests\MyPage;

use App\Enums\InquiryCategory;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

class StoreInquiryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by auth middleware
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('attachments'))) {
            $this->merge([
                'attachments' => [$this->input('attachments')],
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $categoryValues = array_map(fn($case) => $case->value, InquiryCategory::cases());

        $rules = [
            'category' => [
                'required',
                'string',
                Rule::in($categoryValues),
            ],
            'product_id' => 'nullable|integer|exists:products,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_number' => 'nullable|string|max:50',
            'contact' => 'required|string|max:20',
        ];

        // Decide validation strategy based on how files are sent
        $rules['attachments'] = ['sometimes', 'array'];
        $rules['attachments.*'] = ['nullable'];
        $rules['attachments.*.file_path'] = ['sometimes', 'string'];
        $rules['attachments.*.file_name'] = ['sometimes', 'string'];
        $rules['attachments.*.file_size'] = ['sometimes', 'nullable', 'integer'];
        $rules['attachments.*.file_type'] = ['sometimes', 'nullable', 'string'];

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category.required' => '문의 카테고리를 선택해주세요.',
            'category.in' => '올바른 문의 카테고리를 선택해주세요.',
            'product_id.integer' => '상품 ID가 올바르지 않습니다.',
            'product_id.exists' => '선택한 상품을 찾을 수 없습니다.',
            'title.required' => '제목을 입력해주세요.',
            'title.max' => '제목은 :max자를 초과할 수 없습니다.',
            'content.required' => '문의 내용을 입력해주세요.',
            'contact.required' => '연락처를 입력해주세요.',
            'contact.max' => '연락처는 :max자를 초과할 수 없습니다.',
            'order_number.max' => '주문번호는 :max자를 초과할 수 없습니다.',


            'attachments.*.file' => '첨부파일이 올바른 파일 형식이 아닙니다.',
            'attachments.*.mimes' => '첨부파일은 PDF, JPEG, PNG 형식만 가능합니다.',
            'attachments.*.mimetypes' => '첨부파일의 MIME 타입이 올바르지 않습니다. PDF, JPEG, PNG 형식만 가능합니다.',
            'attachments.*.max' => '첨부파일 크기는 최대 5MB까지 가능합니다.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @return void
     *
     * @throws HttpResponseException
     */
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
