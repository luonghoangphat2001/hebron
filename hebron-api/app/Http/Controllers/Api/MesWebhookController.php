<?php

namespace App\Http\Controllers\Api;

use App\Enums\MesIntegrationDirection;
use App\Enums\MesIntegrationStatus;
use App\Enums\MesReferenceType;
use App\Enums\MesTriggerType;
use App\Enums\OrderStatus;
use App\Enums\OrderShipmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\MesIntegrationLogService;
use App\Services\MesStockService;
use App\Services\Notifications\OrderNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MesWebhookController extends Controller
{
    protected MesIntegrationLogService $logService;

    public function __construct(MesIntegrationLogService $logService)
    {
        $this->logService = $logService;
    }

    public function updateStock(Request $request)
    {
        $data = $request->validate([
            'product_code' => 'required|string',
            'qty' => 'required|integer|min:0',
        ]);

        $product = Product::where('sku', $data['product_code'])->first();

        if (! $product) {
            $response = [
                'success' => false,
                'message' => 'Product information could not be found.',
            ];

            $logData = [
                'direction' => MesIntegrationDirection::MesToMall,
                'trigger_type' => MesTriggerType::InventoryUpdated,
                'reference_type' => MesReferenceType::Inventory,
                'reference_id' => null,
                'http_method' => 'POST',
                'endpoint' => '/mes/stock',
                'request_headers' => [],
                'request_body' => $data,
                'requested_at' => now(),
                'response_status' => 404,
                'response_body' => $response,
                'status' => MesIntegrationStatus::Failed,
                'responded_at' => now(),
            ];

            $this->logService->create($logData);

            return response()->json($response, 404);
        }

        $product->stock_quantity = $data['qty'];
        $product->save();

        $response = [
            'success' => true,
            'message' => 'Inventory update complete',
            'data' => [
                'inventory' => [
                    'quantity' => $product->stock_quantity,
                    'safety_inventory' => 10,
                ],
            ],
        ];

        $logData = [
            'direction' => MesIntegrationDirection::MesToMall,
            'trigger_type' => MesTriggerType::InventoryUpdated,
            'reference_type' => MesReferenceType::Inventory,
            'reference_id' => $product->id,
            'http_method' => 'POST',
            'endpoint' => '/mes/stock',
            'request_headers' => [],
            'request_body' => $data,
            'requested_at' => now(),
            'response_status' => 200,
            'response_body' => $response,
            'status' => MesIntegrationStatus::Success,
            'responded_at' => now(),
        ];

        $this->logService->create($logData);

        return response()->json($response);
    }

    public function updateStatus(Request $request)
    {
        $data = $request->validate([
            'order_id' => 'required|string',
            'delivery_date' => 'required|date',
            'courier' => 'required|string',
            'tracking_no' => 'required|string',
            'invoice_number' => 'nullable|string|max:100',
            'status' => ['nullable', Rule::in(['P', 'C'])],
        ]);

        $mesStatus = $data['status'] ?? 'P';

        $logData = [
            'direction' => MesIntegrationDirection::MesToMall,
            'trigger_type' => MesTriggerType::OrderStatus,
            'reference_type' => MesReferenceType::Order,
            'reference_id' => null,
            'http_method' => 'POST',
            'endpoint' => '/mes/status',
            'request_headers' => [],
            'request_body' => $data,
            'requested_at' => now(),
        ];

        $order = Order::with('orderShipment')
            ->where('order_number', $data['order_id'])
            ->first();

        if (! $order) {
            $response = [
                'success' => false,
                'message' => 'The order could not be found or failed to change its status.',
            ];

            $this->logService->create(array_merge($logData, [
                'response_status' => 404,
                'response_body' => $response,
                'status' => MesIntegrationStatus::Failed,
                'responded_at' => now(),
            ]));

            return response()->json($response, 404);
        }

        $productionStarted = DB::transaction(function () use ($order, $data, $mesStatus): bool {
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);
            $current = OrderStatus::tryFrom($lockedOrder->status);
            // Repeated/late callbacks must not reopen shipped or cancelled orders.
            if (in_array($current, [OrderStatus::Cancelled, OrderStatus::RefundRequested,
                OrderStatus::RefundCompleted, OrderStatus::Shipped, OrderStatus::Shipping,
                OrderStatus::DeliveryCompleted, OrderStatus::Completed, OrderStatus::PurchaseConfirmed], true)) {
                return false;
            }

            $metadata = $lockedOrder->metadata ?? [];
            $productionStarted = $mesStatus === 'P' && empty($metadata['mes_production_started_at']);
            $metadata['estimated_shipping_date'] = $data['delivery_date'];
            $metadata['mes_production_started_at'] ??= now()->toIso8601String();
            $shipment = $lockedOrder->orderShipment()->firstOrCreate([], [
                'status' => OrderShipmentStatus::PENDING->value,
            ]);
            $shipment->update([
                'carrier_name' => $data['courier'],
                'tracking_number' => $data['tracking_no'],
                'invoice_number' => $data['invoice_number'] ?? $shipment->invoice_number,
                // MES dispatch completion does not mean carrier delivery completion.
                'status' => $mesStatus === 'C' ? OrderShipmentStatus::IN_TRANSIT->value : $shipment->status,
                'shipped_at' => $mesStatus === 'C' ? $data['delivery_date'] : $shipment->shipped_at,
            ]);
            $lockedOrder->update([
                'status' => $mesStatus === 'C' ? OrderStatus::Shipped->value
                    : (in_array($current, [OrderStatus::Typesetting, OrderStatus::OutputOfPower,
                        OrderStatus::Print, OrderStatus::PostProcessing, OrderStatus::ProductionDone,
                        OrderStatus::ReadyToShip], true)
                        ? $lockedOrder->status : OrderStatus::Typesetting->value),
                'metadata' => $metadata,
            ]);

            return $productionStarted;
        });

        if ($productionStarted) {
            try {
                app(OrderNotificationService::class)->sendProductionProgress(
                    $order->fresh(), $data['courier'], $data['tracking_no'], $data['delivery_date']
                );
            } catch (\Throwable $e) {
                \Log::error('Production progress notification failed', [
                    'order_number' => $order->order_number, 'error' => $e->getMessage(),
                ]);
            }
        }

        $response = [
            'success' => true,
            'message' => 'MES production status received.',
            'order_id' => $order->id,
            'status' => $mesStatus,
            'status_desc' => $mesStatus === 'C' ? 'Shipped' : 'In production',
        ];

        $this->logService->create(array_merge($logData, [
            'reference_id' => $order->id,
            'response_status' => 200,
            'response_body' => $response,
            'status' => MesIntegrationStatus::Success,
            'responded_at' => now(),
        ]));

        return response()->json($response);
    }

    public function syncStock(Request $request, MesStockService $mesStockService)
    {
        try {
            $sid = $request->input('sid');
            $stockRequestNo = $request->input('stock_request_no');
            $productId = $request->input('product_id') ? (int) $request->input('product_id') : null;
            $productCode = $request->input('product_code');
            $items = $request->input('items');

            $result = $mesStockService->syncStock(
                sid: $sid,
                stockRequestNo: $stockRequestNo,
                referenceId: null,
                productId: $productId,
                productCode: $productCode,
                manualItems: $items
            );

            if (! ($result['success'] ?? false)) {
                return response()->json($result, $result['status_code'] ?? 400);
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
