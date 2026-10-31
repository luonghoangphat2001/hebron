<?php

namespace App\Services\Admin;

use App\Enums\OrderStatus;
use App\Enums\UserAuthority;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Arr;

class AdminCustomerStatisticsService
{
    /**
     * Get customer statistics from the existing customer user/order relations.
     */
    public function getCustomerStatistics(array $filters = []): array
    {
        $customers = $this->buildQuery($filters)->get();
        $details = $customers->map(fn (User $customer) => $this->mapCustomer($customer))->values()->all();

        return [
            'summary' => $this->summary($details),
            'customer_activity_status' => $this->activityStatus($details),
            'customer_details' => $details,
        ];
    }

    protected function buildQuery(array $filters = [])
    {
        $query = User::query()
            ->where('authority', UserAuthority::USER->value)
            ->withCount(['orders as orders_count' => function ($query) {
                $query->where('status', '!=', OrderStatus::Cancelled->value);
            }])
            ->withSum(['orders as cumulative_sales' => function ($query) {
                $query->where('status', OrderStatus::Completed->value);
            }], 'total_amount')
            ->withAvg(['orders as average_order_amount' => function ($query) {
                $query->where('status', '!=', OrderStatus::Cancelled->value);
            }], 'total_amount')
            ->withMax(['orders as last_order' => function ($query) {
                $query->where('status', '!=', OrderStatus::Cancelled->value);
            }], 'created_at');

        $customerIds = Arr::get($filters, 'customer_ids');
        if (is_array($customerIds) && $customerIds !== []) {
            $query->whereIn('users.id', $customerIds);
        }

        $salesRepresentative = Arr::get($filters, 'sales_representative');
        if ($salesRepresentative) {
            $query->where('representative_name', 'like', "%{$salesRepresentative}%");
        }

        return $query->orderBy('id');
    }

    private function mapCustomer(User $customer): array
    {
        $lastOrder = $customer->last_order ? now()->parse($customer->last_order) : null;
        $isNew = $customer->created_at?->gte(now()->copy()->subDays(30)) ?? false;
        $status = match (true) {
            $isNew => 'new',
            $customer->status !== UserStatus::ACTIVE => 'inactive',
            ! $lastOrder || $lastOrder->lt(now()->copy()->subDays(90)) => 'dormant',
            default => 'active',
        };

        return [
            'customer_id' => $customer->id,
            'customer_name' => $customer->company_name ?: $customer->name,
            'status' => $status,
            'orders' => (int) ($customer->orders_count ?? 0),
            'cumulative_sales' => (float) ($customer->cumulative_sales ?? 0),
            'aov' => round((float) ($customer->average_order_amount ?? 0), 2),
            'sales_rep' => $customer->representative_name,
            'last_order' => $lastOrder?->toDateTimeString(),
        ];
    }

    private function summary(array $details): array
    {
        $total = count($details);
        $new = count(array_filter($details, fn ($item) => $item['status'] === 'new'));
        $active = count(array_filter($details, fn ($item) => $item['status'] === 'active'));
        $sales = array_sum(array_column($details, 'cumulative_sales'));

        return [
            'total_customers' => ['value' => $total, 'label' => 'Total Customers', 'unit' => 'count'],
            'new_customers' => ['value' => $new, 'label' => 'New Customers', 'unit' => 'count'],
            'active_rate' => ['value' => $total > 0 ? round(($active / $total) * 100, 2) : 0, 'label' => 'Active Rate', 'unit' => 'percent'],
            'avg_ltv' => ['value' => $total > 0 ? round($sales / $total, 2) : 0, 'label' => 'Avg. LTV', 'unit' => 'amount'],
        ];
    }

    private function activityStatus(array $details): array
    {
        $total = count($details);
        $result = [];
        foreach (['active', 'new', 'inactive', 'dormant'] as $status) {
            $count = count(array_filter($details, fn ($item) => $item['status'] === $status));
            $result[$status] = [
                'value' => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100, 2) : 0,
                'label' => ucfirst($status),
                'unit' => 'count',
            ];
        }

        return $result;
    }
}
