<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminProductBulkUpdateRequest extends FormRequest
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
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_ids' => 'required|array|min:1|max:500',
            'product_ids.*' => 'required|integer|exists:products,id',

            // At least one updatable field must be present.
            'category_ids' => 'sometimes|array',
            'category_ids.*' => 'integer|exists:categories,id',

            'selling_price' => 'sometimes|nullable|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'sort_order' => 'sometimes|integer',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $updatable = ['category_ids', 'selling_price', 'stock_quantity', 'sort_order'];
            $hasAny = false;
            foreach ($updatable as $field) {
                if ($this->has($field)) {
                    $hasAny = true;
                    break;
                }
            }

            if (! $hasAny) {
                $validator->errors()->add(
                    'fields',
                    '수정할 필드를 최소 1개 이상 입력해주세요. (category_ids, selling_price, stock_quantity, sort_order)'
                );
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'product_ids.required' => '최소 1개 이상의 제품 ID가 필요합니다.',
            'product_ids.array' => '제품 ID는 배열 형태여야 합니다.',
            'product_ids.min' => '최소 1개 이상의 제품 ID가 필요합니다.',
            'product_ids.max' => '한 번에 최대 500개까지 수정할 수 있습니다.',
            'product_ids.*.required' => '제품 ID가 필요합니다.',
            'product_ids.*.integer' => '제품 ID는 정수여야 합니다.',
            'product_ids.*.exists' => '존재하지 않는 제품 ID가 포함되어 있습니다.',
            'category_ids.*.exists' => '존재하지 않는 카테고리 ID가 포함되어 있습니다.',
            'selling_price.numeric' => '판매가는 숫자여야 합니다.',
            'selling_price.min' => '판매가는 0 이상이어야 합니다.',
            'stock_quantity.integer' => '재고 수량은 정수여야 합니다.',
            'stock_quantity.min' => '재고 수량은 0 이상이어야 합니다.',
            'sort_order.integer' => '정렬 순서는 정수여야 합니다.',
        ];
    }
}
