<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Enums\OrderShipmentStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Exports\Admin\AdminOrderExport;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Order\AdminOrderBasicInformationUpdateRequest;
use App\Http\Requests\Admin\Order\AdminOrderBulkChangeStatusRequest;
use App\Http\Requests\Admin\Order\AdminOrderExportRequest;
use App\Http\Requests\Admin\Order\AdminOrderInternalStoreRequest;
use App\Http\Requests\Admin\Order\AdminOrderListRequest;
use App\Http\Requests\Admin\Order\AdminOrderUpdateStatusRequest;
use App\Http\Resources\Admin\AdminOrderItemResource;
use App\Http\Resources\Admin\AdminOrderListResource;
use App\Http\Resources\Admin\AdminOrderModificationLogResource;
use App\Http\Resources\Admin\AdminOrderResource;
use App\Http\Resources\Admin\AdminOrderStatusHistoryResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Models\Order;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminOrderLogService;
use App\Services\Admin\AdminOrderService;
use App\Services\Admin\OrderDesignPdfService;
use App\Services\Admin\OrderPrintPdfService;
use App\Services\PaginationService;
use App\Services\PointTransactionService;
use App\Services\SweetTrackerService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class AdminOrderController extends BaseController
{
    public function __construct(
        protected AdminOrderService $adminOrderService,
        protected OrderDesignPdfService $orderDesignPdfService,
        protected PaginationService $paginationService,
        protected AdminOrderLogService $adminOrderLogService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PointTransactionService $pointTransactionService
    ) {}

    /**
     * Get order list for admin with filters
     * 주문 목록 조회 (관리자)
     */
    public function index(AdminOrderListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $orders = $this->adminOrderService->getOrdersForAdmin($filters, $perPage);

            // Calculate grouped and individual order counts
            $groupedCount = $this->adminOrderService->getGroupedOrderCount($filters);
            $individualCount = $orders->total();

            // Get options for dropdowns
            $orderStatuses = array_map(function (OrderStatus $status) {
                return [
                    'value' => $status->value,
                    'label' => $status->label(),
                    'label_en' => $status->labelEn(),
                ];
            }, OrderStatus::cases());

            $paymentMethods = array_map(function (PaymentMethod $method) {
                return [
                    'value' => $method->value,
                    'label' => $method->label(),
                ];
            }, PaymentMethod::allowedForDisplay());

            $paymentStatuses = array_map(function (PaymentStatus $status) {
                return [
                    'value' => $status->value,
                    'label' => $status->label(),
                ];
            }, PaymentStatus::cases());

            return $this->responsePaginatedSuccess(200, '주문 목록이 성공적으로 조회되었습니다.', [
                'orders' => AdminOrderListResource::collection($orders->items()),
                'summary' => [
                    'grouped_count' => $groupedCount,
                    'individual_count' => $individualCount,
                ],
                'options' => [
                    'order_statuses' => $orderStatuses,
                    'payment_methods' => $paymentMethods,
                    'payment_statuses' => $paymentStatuses,
                ],
            ], $this->paginationService->format($orders));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Create internal order (for sales representatives).
     * FSD: POST /api/admin/orders/internal
     */
    public function storeInternal(AdminOrderInternalStoreRequest $request): JsonResponse
    {
        $data = $request->validated();

        try {
            $order = $this->adminOrderService->createInternalOrder($data, $request->user());

            return $this->responseSuccess(201, '내부 주문이 성공적으로 생성되었습니다.', [
                'order' => new AdminOrderResource($order),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get order detail for admin
     * 주문 상세 조회 (관리자)
     */
    public function show(string $orderNumber): JsonResponse
    {
        try {
            // Admin can view any order, including deleted ones if needed
            $includeDeleted = request()->boolean('include_deleted', false);

            $order = $this->adminOrderService->getOrderForAdmin($orderNumber, $includeDeleted);

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => new AdminOrderResource($order),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get design assets for an order (for PDF export flow).
     * Returns preview and layout URLs per item so client can generate PDF.
     * FSD: Order Details - design data for printing/export.
     */
    public function designAssets(string $orderNumber): JsonResponse
    {
        try {
            $includeDeleted = request()->boolean('include_deleted', false);
            $order = $this->adminOrderService->getOrderForAdmin($orderNumber, $includeDeleted);

            return response()->json([
                'success' => true,
                'data' => [
                    'order_number' => $order->order_number,
                    'product_information' => [
                        'items' => AdminOrderItemResource::collection($order->items),
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get order design as PDF (front + back). For order list button: view design as PDF.
     * Returns PDF with inline disposition so browser can display it.
     */
    public function designPdf(string $orderNumber): Response
    {
        try {
            $order = $this->adminOrderService->getOrderForAdmin($orderNumber, false);

            $pdfContent = $this->orderDesignPdfService->buildPdf($order);
            $filename = 'design-'.preg_replace('/[^a-zA-Z0-9\-]/', '-', $orderNumber).'.pdf';

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="'.$filename.'"',
                'Content-Length' => (string) strlen($pdfContent),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /** Ordered production PDF manifest; each item is downloaded separately. */
    public function printPdf(string $orderNumber, OrderPrintPdfService $printPdfService): JsonResponse
    {
        try {
            $order = $this->adminOrderService->getOrderForAdmin($orderNumber, false);

            return response()->json([
                'success' => true,
                'data' => [
                    'order_number' => $order->order_number,
                    'files' => $printPdfService->manifest($order),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e instanceof ModelNotFoundException ? 404 : $this->resolveStatusCode($e));
        }
    }

    public function printItemPdf(string $orderNumber, string $orderItemId, OrderPrintPdfService $printPdfService): Response
    {
        try {
            $order = $this->adminOrderService->getOrderForAdmin($orderNumber, false);
            // Scope the lookup to this order; never accept another order's item ID.
            $item = $order->items()->with('designGroup')->findOrFail($orderItemId);
            $pdfContent = $printPdfService->content($item);
            $filename = $printPdfService->filename($order, $item);

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Content-Length' => (string) strlen($pdfContent),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e instanceof ModelNotFoundException ? 404 : $this->resolveStatusCode($e));
        }
    }

    /**
     * Update order status for admin
     * 주문 상태 업데이트 (관리자). PUT /api/admin/orders/{orderNumber}/status
     */
    public function updateStatus(AdminOrderUpdateStatusRequest $request, string $orderNumber): JsonResponse
    {
        $data = $request->validated();
        try {
            $order = Order::where('order_number', $orderNumber)->first();

            if (! $order) {
                return $this->responseError(404, '주문을 찾을 수 없습니다.');
            }

            $order->update([
                'status' => $data['status'],
            ]);

            $order->refresh();

            return $this->responseSuccess(200, '주문 상태가 성공적으로 수정되었습니다.', [
                'order' => new AdminOrderResource($order),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update basic information of an order.
     * FSD: PUT /api/admin/orders/{orderNumber}/basic-information
     */
    public function updateBasicInformation(AdminOrderBasicInformationUpdateRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $order = Order::where('order_number', $orderNumber)->first();

            if (! $order) {
                return $this->responseError(404, '주문을 찾을 수 없습니다.');
            }

            $data = $request->validated();

            // Set reason for activity log
            if (! empty($data['reason'] ?? null)) {
                $order->logReason = $data['reason'];
                unset($data['reason']);
            }

            $order->fill($data);

            if ($order->isDirty()) {
                $order->save();
            }

            return $this->responseSuccess(200, '주문 기본 정보가 성공적으로 수정되었습니다.', [
                'order' => new AdminOrderResource($order),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get modification logs for order basic information.
     * FSD: GET /api/admin/orders/{orderNumber}/modification-logs
     */
    public function modificationLogs(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $perPage = (int) $request->input('per_page', 20);
            $filters = $request->only(['date_from', 'date_to']);

            $paginator = $this->adminOrderLogService->getModificationLogs($orderNumber, $filters, $perPage);

            return $this->responsePaginatedSuccess(200, '주문 수정 로그가 성공적으로 조회되었습니다.', [
                'logs' => AdminOrderModificationLogResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get order status history.
     * FSD: GET /api/admin/orders/{orderNumber}/status-history
     */
    public function statusHistory(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $perPage = (int) $request->input('per_page', 20);
            $filters = $request->only(['date_from', 'date_to']);

            $paginator = $this->adminOrderLogService->getStatusHistory($orderNumber, $filters, $perPage);

            return $this->responsePaginatedSuccess(200, '주문 상태 내역이 성공적으로 조회되었습니다.', [
                'history' => AdminOrderStatusHistoryResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Bulk change order status for admin
     * 주문 상태 일괄 업데이트 (관리자)
     */
    public function bulkChangeStatus(AdminOrderBulkChangeStatusRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $user = $request->user();
            $orders = $this->adminOrderService->bulkUpdateOrdersStatus($data, $user);

            return $this->responseSuccess(200, '주문 상태가 성공적으로 수정되었습니다.', $orders);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update waybill (tracking) number for an order.
     */
    public function updateWaybill(Request $request, string $orderNumber, SweetTrackerService $sweetTrackerService): JsonResponse
    {
        $data = $request->validate([
            'invoice_number' => ['nullable', 'string', 'max:100'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
            'carrier_code' => ['nullable', 'string', 'max:50'],
            'carrier_name' => ['nullable', 'string', 'max:100'],
        ]);

        try {
            $order = Order::where('order_number', $orderNumber)->first();

            if (! $order) {
                return $this->responseError(404, '주문을 찾을 수 없습니다.');
            }

            if ($order->payment_status !== PaymentStatus::PAID->value) {
                return $this->responseError(422, 'Shipment can only be updated after payment succeeds.');
            }

            return DB::transaction(function () use ($data, $order, $sweetTrackerService): JsonResponse {
                $shipment = $order->orderShipment()->firstOrCreate(
                    [],
                    [
                        'status' => OrderShipmentStatus::PENDING,
                        'shipping_method' => $order->shipping_method?->value ?? $order->shipping_method,
                        'shipping_fee' => $order->shipping_fee ?? 0,
                        'shipping_name' => $order->shipping_name,
                        'shipping_phone' => $order->shipping_phone,
                        'shipping_postcode' => $order->shipping_postcode,
                        'shipping_address' => $order->shipping_address,
                        'shipping_address_detail' => $order->shipping_address_detail,
                    ]
                );
                $shipment->update([
                    'invoice_number' => $data['invoice_number'] ?? null,
                    'tracking_number' => $data['tracking_number'] ?? null,
                    'carrier_code' => $data['carrier_code'] ?? $shipment->carrier_code,
                    'carrier_name' => $data['carrier_name'] ?? $shipment->carrier_name,
                    'shipped_at' => ($data['invoice_number'] ?? null) || ($data['tracking_number'] ?? null)
                        ? ($shipment->shipped_at ?? now())
                        : null,
                ]);

                if ($shipment->invoice_number && $shipment->carrier_code) {
                    $sweetTrackerService->register($shipment->fresh());
                }

                $order->load('orderShipments');

                return $this->responseSuccess(200, '운송장이 성공적으로 수정되었습니다.', [
                    'order' => new AdminOrderResource($order),
                ]);
            });
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Export orders list to Excel. Supports export_type: ALL, CURRENT_PAGE, SELECTED.
     */
    public function exportExcel(AdminOrderExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminOrderExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'orders'
            );

            return $this->responseSuccess(200, '내보내기 요청이 접수되었습니다.', [
                'history' => new AdminExportHistory($history),
            ]);
        } catch (\Throwable $th) {
            return $this->responseError(500, '주문 내보내기에 실패하였습니다.', [$th->getMessage()]);
        }
    }

    /**
     * Check export progress status for orders Excel.
     */
    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        return $this->responseSuccess(200, '내보내기 진행 상태가 성공적으로 조회되었습니다.', [
            'history' => new AdminExportHistory($history),
        ]);
    }

    /**
     * Download orders export file.
     */
    public function download(ExportHistory $history)
    {
        if (! $history) {
            return $this->responseError(404, '내보내기 기록을 찾을 수 없습니다.');
        }

        if ($history->status !== ExcelHistoryStatus::COMPLETED) {
            return $this->responseError(400, '내보내기가 아직 완료되지 않았습니다.');
        }

        $disk = Storage::disk(config('filesystems.public_disk'));
        if (! $disk->exists($history->file_path)) {
            return $this->responseError(404, '내보내기 파일을 찾을 수 없습니다.');
        }

        return $disk->download($history->file_path, $history->file_name, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$history->file_name.'"',
        ]);
    }
}
