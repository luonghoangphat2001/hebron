<?php

namespace App\Http\Requests\Admin\EmailSetting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmailSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'sender_email' => ['required', 'email', 'max:255'],
            'sender_name' => ['nullable', 'string', 'max:255'],
            'receiver_emails' => ['required', 'array', 'min:1'],
            'receiver_emails.*' => ['required', 'email', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'sender_email.required' => '발신자 이메일 주소를 입력해주세요.',
            'sender_email.email' => '유효한 발신자 이메일 형식이 아닙니다.',
            'receiver_emails.required' => '수신자 이메일 주소를 1개 이상 입력해주세요.',
            'receiver_emails.array' => '수신자 이메일 목록은 배열 형식이어야 합니다.',
            'receiver_emails.min' => '수신자 이메일 주소를 1개 이상 입력해주세요.',
            'receiver_emails.*.required' => '수신자 이메일 주소를 입력해주세요.',
            'receiver_emails.*.email' => '유효한 수신자 이메일 형식이 아닙니다.',
        ];
    }
}
