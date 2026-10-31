<?php

namespace App\Services\MyPage;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class MyPageTransactionHistoryService
{
    /**
     * UI columns: 월, 일, 주문원가, 배송비, 할인금액, 합계금액, 공급가액, 부가세, 입금액, 입금정산, 잔고, 미납액, 환불
     */
    public function getList(User $user, array $filters = []): array
    {
        $query = Order::where('user_id', $user->id)
            ->whereNotIn('status', ['cancelled'])
            ->select([
                DB::raw('YEAR(placed_at) as year'),
                DB::raw('MONTH(placed_at) as month'),
                DB::raw('DAY(placed_at) as day'),
                DB::raw('SUM(subtotal_amount) as order_amount'),
                DB::raw('SUM(shipping_fee) as shipping_fee'),
                DB::raw('SUM(discount_amount) as discount_amount'),
                DB::raw('SUM(total_amount) as total_amount'),
                DB::raw('SUM(tax_amount) as vat'),
                DB::raw('SUM(point_discount) as point_used'),
                DB::raw('SUM(total_amount - point_discount) as billed_amount'),
                DB::raw('SUM(CASE WHEN payment_status = "paid" THEN total_amount - point_discount ELSE 0 END) as paid_amount'),
                DB::raw('0 as prepaid'),
                DB::raw('SUM(CASE WHEN payment_status != "paid" AND payment_status != "cancelled" THEN total_amount - point_discount ELSE 0 END) as unpaid_amount'),
                DB::raw('SUM(CASE WHEN payment_status = "refunded" THEN total_amount ELSE 0 END) as refund_amount'),
            ])
            ->groupBy('year', 'month', 'day')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->orderBy('day', 'desc');

        if (! empty($filters['months'])) {
            $query->where('placed_at', '>=', now()->subMonths((int) $filters['months']));
        }

        if (! empty($filters['search'])) {
            $query->where('order_number', 'like', '%'.$filters['search'].'%');
        }

        $rows = $query->get();

        $grouped = $rows->groupBy('month')->map(function ($days, $month) {
            return [
                'month'  => $month,
                'days'   => $days->map(fn ($row) => $this->formatRow($row))->values(),
                'totals' => $this->sumGroup($days),
            ];
        })->values();

        return [
            'items'  => $grouped,
            'totals' => $this->sumGroup($rows),
        ];
    }

    private function formatRow(object $row): array
    {
        $total        = (float) $row->total_amount;
        $vat          = (float) $row->vat;
        $supplyPrice  = $total - $vat;
        $paidAmount   = (float) $row->paid_amount;

        return [
            'month'            => (int) $row->month,
            'day'              => (int) $row->day,
            'order_amount'     => (string) $row->order_amount,    // 주문원가
            'shipping_fee'     => (string) $row->shipping_fee,    // 배송비
            'discount_amount'  => (string) $row->discount_amount, // 할인금액
            'total_amount'     => (string) $total,                // 합계금액
            'supply_price'     => (string) $supplyPrice,          // 공급가액
            'vat'              => (string) $vat,                  // 부가세
            'paid_amount'      => (string) $paidAmount,           // 입금액
            'payment_settlement' => (string) $paidAmount,         // 입금정산 (= 입금액)
            'prepaid'          => '0',                            // 잔고
            'unpaid_amount'    => (string) $row->unpaid_amount,   // 미납액
            'refund_amount'    => (string) $row->refund_amount,   // 환불
        ];
    }

    private function sumGroup(Collection $rows): array
    {
        $totalSum       = (float) $rows->sum('total_amount');
        $vatSum         = (float) $rows->sum('vat');
        $supplyPriceSum = $totalSum - $vatSum;
        $paidSum        = (float) $rows->sum('paid_amount');

        return [
            'order_amount'       => (string) $rows->sum('order_amount'),
            'shipping_fee'       => (string) $rows->sum('shipping_fee'),
            'discount_amount'    => (string) $rows->sum('discount_amount'),
            'total_amount'       => (string) $totalSum,
            'supply_price'       => (string) $supplyPriceSum,
            'vat'                => (string) $vatSum,
            'paid_amount'        => (string) $paidSum,
            'payment_settlement' => (string) $paidSum,
            'prepaid'            => '0',
            'unpaid_amount'      => (string) $rows->sum('unpaid_amount'),
            'refund_amount'      => (string) $rows->sum('refund_amount'),
        ];
    }
}
