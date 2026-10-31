<?php

namespace App\Http\Requests\Admin\Inquiry;

use App\Enums\NotificationChannel;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUpdateInquiryReplyRequest extends FormRequest
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
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'reply_content' => ['required', 'string'],
            'attachments' => ['nullable', 'array'],
            'attachments.*.key' => ['required_with:attachments', 'string'],
            'attachments.*.name' => ['required_with:attachments', 'string'],
            'attachments.*.url' => ['required_with:attachments', 'string'],
            'attachments.*.size' => ['required_with:attachments', 'integer'],
            'send_notification' => ['sometimes', 'boolean'],
            'notification_channels' => ['required_if:send_notification,true', 'array', 'min:1'],
            'notification_channels.*' => ['required', 'string', Rule::in(NotificationChannel::values())],
        ];
    }
}
