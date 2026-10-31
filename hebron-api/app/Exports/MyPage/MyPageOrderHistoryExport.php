<?php

namespace App\Exports\MyPage;

use App\Enums\OrderHistoryExportType;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\MyPage\MyPageOrderService;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MyPageOrderHistoryExport implements FromQuery, WithHeadings, WithMapping
{
    /** @param array<string, mixed> $filters */
    public function __construct(
        private readonly int $userId,
        private readonly array $filters,
    ) {}

    public function query(): Builder
    {
        $query = app(MyPageOrderService::class)->buildOrdersQuery($this->userId, $this->filters);

        if (OrderHistoryExportType::tryFrom($this->filters['export_type'] ?? null) === OrderHistoryExportType::CURRENT_PAGE) {
            $query->forPage((int) $this->filters['page'], (int) $this->filters['per_page']);
        }

        return $query;
    }

    /** @param Order $order */
    public function map($order): array
    {
        $items = $order->items;
        $productNames = $items->map(fn ($item) => $item->product?->name ?? $item->title)
            ->filter()
            ->unique()
            ->implode("\n");
        $selectedOptions = $items->map(function ($item): string {
            return collect(data_get($item->configuration, 'selected_option_values', []))
                ->map(function (array $selection): ?string {
                    $group = data_get($selection, 'group.name');
                    $option = data_get($selection, 'option.name');

                    return $group && $option ? "{$group}: {$option}" : $option;
                })
                ->filter()
                ->implode(', ');
        })->filter()->implode("\n");
        $quantity = (int) $items->sum(fn ($item) => (int) ($item->quantity ?? 0) * (float) ($item->multiplier ?? 1));

        return [
            $order->created_at?->format('Y-m-d H:i:s'),
            $order->order_number,
            $productNames,
            $selectedOptions,
            $quantity,
            (string) ($order->total_amount ?? 0),
            OrderStatus::tryFrom((string) $order->status)?->label() ?? $order->status,
            data_get($order->metadata, 'proof_status'),
            $order->orderShipment?->invoice_number,
        ];
    }

    public function headings(): array
    {
        return [
            '주문 날짜', // order date
            '주문 번호', // order number
            '제품 이름', // product name
            '선택한 옵션', // selected options
            '수량', // quantity
            '금액', // amount
            '상태', // status
            '증명 상태', // proof status
            '송장 번호', // invoice number
        ];
    }
}
