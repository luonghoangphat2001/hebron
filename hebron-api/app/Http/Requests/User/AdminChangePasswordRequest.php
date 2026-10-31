<?php

namespace App\Http\Requests\User;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'password' => [
                'required',
                'string',
                'min:6',
                'max:20',
                'regex:/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]+$/',
                'confirmed',
            ],
            'password_confirmation' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'password.required' => '비밀번호를 입력해주세요.',
            'password.min' => '비밀번호는 최소 :min자 이상이어야 합니다.',
            'password.max' => '비밀번호는 최대 :max자를 초과할 수 없습니다.',
            'password.regex' => '비밀번호는 영문/숫자를 포함해야 합니다.',
            'password.confirmed' => '비밀번호 확인이 일치하지 않습니다.',
            'password_confirmation.required' => '비밀번호 확인을 입력해주세요.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => '입력값이 올바르지 않습니다.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
