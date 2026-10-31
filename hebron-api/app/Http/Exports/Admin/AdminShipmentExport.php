<?php

namespace App\Http\Exports\Admin;

use App\Helpers\ExportLocaleHelper;
use App\Http\Exports\Concerns\RestrictsCurrentPage;
use App\Services\Admin\AdminShipmentService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminShipmentExport implements FromQuery, WithHeadings, WithMapping, WithTitle
{
    use RestrictsCurrentPage;

    protected array $filters;

    protected string $locale;

    protected AdminShipmentService $adminShipmentService;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->locale = Arr::get($filters, 'locale', 'ko');
        $this->adminShipmentService = app(AdminShipmentService::class);
    }

    public function query()
    {
        $query = $this->adminShipmentService->buildQuery($this->filters);
        $exportType = Arr::get($this->filters, 'export_type', 'ALL');
        $sortBy = Arr::get($this->filters, 'sort_by', 'shipped_at');
        $sortOrder = Arr::get($this->filters, 'sort_order', 'desc');
        $sortColumn = match ($sortBy) {
            'order_number' => 'orders.order_number',
            'shipped_at' => 'order_shipments.shipped_at',
            default => 'order_shipments.created_at',
        };
        $query->orderBy($sortColumn, $sortOrder);

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
                    $query->whereIn('order_shipments.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($shipment): array
    {
        $order = $shipment->order;
        $items = $order?->items ?? collect();
        $metadata = $order?->metadata ?? [];

        return [
            $shipment->id,
            $order?->order_number,
            $order?->company_name ?: $order?->contact_name,
            $items->map(fn ($item) => $item->title ?: $item->product?->name)
                ->filter()->unique()->values()->implode(', '),
            (int) $items->sum('quantity'),
            $metadata['delivery_manager_name'] ?? $metadata['shipping_manager_name'] ?? null,
            is_object($shipment->shipping_method)
                ? $shipment->shipping_method->value
                : $shipment->shipping_method,
            $shipment->invoice_number,
            $shipment->tracking_number,
            $shipment->carrier_name ?? $shipment->carrier_code,
            $shipment->status?->label($this->locale) ?? $shipment->status?->value,
            $shipment->shipped_at?->format('Y-m-d'),
            $shipment->delivered_at?->format('Y-m-d'),
            $shipment->shipping_fee,
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getShipmentHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getShipmentSheetName($this->locale);
    }
}
