<?php

namespace App\Services\Admin;

use App\Enums\PostCategoryPageType;
use App\Models\Media;
use App\Models\PostCategory;
use App\Models\User;
use App\Services\PostCategoryService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;

class AdminMediaService
{
    public function __construct(private readonly PostCategoryService $categories) {}

    public function getMedia(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Media::query()->with('createdBy');
        $query->when(Arr::get($filters, 'site_type'), fn ($q, $v) => $q->where('site_type', $v));
        $query->when(Arr::get($filters, 'category_id'), fn ($q, $v) => $q->whereHas('categories', fn ($categoryQuery) => $categoryQuery->where('post_categories.id', $v)));
        $query->when(Arr::get($filters, 'is_active') !== null && Arr::get($filters, 'is_active') !== '', fn ($q) => $q->where('is_active', filter_var(Arr::get($filters, 'is_active'), FILTER_VALIDATE_BOOLEAN)));
        $query->when(Arr::get($filters, 'keyword'), fn ($q, $v) => $q->where('title', 'like', '%'.$v.'%'));

        return $query->orderBy('sort_order')->orderByDesc('id')->paginate($perPage);
    }

    public function create(User $user, array $data): Media
    {
        $categoryId = $data['category_id'];
        unset($data['category_id']);
        $data['site_type'] ??= 'BRAND_SITE';
        $data['created_by'] = $user->id;
        $media = Media::create($data);
        $this->categories->assign(
            PostCategoryPageType::MEDIA->value,
            $media->id,
            PostCategory::query()->findOrFail($categoryId),
        );

        return $media->fresh(['createdBy', 'categories']);
    }

    public function get(int $id): Media
    {
        return Media::with(['createdBy', 'categories'])->findOrFail($id);
    }

    public function update(int $id, array $data): Media
    {
        $hasCategory = array_key_exists('category_id', $data);
        $categoryId = $data['category_id'] ?? null;
        unset($data['category_id']);

        $media = Media::findOrFail($id);
        $media->update($data);

        if ($hasCategory) {
            $this->categories->assign(
                PostCategoryPageType::MEDIA->value,
                $media->id,
                PostCategory::query()->findOrFail($categoryId),
            );
        }

        return $media->fresh(['createdBy', 'categories']);
    }

    public function delete(int $id): void
    {
        Media::findOrFail($id)->delete();
    }
}
