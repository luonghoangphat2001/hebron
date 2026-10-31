<?php

namespace App\Http\Requests\Admin\UnitPrice;

use App\Enums\UnitPriceCategory;
use App\Enums\UnitPriceTab;
use Illuminate\Foundation\Http\FormRequest;

class AdminUnitPriceListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'erp_option_id' => ['nullable', 'integer'],
            'category' => ['nullable', 'string', 'in:'.implode(',', UnitPriceCategory::values())],
            'unit_price_tab' => ['nullable', 'string', 'in:'.implode(',', UnitPriceTab::values())],
            'search_keyword' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'string', 'in:true,false,all'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'current_page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
