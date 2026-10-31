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

class AdminFaqUpdateRequest extends FormRequest
{
    use HasPostCategoryInput;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['sometimes', 'string', 'max:100'],
            'category_id' => $this->postCategoryIdRules(PostCategoryPageType::FAQ),
            'question' => ['sometimes', 'string', 'max:500'],
            'answer' => ['sometimes', 'string'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'posting_status' => ['sometimes', 'string', 'in:exposed,non-exposed'],
            'exposure_target' => ['sometimes', 'nullable', 'array'],
            'exposure_target.*' => [new Enum(ExposureTarget::class)],
            'site_type' => ['sometimes', new Enum(SiteType::class)],
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
