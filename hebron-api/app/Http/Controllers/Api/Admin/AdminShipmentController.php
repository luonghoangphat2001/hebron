<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminShipmentExport;
use App\Http\Requests\Admin\Shipment\AdminShipmentExportRequest;
use App\Http\Requests\Admin\Shipment\AdminShipmentListRequest;
use App\Http\Resources\Admin\AdminShipmentResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminShipmentService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminShipmentController extends BaseController
{
    public function __construct(
        protected AdminShipmentService $adminShipmentService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for shipments (출고 관리 검색 필터)
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminShipmentService->getSearchFilters();

            return response()->json([
                'success' => true,
                'data' => ['filters' => $filters],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get shipment list (출고 목록 조회)
     */
    public function index(AdminShipmentListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);
            $shipments = $this->adminShipmentService->getShipments($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '출고 목록이 성공적으로 조회되었습니다.', [
                'shipments' => AdminShipmentResource::collection($shipments->items()),
            ], $this->paginationService->format($shipments));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function showByInvoiceNumber(string $invoiceNumber): JsonResponse
    {
        $shipment = $this->adminShipmentService->getByInvoiceNumber($invoiceNumber);

        if (! $shipment) {
            return response()->json([
                'success' => false,
                'message' => 'Shipment not found for invoice number.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'shipment' => new AdminShipmentResource($shipment),
            ],
        ]);
    }

    public function carriers(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => ['carriers' => $this->sweetTrackerClient->companies()],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function trackingEvents(string $invoiceNumber): JsonResponse
    {
        $shipment = $this->adminShipmentService->getByInvoiceNumber($invoiceNumber);
        if (! $shipment) {
            return response()->json(['success' => false, 'message' => 'Shipment not found for invoice number.'], 404);
        }

        return response()->json(['success' => true, 'data' => [
            'events' => $shipment->trackingEvents()->get(['status', 'provider_level', 'provider_code', 'description', 'remark', 'location', 'event_at', 'payload', 'response']),
        ]]);
    }

    private function stripSecrets(array $value): array
    {
        foreach ($value as $key => $item) {
            if (in_array(mb_strtolower((string) $key), ['key', 't_key', 'api_key', 'apikey'], true)) {
                unset($value[$key]);
            } elseif (is_array($item)) {
                $value[$key] = $this->stripSecrets($item);
            }
        }

        return $value;
    }

    /**
     * Export shipments to Excel (출고 목록 Excel 다운로드)
     */
    public function exportExcel(AdminShipmentExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $user = $request->user();
            $history = $this->adminExportHistoryService->executeExcel(
                AdminShipmentExport::class,
                $filters,
                (int) $user->id,
                'exports',
                'shipments'
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'history' => new AdminExportHistory($history),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'history' => new AdminExportHistory($history),
            ],
        ]);
    }

    public function download(ExportHistory $history): StreamedResponse|JsonResponse
    {
        if ($history->status !== ExcelHistoryStatus::COMPLETED) {
            return response()->json([
                'success' => false,
                'message' => '내보내기가 아직 완료되지 않았습니다.',
            ], 400);
        }

        $disk = Storage::disk(config('filesystems.public_disk'));
        if (! $disk->exists($history->file_path)) {
            return response()->json([
                'success' => false,
                'message' => '내보내기 파일을 찾을 수 없습니다.',
            ], 404);
        }

        return $disk->download($history->file_path, $history->file_name, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$history->file_name.'"',
        ]);
    }
}
