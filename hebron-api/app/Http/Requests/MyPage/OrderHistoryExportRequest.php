<?php

namespace App\Http\Requests\MyPage;

use App\Enums\OrderHistoryExportType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class OrderHistoryExportRequest extends OrderHistoryListRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'export_type' => ['required', Rule::enum(OrderHistoryExportType::class)],
            'page' => ['required_if:export_type,'.OrderHistoryExportType::CURRENT_PAGE->value, 'integer', 'min:1'],
            'per_page' => ['required_if:export_type,'.OrderHistoryExportType::CURRENT_PAGE->value, 'integer', 'min:1', 'max:'.config('exports.max_per_page')],
        ];
    }
}
