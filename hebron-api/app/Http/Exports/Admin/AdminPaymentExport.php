<?php

namespace App\Http\Exports\Admin;

use App\Http\Exports\Concerns\RestrictsCurrentPage;
use App\Models\PaymentTransaction;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminPaymentExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable, RestrictsCurrentPage;

    public function __construct(protected array $filters = []) {}

    public function query()
    {
        $query = PaymentTransaction::with('order')->filters($this->filters);
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
                    // selected_ids contains payment transaction_ids (string identifiers)
                    $query->whereIn('payment_transactions.transaction_id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($payment): array
    {
        return [
            $payment->order->order_number,
            $payment->order->name,
            $payment->payment_method?->value ?? $payment->payment_method,
            $payment->amount,
            $payment->status?->value ?? $payment->status,
            $payment->created_at->format('Y-m-d H:i:s'),
            $payment->pg_transaction_id,
        ];
    }

    public function headings(): array
    {
        return [
            '주문번호',
            '고객명',
            '결제 수단',
            '결제 금액',
            '상태',
            '결제일시',
            'PG 거래 ID',
        ];
    }
}
