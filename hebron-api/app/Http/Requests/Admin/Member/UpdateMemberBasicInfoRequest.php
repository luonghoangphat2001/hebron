<?php

namespace App\Http\Requests\Admin\Member;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberBasicInfoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();
        $isBusiness = $this->input('member_type') === 'business';

        return [
            // Member type
            'member_type' => 'sometimes|string|in:individual,business',

            // Basic Information
            'username' => 'sometimes|string|unique:users,username|min:4|max:50|regex:/^[a-zA-Z0-9_]+$/',
            'password' => 'sometimes|string|min:6|max:20|regex:/^(?=.*[a-zA-Z])[A-Za-z\d!@#$%^&*_]+$/',
            'name' => 'sometimes|required|string|max:100',
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => 'nullable|string|max:20|regex:/^[0-9-]+$/',
            'mobile' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[0-9-]+$/',
                Rule::unique('users', 'mobile')->ignore($user->id),
            ],
            

            // Address Information (개인)
            'postcode' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:255',
            'detailed_address' => 'nullable|string|max:255',

            // Business Information — maps to Customer record (기업회원 전용)
            'company_name' => $isBusiness ? 'sometimes|string|max:200' : 'nullable|string|max:200',
            'business_registration_number' => $isBusiness
                ? 'sometimes|string|max:20|unique:users,business_registration_number'
                : 'nullable|string|max:20',
            'representative_name' => $isBusiness ? 'sometimes|string|max:100' : 'nullable|string|max:100',
            'industry_type' => 'nullable|string|max:100',
            'business_type' => 'nullable|string|max:100',
            'business_postcode' => $isBusiness ? 'sometimes|string|max:10' : 'nullable|string|max:10',
            'business_address' => $isBusiness ? 'sometimes|string|max:255' : 'nullable|string|max:255',
            'business_address_detail' => 'nullable|string|max:255',
            'tax_invoice_email' => 'nullable|email|max:255',
            'homepage_url' => 'nullable|url|max:255',
            'business_registration_file' => $isBusiness ? 'sometimes|string|max:255' : 'nullable|string|max:255',

            // Terms Agreement
            'agree_privacy' => 'sometimes|accepted',
            'agree_terms' => 'sometimes|accepted',
            'agree_sms' => 'sometimes|in:true,false,1,0',
            'agree_email' => 'sometimes|in:true,false,1,0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => '이름은 필수입니다.',
            'email.required' => '이메일은 필수입니다.',
            'email.email' => '올바른 이메일 형식이 아닙니다.',
            'email.unique' => '이미 사용 중인 이메일입니다.',
            'phone.regex' => '올바른 전화번호 형식이 아닙니다.',
            'mobile.regex' => '올바른 휴대폰 번호 형식이 아닙니다.',
        ];
    }
}
