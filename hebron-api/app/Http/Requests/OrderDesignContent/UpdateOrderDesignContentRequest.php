<?php

namespace App\Http\Requests\OrderDesignContent;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderDesignContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'recipient_name' => ['nullable', 'string', 'max:255'],
            'event_date' => ['nullable', 'date_format:Y-m-d'],
            'main_text' => ['nullable', 'string'],
            'sender_name' => ['nullable', 'string', 'max:255'],
            'attachment_file_urls' => ['nullable', 'array'],
        ];
    }
}
