<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    /**
     * Get dashboard overview data
     * 대시보드 개요 데이터 조회
     */
    public function overview(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            // Get order counts by status
            $orderCounts = $this->getOrderCountsByStatus($user->id);

            // Get recent orders (last 5)
            $recentOrders = Order::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'order_counts' => $orderCounts,
                    'recent_orders' => OrderResource::collection($recentOrders),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '대시보드 데이터를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get order counts for the three dashboard status groups.
     *
     * Each entry in buckets is one dashboard group; its items are the cards
     * displayed by the production/design/delivery sections.
     */
    private function getOrderCountsByStatus(int $userId): array
    {
        $counts = Order::where('user_id', $userId)
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $get = fn(string ...$statuses) => array_sum(array_map(fn($s) => (int) ($counts[$s] ?? 0), $statuses));

        $bucket = function (string $key, string $label, string $labelEn, int $count): array {
            return compact('key', 'label', 'count') + ['label_en' => $labelEn];
        };

        $productionBuckets = [
            $bucket('awaiting_payment', '결제 대기', 'Awaiting Payment', $get(OrderStatus::AwaitingPayment->value)),
            $bucket('pending_reception', '접수 대기', 'Pending Reception', $get(OrderStatus::PendingReception->value)),
            $bucket('file_error', '파일 에러', 'File Error', $get(OrderStatus::FileError->value)),
            $bucket('proofreading', '교정', 'Proofreading', $get(OrderStatus::PendingCorrection->value)),
            $bucket('typesetting', '조판', 'Typesetting', $get(OrderStatus::Typesetting->value)),
            $bucket('printing_output', '출력', 'Output', $get(OrderStatus::OutputOfPower->value)),
            $bucket('press', '인쇄', 'Printing', $get(OrderStatus::Print->value)),
            $bucket('post_processing', '후가공', 'Post-processing', $get(OrderStatus::PostProcessing->value)),
            $bucket('production_done', '생산 완료', 'Production Completed', $get(OrderStatus::ProductionDone->value)),
        ];

        $designBuckets = [
            $bucket('awaiting_payment', '결제 대기', 'Awaiting Payment', $get(OrderStatus::AwaitingPayment->value)),
            $bucket('pending_reception', '접수 대기', 'Pending Reception', $get(OrderStatus::PendingReception->value)),
            $bucket('designing', '디자인 중', 'Designing', $get(
                OrderStatus::PendingCorrection->value,
                OrderStatus::DesignRejected->value,
            )),
            $bucket('draft_delivery', '시안 전달 및 교정', 'Proof Delivery and Correction', $get(
                OrderStatus::DesignConfirmationRequested->value,
            )),
            $bucket('design_done', '디자인 완료', 'Design Completed', $get(
                OrderStatus::DesignConfirmed->value,
                OrderStatus::Confirmed->value,
            )),
        ];

        $deliveryCounts = Order::where('user_id', $userId)
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('shipping_method, status, COUNT(*) as count')
            ->groupBy('shipping_method', 'status')
            ->toBase()
            ->get()
            ->reduce(function (array $result, $row): array {
                $method = strtolower((string) $row->shipping_method);
                $status = (string) $row->status;
                $count = (int) $row->count;

                if (in_array($status, [
                    OrderStatus::Shipped->value,
                    OrderStatus::DeliveryCompleted->value,
                    OrderStatus::Completed->value,
                ], true)) {
                    $result['delivered'] += $count;
                } elseif (in_array($method, ['pickup', 'pickup_delivery'], true)) {
                    $result['pickup'] += $count;
                } elseif ($method === 'courier') {
                    $result['courier'] += $count;
                } elseif (in_array($method, ['quick', 'quick_delivery'], true)) {
                    $result['quick'] += $count;
                } elseif (in_array($method, ['direct', 'direct_delivery'], true)) {
                    $result['direct'] += $count;
                }

                return $result;
            }, ['pickup' => 0, 'courier' => 0, 'quick' => 0, 'direct' => 0, 'delivered' => 0]);

        $deliveryBuckets = [
            $bucket('pickup', '방문 수령', 'Pickup', $deliveryCounts['pickup']),
            $bucket('courier', '택배', 'Courier', $deliveryCounts['courier']),
            $bucket('quick', '퀵배송', 'Quick Delivery', $deliveryCounts['quick']),
            $bucket('direct', '직배송', 'Direct Delivery', $deliveryCounts['direct']),
            $bucket('delivered', '배송완료', 'Delivery Completed', $deliveryCounts['delivered']),
        ];

        $buckets = [
            'production' => [
                'key' => 'production',
                'label' => '생산현황',
                'label_en' => 'Production Status',
                'total' => array_sum(array_column($productionBuckets, 'count')),
                'items' => $productionBuckets,
            ],
            'design' => [
                'key' => 'design',
                'label' => '디자인현황',
                'label_en' => 'Design Status',
                'total' => array_sum(array_column($designBuckets, 'count')),
                'items' => $designBuckets,
            ],
            'delivery' => [
                'key' => 'delivery',
                'label' => '배송 현황',
                'label_en' => 'Delivery Status',
                'total' => array_sum(array_column($deliveryBuckets, 'count')),
                'items' => $deliveryBuckets,
            ],
        ];

        // Total unique orders. Group totals must not be added together because
        // the same order can appear in production, design, and delivery views.
        $total = array_sum(array_map('intval', $counts));

        return [
            'total'   => $total,
            'buckets' => $buckets,
        ];
    }
}
