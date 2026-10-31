<?php

namespace App\Services;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Resources\MyPageOrderDeliveryTrackingListResource;
use App\Models\Inquiry;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyPageDashboardService
{
    public function __construct(
        protected PointBalanceService $pointBalanceService,
        protected MembershipService $membershipService,
    ) {}

    public function getDashboardData(User $user): array
    {
        try {
            return [
                'member_summary' => $this->getMemberSummary($user),
                'production_status' => $this->getProductionStatus($counts = $this->getOrderStatusCounts($user->id)),
                'design_status' => $this->getDesignStatus($counts),
                'order_status' => $this->getOrderStatus($counts),
                'customer_order_status' => $this->getCustomerOrderStatus($counts),
                'delivery_status' => $this->getDeliveryStatus($user->id),
                'recent_orders' => $this->getRecentOrders($user->id),
                'inquiry_summary' => $this->getInquirySummary($user->id),
                'review_summary' => $this->getReviewSummary($user),
            ];
        } catch (\Exception $e) {
            Log::error('Get MyPage dashboard data failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    private function getMemberSummary(User $user): array
    {
        $user->loadMissing('membershipTier');
        $pointBalance = $this->pointBalanceService->getBalance($user);
        $membershipSummary = $this->membershipService->getMembershipSummary($user);

        return [
            'name' => $user->name,
            'membership_tier' => $user->membershipTier?->name ?? null,
            'accumulation_rate' => $user->membershipTier?->accumulation_rate ?? 0,
            'point_balance' => $pointBalance->balance ?? 0,
            'exclusive_account' => null,
            'current_quarter_spent' => $membershipSummary['current_quarter_spent'],
            'next_tier' => $membershipSummary['next'],
        ];
    }

    /**
     * 생산현황 — 9 stage production pipeline.
     * 디자인현황 — 5 stage design workflow.
     * Both share a single status count query.
     * ERP stages are mapped from the order status enum; unavailable statuses
     * naturally return zero until an order reaches that stage.
     */
    private function getOrderStatusCounts(int $userId): array
    {
        return Order::where('user_id', $userId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    private function getProductionStatus(array $counts): array
    {

        $productionStatuses = [
            OrderStatus::PendingCorrection,
            OrderStatus::Typesetting,
            OrderStatus::OutputOfPower,
            OrderStatus::Print,
            OrderStatus::PostProcessing,
            OrderStatus::ProductionDone,
        ];

        return [
            ['key' => 'awaiting_payment',  'label' => '결제 대기',  'count' => (int) ($counts[OrderStatus::AwaitingPayment->value] ?? 0)],
            ['key' => 'pending_reception', 'label' => '접수 대기',  'count' => (int) ($counts[OrderStatus::PendingReception->value] ?? 0)],
            ['key' => 'file_error',        'label' => '파일 에러',  'count' => (int) ($counts[OrderStatus::FileError->value] ?? 0)],
            ['key' => 'proofreading',      'label' => '교정',       'count' => (int) ($counts[$productionStatuses[0]->value] ?? 0)],
            ['key' => 'typesetting',       'label' => '조판',       'count' => (int) ($counts[$productionStatuses[1]->value] ?? 0)],
            ['key' => 'printing_output',   'label' => '출력',       'count' => (int) ($counts[$productionStatuses[2]->value] ?? 0)],
            ['key' => 'press',             'label' => '인쇄',       'count' => (int) ($counts[$productionStatuses[3]->value] ?? 0)],
            ['key' => 'post_processing',   'label' => '후가공',     'count' => (int) ($counts[$productionStatuses[4]->value] ?? 0)],
            ['key' => 'production_done',   'label' => '생산 완료',  'count' => (int) ($counts[$productionStatuses[5]->value] ?? 0)],
        ];
    }

    private function getDesignStatus(array $counts): array
    {

        return [
            ['key' => 'awaiting_payment',  'label' => '결제 대기',         'count' => (int) ($counts[OrderStatus::AwaitingPayment->value] ?? 0)],
            ['key' => 'pending_reception', 'label' => '접수 대기',         'count' => (int) ($counts[OrderStatus::PendingReception->value] ?? 0)],
            ['key' => 'designing',         'label' => '디자인 중',         'count' => (int) (($counts[OrderStatus::PendingCorrection->value] ?? 0) + ($counts[OrderStatus::DesignRejected->value] ?? 0))],
            ['key' => 'draft_delivery',    'label' => '시안 전달 및 교정', 'count' => (int) ($counts[OrderStatus::DesignConfirmationRequested->value] ?? 0)],
            ['key' => 'design_done',       'label' => '디자인 완료',       'count' => (int) (($counts[OrderStatus::DesignConfirmed->value] ?? 0) + ($counts[OrderStatus::Confirmed->value] ?? 0))],
        ];
    }

    /**
     * Recent-order progress shown on the MyPage dashboard.
     *
     * These five buckets are mutually exclusive so a single order is shown in
     * the furthest stage it has reached. Cancelled and refunded orders are
     * intentionally excluded; they are handled by the cancellation/refund UI.
     */
    private function getCustomerOrderStatus(array $counts): array
    {
        $stages = [];
        foreach (OrderStatus::cases() as $status) {
            if (in_array($status->value, OrderStatus::getRefundOrCancellationProcess(), true)) {
                continue;
            }
            $key = $status->customerStage();
            $stages[$key] ??= ['key' => $key, 'label' => $status->customerLabel(), 'count' => 0];
            $stages[$key]['count'] += (int) ($counts[$status->value] ?? 0);
        }

        return array_values($stages);
    }

    private function getOrderStatus(array $counts): array
    {
        $sum = fn (array $statuses): int => (int) array_sum(array_map(
            fn (OrderStatus $status): int => (int) ($counts[$status->value] ?? 0),
            $statuses,
        ));

        return [
            ['key' => 'order_received', 'label' => '주문접수', 'count' => $sum([
                OrderStatus::Draft,
                OrderStatus::Pending,
                OrderStatus::AwaitingPayment,
            ])],
            ['key' => 'payment_completed', 'label' => '결제완료', 'count' => $sum([
                OrderStatus::Confirmed,
            ])],
            ['key' => 'preparing_product', 'label' => '상품준비중', 'count' => $sum([
                OrderStatus::PendingReception,
                OrderStatus::FileError,
                OrderStatus::PendingCorrection,
                OrderStatus::Typesetting,
                OrderStatus::OutputOfPower,
                OrderStatus::Print,
                OrderStatus::PostProcessing,
                OrderStatus::ProductionDone,
                OrderStatus::ReadyToShip,
                OrderStatus::DesignConfirmationRequested,
                OrderStatus::DesignConfirmed,
                OrderStatus::DesignRejected,
            ])],
            ['key' => 'shipping', 'label' => '배송중', 'count' => $sum([
                OrderStatus::Shipping,
            ])],
            ['key' => 'delivery_completed', 'label' => '배송완료', 'count' => $sum([
                OrderStatus::Shipped,
                OrderStatus::DeliveryCompleted,
                OrderStatus::Completed,
                OrderStatus::PurchaseConfirmed,
            ])],
        ];
    }

    /**
     * 배송현황 — counts by shipping method (방문수령 / 택배 / 직배송 / 직배 / 배송완료).
     * UI shows 5 stages based on shipping method, not status.
     */
    private function getDeliveryStatus(int $userId): array
    {
        $rows = Order::where('user_id', $userId)
            ->selectRaw('shipping_method, status, COUNT(*) as count')
            ->groupBy('shipping_method', 'status')
            ->toBase()
            ->get();

        $pickup = 0;
        $courier = 0;
        $quick = 0;
        $direct = 0;
        $delivered = 0;

        foreach ($rows as $row) {
            $status = OrderStatus::tryFrom($row->status);
            $isDelivered = in_array($status, [
                OrderStatus::DeliveryCompleted,
                OrderStatus::Completed,
            ]);

            if ($isDelivered) {
                $delivered += (int) $row->count;

                continue;
            }

            $method = strtolower((string) $row->shipping_method);
            if (in_array($method, ['pickup', 'pickup_delivery'], true)) {
                $pickup += (int) $row->count;
            } elseif ($method === 'courier') {
                $courier += (int) $row->count;
            } elseif (in_array($method, ['quick', 'quick_delivery'], true)) {
                $quick += (int) $row->count;
            } elseif (in_array($method, ['direct', 'direct_delivery'], true)) {
                $direct += (int) $row->count;
            }
        }

        return [
            ['key' => 'pickup',    'label' => '방문 수령', 'count' => $pickup],
            ['key' => 'courier',   'label' => '택배',      'count' => $courier],
            ['key' => 'quick',     'label' => '퀵배송',    'count' => $quick],
            ['key' => 'direct',    'label' => '직배송',    'count' => $direct],
            ['key' => 'delivered', 'label' => '배송완료',  'count' => $delivered],
        ];
    }

    private function getRecentOrders(int $userId, int $limit = 10): array
    {
        $orders = Order::where('user_id', $userId)
            ->with([
                'items.designGroup',
                'items.orderDesignContent',
                'items.product',
                'product',
                'orderShipment',
            ])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return MyPageOrderDeliveryTrackingListResource::collection($orders)->resolve();
    }

    /**
     * 최근 게시물 — inquiry counts per category, split by answered/pending.
     */
    private function getInquirySummary(int $userId): array
    {
        $rows = Inquiry::where('user_id', $userId)
            ->selectRaw('category, status, COUNT(*) as count')
            ->groupBy('category', 'status')
            ->get();

        $byCategory = [];
        foreach ($rows as $row) {
            $cat = $row->category instanceof InquiryCategory ? $row->category->value : $row->category;
            $status = $row->status instanceof InquiryStatus ? $row->status->value : $row->status;
            $byCategory[$cat][$status] = (int) $row->count;
        }

        $categories = [
            InquiryCategory::PRODUCT->value => '상품문의',
            InquiryCategory::QUOTE->value => '견적문의',
            InquiryCategory::SHIPPING->value => '출고/배송문의',
            InquiryCategory::PAYMENT->value => '결제/회계문의',
            InquiryCategory::REWORK->value => '재작업신청',
            InquiryCategory::REFUND->value => '환불신청',
        ];

        $result = [];
        foreach ($categories as $key => $label) {
            $data = $byCategory[$key] ?? [];
            $answered = (int) ($data[InquiryStatus::RESPONDED->value] ?? 0);
            $pending = (int) ($data[InquiryStatus::PENDING->value] ?? 0);

            $result[] = [
                'category' => $key,
                'label' => $label,
                'answered' => $answered,
                'pending' => $pending,
                'total' => $answered + $pending,
            ];
        }

        return $result;
    }

    /**
     * 이용후기 요약 — reviewable count + reward points per review type.
     * Photo/normal review point values are not stored in DB yet (UI mockup shows 500P/100P).
     */
    private function getReviewSummary(User $user): array
    {
        $completedStatuses = [
            OrderStatus::DeliveryCompleted->value,
            OrderStatus::Completed->value,
        ];

        $subQuery = OrderItem::query()
            ->selectRaw('MAX(order_items.id) as id')
            ->whereNotExists(function ($query) use ($user) {
                $query->select(DB::raw(1))
                    ->from('reviews')
                    ->whereColumn('reviews.order_id', 'order_items.order_id')
                    ->whereColumn('reviews.product_id', 'order_items.product_id')
                    ->where('reviews.user_id', $user->id)
                    ->whereNull('reviews.deleted_at');
            })
            ->groupBy('order_items.order_id', 'order_items.product_id');

        $reviewableCount = OrderItem::query()
            ->joinSub($subQuery, 'filtered_items', fn ($join) => $join->on('order_items.id', '=', 'filtered_items.id'))
            ->whereHas('order', function ($query) use ($user, $completedStatuses) {
                $query->where('user_id', $user->id)
                    ->whereIn('status', $completedStatuses)
                    ->where('payment_status', PaymentStatus::PAID->value);
            })
            ->count();

        return [
            'reviewable_count' => $reviewableCount,
            'photo_review_points' => 500, // TODO: load from PointSetting when review reward config is added to DB
            'normal_review_points' => 100,
        ];
    }
}
