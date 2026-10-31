<?php

namespace App\Http\Requests\Admin\Notice;

use App\Enums\SiteType;
use App\Enums\PostCategoryPageType;
use App\Http\Requests\Concerns\HasPostCategoryInput;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminNoticeUpdateRequest extends FormRequest
{
    use HasPostCategoryInput;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['sometimes', 'nullable', 'integer'],
            'category_id' => $this->postCategoryIdRules(PostCategoryPageType::NOTICE),
            'site_type' => ['sometimes', 'in:'.implode(',', SiteType::values())],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'required', 'string'],
            'type' => ['nullable', 'string', 'max:50'],
            'attachments' => ['nullable', 'array'],
            'attachments.*.key' => ['required_with:attachments', 'string'],
            'attachments.*.name' => ['required_with:attachments', 'string'],
            'attachments.*.url' => ['required_with:attachments', 'string'],
            'attachments.*.size' => ['required_with:attachments', 'integer'],
            'is_pinned' => ['nullable', 'boolean'],
            'exposure_status' => ['sometimes', 'required', 'string', 'in:exposed,non-exposed'],
            'exposure_target' => ['nullable', 'array'],
            'exposure_target.*' => ['nullable', 'string'],
            'exposure_location' => ['sometimes', 'required', 'string', 'in:main,login,dashboard'],
            // Accept datetime string (Y-m-d H:i:s or ISO 8601 UTC). Laravel/Carbon will parse and format when saving.
            'exposure_start_date' => ['nullable', 'date'],
            'exposure_end_date' => ['nullable', 'date', 'after_or_equal:exposure_start_date'],
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
