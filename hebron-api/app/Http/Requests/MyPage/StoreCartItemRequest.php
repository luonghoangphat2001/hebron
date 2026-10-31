<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreCartItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by auth middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
            'design_group_id' => ['nullable', 'integer', 'exists:design_groups,id'],
            'order_design_content_id' => ['nullable', 'integer', 'exists:order_design_contents,id'],
            'quantity' => 'required|integer|min:1',
            'selected_options' => ['nullable', 'array'],
            'selected_options.*.group_id' => ['required_with:selected_options', 'integer', 'exists:product_option_groups,id'],
            'selected_options.*.option_id' => ['required_with:selected_options', 'integer', 'exists:product_options,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'product_id.required' => '상품을 선택해주세요.',
            'product_id.integer' => '상품 ID가 올바르지 않습니다.',
            'product_id.exists' => '선택한 상품을 찾을 수 없습니다.',
            'design_group_id.integer' => '디자인 그룹 ID가 올바르지 않습니다.',
            'design_group_id.exists' => '선택한 디자인 그룹을 찾을 수 없습니다.',
            'quantity.required' => '수량을 입력해주세요.',
            'quantity.integer' => '수량은 숫자여야 합니다.',
            'quantity.min' => '수량은 최소 1개 이상이어야 합니다.',
            'selected_options.required' => '옵션을 선택해주세요.',
            'selected_options.array' => '옵션 형식이 올바르지 않습니다.',
            'selected_options.*.group_id.required' => '그룹 ID를 선택해주세요.',
            'selected_options.*.group_id.integer' => '그룹 ID가 올바르지 않습니다.',
            'selected_options.*.group_id.exists' => '선택한 그룹을 찾을 수 없습니다.',
            'selected_options.*.option_id.required' => '옵션 ID를 선택해주세요.',
            'selected_options.*.option_id.integer' => '옵션 ID가 올바르지 않습니다.',
            'selected_options.*.option_id.exists' => '선택한 옵션을 찾을 수 없습니다.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->filled('design_group_id') && $this->filled('order_design_content_id')) {
                $message = 'design_group_id 또는 order_design_content_id 중 정확히 하나만 입력해야 합니다.';
                $validator->errors()->add('design_group_id', $message);
                $validator->errors()->add('order_design_content_id', $message);
            }
        });
    }

    /**
     * Handle a failed validation attempt.
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
