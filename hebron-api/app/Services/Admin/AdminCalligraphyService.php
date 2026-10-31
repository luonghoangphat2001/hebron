<?php

namespace App\Services\Admin;

use App\Models\Calligraphy;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminCalligraphyService
{
    public function getCalligraphies(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Calligraphy::query();

        if (Arr::get($filters, 'type')) {
            $query->where('type', $filters['type']);
        }

        if (Arr::get($filters, 'search')) {
            $query->where('text', 'like', '%'.$filters['search'].'%');
        }

        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        return $query
            ->orderBy($sortBy, $sortOrder)
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function getCalligraphy(int $id): Calligraphy
    {
        return Calligraphy::query()->findOrFail($id);
    }

    public function createCalligraphy(User $admin, array $data): Calligraphy
    {
        return Calligraphy::query()->create([
            'image_path' => $data['image_path'],
            'type' => $data['type'],
            'text' => $data['text'] ?? null,
            'created_by' => $admin->id,
        ]);
    }

    public function updateCalligraphy(int $id, array $data): Calligraphy
    {
        return DB::transaction(function () use ($id, $data) {
            $calligraphy = Calligraphy::query()->findOrFail($id);
            $calligraphy->update(Arr::only($data, ['image_path', 'type', 'text']));

            return $calligraphy->fresh();
        });
    }

    /**
     * @param  array<int, int>  $calligraphyIds
     * @return array<string, int>
     */
    public function bulkUpdateType(array $calligraphyIds, string $value): array
    {
        return DB::transaction(function () use ($calligraphyIds, $value) {
            $updated = Calligraphy::query()
                ->whereIn('id', $calligraphyIds)
                ->update(['type' => $value]);

            return [
                'updated_count' => $updated,
                'total_count' => count($calligraphyIds),
            ];
        });
    }

    public function deleteCalligraphy(int $id): void
    {
        DB::transaction(function () use ($id) {
            Calligraphy::query()->findOrFail($id)->delete();
        });
    }

    /**
     * @param  array<int, int>  $calligraphyIds
     * @return array<string, int>
     */
    public function bulkDelete(array $calligraphyIds): array
    {
        return DB::transaction(function () use ($calligraphyIds) {
            $deleted = Calligraphy::query()
                ->whereIn('id', $calligraphyIds)
                ->delete();

            return [
                'deleted_count' => $deleted,
                'total_count' => count($calligraphyIds),
            ];
        });
    }
}
