<?php

namespace App\Exports\Admin;

use App\Models\Order;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminOrderExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(protected array $filters = []) {}

    public function query()
    {
        $query = Order::query()->with(['user', 'product']);

        // Basic filters according to FSD: order number, customer, orderer, status, order period
        if ($orderNumber = Arr::get($this->filters, 'order_number')) {
            $query->where('order_number', 'like', '%'.$orderNumber.'%');
        }
        if ($customer = Arr::get($this->filters, 'customer_name')) {
            $query->where('company_name', 'like', '%'.$customer.'%');
        }
        if ($orderer = Arr::get($this->filters, 'orderer_name')) {
            $query->where('contact_name', 'like', '%'.$orderer.'%');
        }
        if ($status = Arr::get($this->filters, 'status')) {
            $query->where('status', $status);
        }
        if ($from = Arr::get($this->filters, 'order_date_from')) {
            $query->whereDate('placed_at', '>=', $from);
        }
        if ($to = Arr::get($this->filters, 'order_date_to')) {
            $query->whereDate('placed_at', '<=', $to);
        }

        $exportType = Arr::get($this->filters, 'export_type', 'ALL');
        switch ($exportType) {
            case 'ALL':
                break;
            case 'CURRENT_PAGE':
                $currentPage = (int) Arr::get($this->filters, 'current_page', 1);
                $perPage = (int) Arr::get($this->filters, 'per_page', 20);
                $query->offset(($currentPage - 1) * $perPage)->limit($perPage);
                break;
            case 'SELECTED':
                $selectedIds = Arr::get($this->filters, 'selected_ids', []);
                if ($selectedIds !== []) {
                    $query->whereIn('orders.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query->orderBy('placed_at', 'desc');
    }

    public function map($order): array
    {
        return [
            $order->order_number,
            $order->company_name,
            $order->contact_name,
            $order->status,
            $order->total_amount,
            $order->payment_method?->value ?? $order->payment_method,
            $order->placed_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return [
            'Order Number',
            'Customer Name',
            'Orderer Name',
            'Status',
            'Total Amount',
            'Payment Method',
            'Order Date',
        ];
    }
}
