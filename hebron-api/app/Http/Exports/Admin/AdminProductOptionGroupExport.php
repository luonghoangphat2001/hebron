<?php

namespace App\Http\Exports\Admin;

use App\Models\ProductOptionGroup;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminProductOptionGroupExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    use Exportable;

    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $exportType = Arr::get($this->filters, 'export_type', 'ALL');

        $query = ProductOptionGroup::query();

        if ($code = Arr::get($this->filters, 'code')) {
            $query->where('code', 'like', '%'.$code.'%');
        }
        if ($name = Arr::get($this->filters, 'name')) {
            $query->where('name', 'like', '%'.$name.'%');
        }
        if ($displayType = Arr::get($this->filters, 'display_type')) {
            $query->where('display_type', $displayType);
        }
        if ($isRequired = Arr::get($this->filters, 'is_required')) {
            $query->where('is_required', filter_var($isRequired, FILTER_VALIDATE_BOOLEAN));
        }

        switch ($exportType) {
            case 'CURRENT_PAGE':
                $currentPage = Arr::get($this->filters, 'current_page', 1);
                $perPage = Arr::get($this->filters, 'per_page', 20);
                $query->offset(($currentPage - 1) * $perPage)->limit($perPage);
                break;
            case 'SELECTED':
                $selectedIds = Arr::get($this->filters, 'selected_ids', []);
                if (empty($selectedIds)) {
                    return collect([]);
                }
                $query->whereIn('id', $selectedIds);
                break;
        }

        $sortBy = Arr::get($this->filters, 'sort_by', 'id');
        $sortOrder = Arr::get($this->filters, 'sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        return $query->with('allOptions')->get();
    }

    public function map($group): array
    {
        return [
            $group->id,
            $group->code,
            $group->name,
            $group->display_type,
            $group->is_required ? '필수' : '선택',
            $group->allOptions->pluck('name')->implode(', '),
            $group->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return [
            'ID',
            '코드',
            '이름',
            '노출 유형',
            '필수 여부',
            '옵션',
            '생성일시',
        ];
    }

    public function title(): string
    {
        return '상품 옵션 그룹 목록';
    }
}
