<?php

namespace App\Http\Requests\Admin\Faq;

use App\Enums\ExposureTarget;
use App\Enums\PostCategoryPageType;
use App\Enums\SiteType;
use App\Http\Requests\Concerns\HasPostCategoryInput;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rules\Enum;

class AdminFaqStoreRequest extends FormRequest
{
    use HasPostCategoryInput;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['required_without:category_id', 'nullable', 'string', 'max:100'],
            'category_id' => $this->postCategoryIdRules(PostCategoryPageType::FAQ),
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'posting_status' => ['required', 'string', 'in:exposed,non-exposed'],
            'exposure_target' => ['nullable', 'array'],
            'exposure_target.*' => [new Enum(ExposureTarget::class)],
            'site_type' => ['required', new Enum(SiteType::class)],
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
