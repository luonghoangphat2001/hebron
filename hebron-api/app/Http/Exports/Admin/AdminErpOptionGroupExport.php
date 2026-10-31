<?php

namespace App\Http\Exports\Admin;

use App\Helpers\ExportLocaleHelper;
use App\Services\Admin\AdminErpOptionGroupService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminErpOptionGroupExport implements FromQuery, WithHeadings, WithMapping, WithTitle
{
    use Exportable;

    protected array $filters;
    protected AdminErpOptionGroupService $adminErpOptionGroupService;
    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminErpOptionGroupService = app(AdminErpOptionGroupService::class);
        $this->locale = Arr::get($filters, 'locale', 'ko');
    }

    public function query()
    {
        return $this->adminErpOptionGroupService->buildQuery($this->filters);
    }

    public function map($erpOptionGroup): array
    {
        return [
            $erpOptionGroup->id,
            $erpOptionGroup->code,
            $erpOptionGroup->label,
            $erpOptionGroup->type,
            $erpOptionGroup->is_required ? '필수' : '선택',
            $erpOptionGroup->display_type,
            $erpOptionGroup->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getErpOptionGroupHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getErpOptionGroupSheetName($this->locale);
    }
}
