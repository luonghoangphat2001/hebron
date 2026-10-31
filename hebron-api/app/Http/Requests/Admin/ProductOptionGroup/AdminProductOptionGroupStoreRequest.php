<?php

namespace App\Http\Requests\Admin\ProductOptionGroup;

use App\Enums\ProductOptionGroupTab;
use App\Models\ProductOptionGroup;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminProductOptionGroupStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:150'],
            'display_type' => ['required', 'string', 'in:select,radio,checkbox'],
            'is_required' => ['nullable', 'boolean']
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Code is required.',
            'code.unique' => 'Code must be unique per product.',
            'name.required' => 'Name is required.',
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $code = $this->input('code');

            if ($code) {
                $exists = ProductOptionGroup::where('code', $code)
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('code', 'Code must be unique.');
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $booleanFields = ['is_required', 'info_icon_enabled'];
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
