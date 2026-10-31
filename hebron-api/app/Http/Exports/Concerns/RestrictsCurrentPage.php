<?php

namespace App\Http\Exports\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait RestrictsCurrentPage
{
    /**
     * Restrict a queued FromQuery export to IDs in one requested page.
     *
     * Laravel Excel applies its own forPage() when it processes queued chunks,
     * so an offset/limit placed directly on the export query would be overwritten.
     */
    protected function restrictToCurrentPage(Builder $query, int $currentPage, int $perPage): Builder
    {
        $model = $query->getModel();
        $key = $model->qualifyColumn($model->getKeyName());

        $pageIds = (clone $query)
            ->forPage($currentPage, $perPage)
            ->pluck($key)
            ->all();

        return $query->whereIn($key, $pageIds);
    }
}
