<?php

namespace App\Services\Admin;

use App\Exceptions\BackgroundInUseException;
use App\Models\Background;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminBackgroundService
{
    public function getBackgrounds(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Background::query()->withCount('templates');

        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        return $query
            ->orderBy($sortBy, $sortOrder)
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function getBackground(int $id): Background
    {
        return Background::query()->withCount('templates')->findOrFail($id);
    }

    public function createBackground(User $admin, array $data): Background
    {
        return Background::create([
            'image_path' => $data['image_path'],
            'created_by' => $admin->id,
        ])->loadCount('templates');
    }

    public function updateBackground(int $id, array $data): Background
    {
        return DB::transaction(function () use ($id, $data) {
            $background = Background::query()->findOrFail($id);
            $background->update(Arr::only($data, ['image_path']));

            return $background->fresh()->loadCount('templates');
        });
    }

    public function deleteBackground(int $id): void
    {
        DB::transaction(function () use ($id) {
            $background = Background::query()->findOrFail($id);

            $this->ensureBackgroundsAreUnused([$id]);

            $background->delete();
        });
    }

    /**
     * @param  array<int, int>  $backgroundIds
     * @return array<string, int>
     */
    public function bulkDelete(array $backgroundIds): array
    {
        return DB::transaction(function () use ($backgroundIds) {
            $this->ensureBackgroundsAreUnused($backgroundIds);

            $deleted = Background::query()
                ->whereIn('id', $backgroundIds)
                ->delete();

            return [
                'deleted_count' => $deleted,
                'total_count' => count($backgroundIds),
            ];
        });
    }

    /**
     * @param  array<int, int>  $backgroundIds
     */
    private function ensureBackgroundsAreUnused(array $backgroundIds): void
    {
        $backgrounds = Background::query()
            ->whereIn('id', $backgroundIds)
            ->whereHas('templates')
            ->with(['templates:id,name,background_id'])
            ->get()
            ->map(fn (Background $background) => [
                'id' => $background->id,
                'image_path' => $background->image_path,
                'templates' => $background->templates->map(fn ($template) => [
                    'id' => $template->id,
                    'name' => $template->name,
                ])->values()->all(),
            ])
            ->values()
            ->all();

        if ($backgrounds !== []) {
            throw new BackgroundInUseException($backgrounds);
        }
    }
}
