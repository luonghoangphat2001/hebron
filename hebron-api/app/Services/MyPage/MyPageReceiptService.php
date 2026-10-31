<?php

namespace App\Services\MyPage;

use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\PaymentTransaction;

class MyPageReceiptService
{
    private const CASH_RECEIPT_COLUMN = 'cash_receipt_status';
    private const TAX_INVOICE_COLUMN  = 'tax_invoice_status';
    private const STATUS_DELETED      = 'deleted';

    public function __construct(
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get paginated list for 현금영수증 (Cash Receipt — individual members).
     */
    public function getCashReceiptList(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->buildQuery($user, $filters, $perPage, self::CASH_RECEIPT_COLUMN);
    }

    /**
     * Get paginated list for 세금계산서 (Tax Invoice — corporate members).
     */
    public function getTaxInvoiceList(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->buildQuery($user, $filters, $perPage, self::TAX_INVOICE_COLUMN);
    }

    private function buildQuery(User $user, array $filters, int $perPage, string $statusColumn): LengthAwarePaginator
    {
        $query = PaymentTransaction::with('order')
            ->whereHas('order', fn ($q) => $q->where('user_id', $user->id))
            ->whereNotNull($statusColumn)
            ->where($statusColumn, '!=', self::STATUS_DELETED);

        if (! empty($filters['months'])) {
            $query->where('paid_at', '>=', now()->subMonths((int) $filters['months']));
        }

        if (! empty($filters['years'])) {
            $query->where('paid_at', '>=', now()->subYears((int) $filters['years']));
        }

        return $query->orderBy('paid_at', 'desc')->paginate($perPage);
    }
}
