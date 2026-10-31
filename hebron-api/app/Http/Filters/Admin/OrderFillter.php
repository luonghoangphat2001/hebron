<?php

namespace App\Http\Filters\Admin;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class OrderFillter
{
    /**
     * Apply filters to the query
     */
    public function apply(Builder $query, array $filters): Builder
    {
        return $query
            ->when(isset($filters['start_date']), function ($query) use ($filters) {
                $start_date = Carbon::parse($filters['start_date'])->startOfDay();
                $query->where('orders.created_at', '>=', $start_date);
            })
            ->when(isset($filters['end_date']), function ($query) use ($filters) {
                $end_date = Carbon::parse($filters['end_date'])->endOfDay();
                $query->where('orders.created_at', '<=', $end_date);
            })
            ->when(isset($filters['customer_ids']) && ! empty($filters['customer_ids']), function ($query) use ($filters) {
                $query->whereHas('user', function ($q) use ($filters) {
                    $q->whereIn('customer_id', $filters['customer_ids']);
                });
            })
            ->when(isset($filters['status']) && ! empty($filters['status']), function ($query) use ($filters) {
                $query->where('orders.status', $filters['status']);
            });
    }
}
