<?php

namespace App\Http\Exports\Admin;

use App\Models\PaymentTransaction;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminTaxInvoiceExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(protected array $filters = []) {}

    public function query()
    {
        $query = PaymentTransaction::with(['order.user.customer'])
            ->whereNotNull('tax_invoice_status');

        if (! empty($this->filters['date_from'])) {
            $query->where('paid_at', '>=', $this->filters['date_from']);
        }

        if (! empty($this->filters['date_to'])) {
            $query->where('paid_at', '<=', $this->filters['date_to'].' 23:59:59');
        }

        if (! empty($this->filters['issue_status'])) {
            $query->where('tax_invoice_status', $this->filters['issue_status']);
        }

        if (! empty($this->filters['order_number'])) {
            $query->whereHas('order', fn ($q) => $q->where('order_number', 'like', '%'.$this->filters['order_number'].'%'));
        }

        if (! empty($this->filters['order_code'])) {
            $query->whereHas('order', fn ($q) => $q->where('order_external_number', 'like', '%'.$this->filters['order_code'].'%'));
        }

        return $query->orderBy('paid_at', 'desc');
    }

    public function map($payment): array
    {
        $order    = $payment->order;
        $customer = $order?->user?->customer;

        $supplyAmount = $payment->amount / 1.1;
        $vat          = $payment->amount - $supplyAmount;

        return [
            $order?->order_external_number ?? $order?->order_number,
            'tax_invoice',
            $payment->paid_at?->format('Y-m-d'),
            $customer?->business_registration_number,
            $customer?->company_name ?? $order?->company_name,
            $customer?->representative_name,
            $customer?->address,
            $customer?->business_type,
            $customer?->industry_type,
            $customer?->tax_invoice_email ?? $customer?->contact_email,
            number_format($supplyAmount, 0, '.', ''),
            number_format($vat, 0, '.', ''),
            number_format($payment->amount, 0, '.', ''),
            $payment->tax_invoice_status,
            $payment->receipt_notes,
        ];
    }

    public function headings(): array
    {
        return [
            '주문 코드',
            '유형',
            '생성일',
            '사업자등록번호',
            '회사명',
            '대표자',
            '사업장 주소',
            '업태',
            '종목',
            '이메일',
            '공급가액',
            'VAT',
            '결제 금액',
            '상태',
            '비고',
        ];
    }
}
