<?php

namespace App\Http\Exports\Admin;

use App\Services\Admin\AdminTemplateService;
use App\Http\Exports\Concerns\RestrictsCurrentPage;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminTemplateExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable, RestrictsCurrentPage;

    protected array $filters;

    protected AdminTemplateService $adminTemplateService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminTemplateService = app(AdminTemplateService::class);
        $this->locale = Arr::get($filters, 'locale', 'ko');
    }

    public function query()
    {
        $reflection = new \ReflectionClass($this->adminTemplateService);
        $method = $reflection->getMethod('buildQuery');
        $method->setAccessible(true);
        $query = $method->invoke($this->adminTemplateService, $this->filters);

        $exportType = Arr::get($this->filters, 'export_type', 'ALL');
        switch ($exportType) {
            case 'ALL':
                break;
            case 'CURRENT_PAGE':
                $currentPage = (int) Arr::get($this->filters, 'current_page', 1);
                $perPage = (int) Arr::get($this->filters, 'per_page', 20);
                $this->restrictToCurrentPage($query, $currentPage, $perPage);
                break;
            case 'SELECTED':
                $selectedIds = Arr::get($this->filters, 'selected_ids', []);
                if ($selectedIds !== []) {
                    $query->whereIn('templates.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($template): array
    {
        $statusLabels = [
            'en' => ['Active', 'Inactive'],
            'ko' => ['활성', '비활성'],
            'ja' => ['有効', '無効'],
        ];

        $status = $template->is_active
            ? ($statusLabels[$this->locale][0] ?? '활성')
            : ($statusLabels[$this->locale][1] ?? '비활성');

        return [
            $template->name,
            $status,
            $template->updated_at?->format('Y-m-d H:i'),
        ];
    }

    public function headings(): array
    {
        $headings = [
            'en' => [
                'Name',
                'Status',
                'Last modified',
            ],
            'ko' => [
                '이름',
                '상태',
                '최종 수정일',
            ],
            'ja' => [
                '名前',
                'ステータス',
                '最終更新',
            ],
        ];

        return $headings[$this->locale] ?? $headings['en'];
    }
}
