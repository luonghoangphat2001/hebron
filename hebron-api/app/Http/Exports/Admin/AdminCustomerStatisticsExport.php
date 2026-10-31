<?php

namespace App\Http\Exports\Admin;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AdminCustomerStatisticsExport implements FromArray, WithHeadings, WithStyles
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function array(): array
    {
        $exportData = [];

        if (isset($this->data['customer_details'])) {
            foreach ($this->data['customer_details'] as $customer) {
                $exportData[] = [
                    'customer_name' => $customer['customer_name'],
                    'status' => $this->getStatusLabel($customer['status']),
                    'orders' => $customer['orders'],
                    'cumulative_sales' => number_format($customer['cumulative_sales'], 2),
                    'aov' => number_format($customer['aov'], 2),
                    'sales_rep' => $customer['sales_rep'],
                    'last_order' => $customer['last_order'],
                ];
            }
        }

        return $exportData;
    }

    public function headings(): array
    {
        return [
            '고객사명',
            '상태',
            '총 주문 수',
            '누적 매출',
            '평균 주문 금액',
            '영업 담당자',
            '최근 주문일',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:G1')->getFont()->setBold(true);
        $sheet->getStyle('A1:G1')->getFill()->setFillType(Fill::FILL_SOLID);
        $sheet->getStyle('A1:G1')->getFill()->getStartColor()->setRGB('4a5568');
        $sheet->getStyle('A1:G1')->getFont()->getColor()->setRGB('ffffff');

        $sheet->getColumnDimension('A')->setWidth(30);
        $sheet->getColumnDimension('B')->setWidth(15);
        $sheet->getColumnDimension('C')->setWidth(15);
        $sheet->getColumnDimension('D')->setWidth(20);
        $sheet->getColumnDimension('E')->setWidth(20);
        $sheet->getColumnDimension('F')->setWidth(25);
        $sheet->getColumnDimension('G')->setWidth(20);
    }

    /**
     * Get status label
     */
    private function getStatusLabel(string $status): string
    {
        $labels = [
            'active' => '활성',
            'inactive' => '비활성',
            'new' => '신규',
            'dormant' => '휴면',
        ];

        return $labels[$status] ?? $status;
    }
}
