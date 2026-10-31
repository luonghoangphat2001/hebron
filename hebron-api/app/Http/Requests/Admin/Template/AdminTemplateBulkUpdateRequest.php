<?php

namespace App\Http\Requests\Admin\Template;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminTemplateBulkUpdateRequest extends FormRequest
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
            'field' => ['required', 'string', Rule::in(['is_active'])],
            'value' => ['present', 'boolean'],
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
            'field.required' => '수정할 필드가 필요합니다.',
            'field.in' => '유효하지 않은 수정 필드입니다. (is_active)',
            'value.present' => '수정할 값이 필요합니다.',
            'value.boolean' => '상태 값은 true 또는 false여야 합니다.',
        ];
    }
}
