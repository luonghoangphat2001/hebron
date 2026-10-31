<?php

namespace App\Http\Requests\Admin\ProductOption;

use App\Models\ProductOption;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminProductOptionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'option_group_id' => ['required', 'integer', 'exists:product_option_groups,id'],
            'name' => ['required', 'string', 'max:255'],
            'additional_price' => ['nullable', 'numeric', 'min:0'],
            'additional_brand_site_price' => ['nullable', 'numeric', 'min:0'],
            'additional_plain_site_price' => ['nullable', 'numeric', 'min:0'],
            'metadata' => ['nullable', 'array'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'option_group_id.required' => 'Option group ID is required.',
            'name.required' => 'Name is required.',
            'value.required' => 'Value is required.',
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $optionGroupId = $this->input('option_group_id');
            $value = $this->input('value');

            if ($optionGroupId && $value) {
                $exists = ProductOption::withTrashed()
                    ->where('option_group_id', $optionGroupId)
                    ->where('value', $value)
                    ->first();

                if ($exists) {
                    if ($exists->deleted_at === null) {
                        $validator->errors()->add('value', 'Value must be unique per option group.');
                    } else {
                        $validator->errors()->add('value', 'A soft-deleted option with this value already exists.');
                    }
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $fields = ['is_active'];
        $data = [];

        foreach ($fields as $field) {
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
