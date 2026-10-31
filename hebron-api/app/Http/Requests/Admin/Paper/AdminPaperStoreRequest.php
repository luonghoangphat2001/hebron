<?php

namespace App\Http\Requests\Admin\Paper;

use App\Enums\PaperCategory;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rules\Enum;

class AdminPaperStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['required', new Enum(PaperCategory::class)],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'specification' => ['nullable', 'array'],
            'pattern' => ['nullable', 'string', 'max:100'],
            'paper_type_option_value_id' => ['nullable', 'integer'],
            'paper_color_option_value_id' => ['nullable', 'integer'],
            'paper_weight_option_value_id' => ['nullable', 'integer'],
            'is_active' => ['required', 'string', 'in:active,hidden'],
        ];
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
