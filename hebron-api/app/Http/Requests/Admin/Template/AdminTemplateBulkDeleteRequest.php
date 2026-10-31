<?php

namespace App\Http\Requests\Admin\Template;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminTemplateBulkDeleteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'template_ids' => 'required|array|min:1',
            'template_ids.*' => 'required|integer|exists:templates,id',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'template_ids.required' => '최소 1개 이상의 템플릿 ID가 필요합니다.',
            'template_ids.array' => '템플릿 ID는 배열 형태여야 합니다.',
            'template_ids.min' => '최소 1개 이상의 템플릿 ID가 필요합니다.',
            'template_ids.*.required' => '템플릿 ID가 필요합니다.',
            'template_ids.*.integer' => '템플릿 ID는 정수여야 합니다.',
            'template_ids.*.exists' => '존재하지 않는 템플릿 ID가 포함되어 있습니다.',
        ];
    }
}
