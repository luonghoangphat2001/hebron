<?php

namespace App\Http\Requests\Admin\PaperPrice;

use Illuminate\Foundation\Http\FormRequest;

class AdminPaperPriceListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper_id' => 'nullable|exists:papers,id',
        ];
    }
}
