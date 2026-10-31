<?php

namespace App\Http\Requests\Admin\ProductOptionGroup;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class AdminProductOptionGroupExportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'export_type' => ['required', 'string', Rule::in(['ALL', 'CURRENT_PAGE', 'SELECTED'])],
            'selected_ids' => [
                'required_if:export_type,SELECTED',
                'array',
                'min:1',
            ],
            'selected_ids.*' => ['integer', 'exists:product_option_groups,id'],
            'locale' => ['nullable', 'string', Rule::in(['en', 'ko', 'ja'])],
            'current_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,CURRENT_PAGE', 'integer', 'min:1', 'max:100'],
            'code' => ['nullable', 'string', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
            'display_type' => ['nullable', 'string', 'in:select,radio,checkbox,color'],
            'is_required' => ['nullable', 'boolean'],
            'sort_by' => ['nullable', 'string', 'in:sort_order,name,created_at'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $booleanFields = ['is_required'];
        $data = [];

        foreach ($booleanFields as $field) {
            if ($this->has($field)) {
                $value = $this->input($field);
                if (is_string($value)) {
                    $data[$field] = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                }
            }
        }

        if (! empty($data)) {
            $this->merge($data);
        }
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
