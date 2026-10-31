<?php

namespace App\Services;

use App\Models\CategoryProduct;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class SortOrderService
{
    private const GAP = 1000;

    private const MAX_SORT_ORDER = 2_000_000_000;

    /**
     * Get the next sort order for a model.
     *
     * Example:
     * 1000, 2000, 3000 -> 4000
     */
    public function getNext(
        Model $model,
        array $scope = [],
    ): int {
        $query = $this->newQuery($model, $scope);

        $max = $query->max('sort_order');

        if ($max === null) {
            return self::GAP;
        }

        $next = (int) $max + self::GAP;

        if ($next > self::MAX_SORT_ORDER) {
            $this->rebalance($model, $scope);

            $max = $this->newQuery($model, $scope)->max('sort_order');

            return ((int) $max) + self::GAP;
        }

        return $next;
    }

    /**
     * Move a model to a new position.
     *
     * $before = item immediately before the new position
     * $after  = item immediately after the new position
     */
    public function move(
        Model $model,
        ?Model $before = null,
        ?Model $after = null,
        array $scope = [],
    ): int {
        $this->validateModels($model, $before, $after);

        return DB::transaction(function () use (
            $model,
            $before,
            $after,
            $scope
        ) {
            /*
             * Lock the neighboring rows.
             *
             * This reduces the chance of two concurrent reorder
             * requests calculating the same sort_order.
             */
            if ($before !== null) {
                $this->lockModel($before);
            }

            if ($after !== null) {
                $this->lockModel($after);
            }

            /*
             * Moving to the only/empty position.
             */
            if ($before === null && $after === null) {
                $sortOrder = $this->getNext($model, $scope);

                $this->updateSortOrder($model, $sortOrder);

                return $sortOrder;
            }

            /*
             * Moving to the beginning.
             */
            if ($before === null) {
                $sortOrder = $this->getBefore(
                    (int) $after->sort_order
                );

                /*
                 * There is no room before the first item.
                 */
                if ($sortOrder <= 0) {
                    $this->rebalance($model, $scope);

                    $after->refresh();

                    $sortOrder = intdiv(
                        (int) $after->sort_order,
                        2
                    );
                }

                $this->updateSortOrder($model, $sortOrder);

                return $sortOrder;
            }

            /*
             * Moving to the end.
             */
            if ($after === null) {
                $sortOrder = $this->getAfter(
                    (int) $before->sort_order
                );

                if ($sortOrder > self::MAX_SORT_ORDER) {
                    $this->rebalance($model, $scope);

                    $before->refresh();

                    $sortOrder =
                        (int) $before->sort_order + self::GAP;
                }

                $this->updateSortOrder($model, $sortOrder);

                return $sortOrder;
            }

            /*
             * Moving between two items.
             */
            $beforeSortOrder = (int) $before->sort_order;
            $afterSortOrder = (int) $after->sort_order;

            /*
             * Make sure the order is valid.
             */
            if ($beforeSortOrder >= $afterSortOrder) {
                throw new InvalidArgumentException(
                    'Before sort_order must be less than after sort_order.'
                );
            }

            /*
             * There is no room between the two items.
             */
            if (($afterSortOrder - $beforeSortOrder) <= 1) {
                $this->rebalance($model, $scope);

                $before->refresh();
                $after->refresh();

                $beforeSortOrder = (int) $before->sort_order;
                $afterSortOrder = (int) $after->sort_order;
            }

            $sortOrder = intdiv(
                $beforeSortOrder + $afterSortOrder,
                2
            );

            /*
             * Extremely defensive check.
             */
            if (
                $sortOrder <= $beforeSortOrder ||
                $sortOrder >= $afterSortOrder
            ) {
                $this->rebalance($model, $scope);

                $before->refresh();
                $after->refresh();

                $sortOrder = intdiv(
                    (int) $before->sort_order +
                        (int) $after->sort_order,
                    2
                );
            }

            $this->updateSortOrder($model, $sortOrder);

            return $sortOrder;
        });
    }

    public function moveToPosition(
        Model $model,
        int $position,
        array $scope = [],
    ): int {
        return DB::transaction(function () use (
            $model,
            $position,
            $scope
        ) {
            $baseQuery = $this->newQuery($model, $scope)
                ->whereKeyNot($model->getKey());

            $total = (clone $baseQuery)->count();

            $position = max(1, min($position, $total + 1));

            $tieBreaker = $this->getTieBreakerColumn($model);

            if ($position === $total + 1) {
                $last = (clone $baseQuery)
                    ->orderByDesc('sort_order')
                    ->orderByDesc($tieBreaker)
                    ->lockForUpdate()
                    ->first();

                $sortOrder = $last
                    ? (int) $last->sort_order + self::GAP
                    : self::GAP;

                if ($sortOrder > self::MAX_SORT_ORDER) {
                    $this->rebalance($model, $scope);

                    $last = (clone $baseQuery)
                        ->orderByDesc('sort_order')
                        ->orderByDesc($tieBreaker)
                        ->lockForUpdate()
                        ->first();

                    $sortOrder = $last
                        ? (int) $last->sort_order + self::GAP
                        : self::GAP;
                }

                $this->updateSortOrder($model, $sortOrder);

                return $sortOrder;
            }

            $after = (clone $baseQuery)
                ->orderBy('sort_order')
                ->orderBy($tieBreaker)
                ->offset($position - 1)
                ->lockForUpdate()
                ->first();

            if (! $after) {
                $sortOrder = self::GAP;

                $this->updateSortOrder($model, $sortOrder);

                return $sortOrder;
            }

            if ($position === 1) {
                $sortOrder = (int) $after->sort_order - self::GAP;

                if ($sortOrder <= 0) {
                    $this->rebalance($model, $scope);

                    $after->refresh();

                    $sortOrder = intdiv(
                        (int) $after->sort_order,
                        2
                    );
                }

                $this->updateSortOrder($model, $sortOrder);

                return $sortOrder;
            }

            $before = (clone $baseQuery)
                ->where('sort_order', '<=', $after->sort_order)
                ->where(
                    $model->getKeyName(),
                    '!=',
                    $after->getKey()
                )
                ->orderByDesc('sort_order')
                ->orderByDesc($tieBreaker)
                ->lockForUpdate()
                ->first();

            if (! $before) {
                $sortOrder = (int) $after->sort_order - self::GAP;

                $this->updateSortOrder($model, $sortOrder);

                return $sortOrder;
            }

            $beforeSortOrder = (int) $before->sort_order;
            $afterSortOrder = (int) $after->sort_order;

            if (($afterSortOrder - $beforeSortOrder) <= 1) {
                $this->rebalance($model, $scope);

                $before->refresh();
                $after->refresh();

                $beforeSortOrder = (int) $before->sort_order;
                $afterSortOrder = (int) $after->sort_order;
            }

            $sortOrder = intdiv(
                $beforeSortOrder + $afterSortOrder,
                2
            );

            if (
                $sortOrder <= $beforeSortOrder ||
                $sortOrder >= $afterSortOrder
            ) {
                $this->rebalance($model, $scope);

                $before->refresh();
                $after->refresh();

                $sortOrder = intdiv(
                    (int) $before->sort_order +
                        (int) $after->sort_order,
                    2
                );
            }

            $this->updateSortOrder($model, $sortOrder);

            return $sortOrder;
        });
    }

    /**
     * Rebuild all sort orders in the current scope.
     *
     * Example:
     *
     * 1000
     * 1500
     * 1501
     * 1502
     *
     * becomes:
     *
     * 1000
     * 2000
     * 3000
     * 4000
     */
    public function rebalance(
        Model $model,
        array $scope = [],
    ): void {
        $tieBreaker = $this->getTieBreakerColumn($model);

        $query = $this->newQuery($model, $scope)
            ->select([
                $model->getKeyName(),
                'sort_order',
                $tieBreaker,
            ])
            ->orderBy('sort_order')
            ->orderBy($tieBreaker)
            ->lockForUpdate();

        $sortOrder = self::GAP;

        foreach ($query->get() as $item) {
            $model->newQuery()
                ->whereKey($item->getKey())
                ->update([
                    'sort_order' => $sortOrder,
                ]);

            $sortOrder += self::GAP;
        }
    }

    /**
     * Get the secondary order/tie-breaker column for consistent ordering.
     */
    private function getTieBreakerColumn(Model $model): string
    {
        if ($model instanceof CategoryProduct) {
            return 'product_id';
        }

        return $model->getKeyName();
    }

    /**
     * Get a sort_order before the given value.
     */
    private function getBefore(int $sortOrder): int
    {
        return $sortOrder - self::GAP;
    }

    /**
     * Get a sort_order after the given value.
     */
    private function getAfter(int $sortOrder): int
    {
        return $sortOrder + self::GAP;
    }

    /**
     * Update model sort_order.
     */
    private function updateSortOrder(
        Model $model,
        int $sortOrder,
    ): void {
        $model->update([
            'sort_order' => $sortOrder,
        ]);
    }

    /**
     * Create query with optional scope.
     */
    private function newQuery(
        Model $model,
        array $scope = [],
    ): Builder {
        $query = $model->newQuery();

        foreach ($scope as $column => $value) {
            if ($value === null) {
                $query->whereNull($column);
            } else {
                $query->where($column, $value);
            }
        }

        return $query;
    }

    /**
     * Lock a model row.
     */
    private function lockModel(Model $model): void
    {
        $model->newQuery()
            ->whereKey($model->getKey())
            ->lockForUpdate()
            ->first();
    }

    /**
     * Validate that all models belong to the same table.
     */
    private function validateModels(
        Model $model,
        ?Model $before,
        ?Model $after,
    ): void {
        if ($before !== null && $model->getTable() !== $before->getTable()) {
            throw new InvalidArgumentException(
                'Model and before model must use the same table.'
            );
        }

        if ($after !== null && $model->getTable() !== $after->getTable()) {
            throw new InvalidArgumentException(
                'Model and after model must use the same table.'
            );
        }

        if (
            $before !== null &&
            $after !== null &&
            $before->is($after)
        ) {
            throw new InvalidArgumentException(
                'Before and after models cannot be the same.'
            );
        }

        if ($model->is($before) || $model->is($after)) {
            throw new InvalidArgumentException(
                'The model cannot be the before or after model.'
            );
        }
    }
}
