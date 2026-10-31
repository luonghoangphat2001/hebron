<?php

namespace App\Http\Exports\Admin;

use App\Services\Admin\AdminSettlementReportService;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminSettlementReportExport implements FromCollection, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(protected array $filters = []) {}

    public function collection()
    {
        $startDate = $this->filters['start_date'] ?? null;
        $this->filters['start_date'] = $startDate ? Carbon::parse($startDate) : now()->startOfMonth();

        $endDate = $this->filters['end_date'] ?? null;
        $this->filters['end_date'] = $endDate ? Carbon::parse($endDate) : now()->endOfMonth();

        return collect(app(AdminSettlementReportService::class)->getReportData($this->filters));
    }

    public function map($report): array
    {
        return [
            $report['transaction_id'],
            $report['order_number'],
            $report['customer_name'] ?? '',
            $report['product_name'] ?? '',
            $report['category_name'] ?? '',
            $report['payment_amount'] ?? 0,
            $report['supply_price'] ?? 0,
            $report['vat'] ?? 0,
            $report['commission'] ?? 0,
            $report['status'] ?? '',
            $report['payment_status'],
            $report['paid_at'] ?? '',
            $report['failed_at'] ?? '',
            $report['created_at'] ?? '',
        ];
    }

    public function headings(): array
    {
        return [
            '거래 ID',
            '주문번호',
            '고객명',
            '상품명',
            '카테고리명',
            '결제 금액',
            '공급가액',
            'VAT',
            '수수료',
            '정산 상태',
            '결제 상태',
            '결제 완료일',
            '실패일',
            '생성일시',
        ];
    }
}
