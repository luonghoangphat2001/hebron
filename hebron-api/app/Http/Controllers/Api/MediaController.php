<?php

namespace App\Http\Controllers\Api;

use App\Enums\PostCategoryPageType;
use App\Enums\SiteType;
use App\Http\Resources\MediaResource;
use App\Http\Resources\PostCategoryResource;
use App\Models\Media;
use App\Models\PostCategory;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MediaController extends BaseController
{
    public function __construct(private readonly PaginationService $paginationService) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'site_type' => ['nullable', Rule::enum(SiteType::class)],
            'category_id' => ['nullable', 'integer', 'exists:post_categories,id'],
        ]);

        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);
        $media = Media::query()
            ->active()
            ->when($validated['site_type'] ?? null, fn ($query, $siteType) => $query->ofSite($siteType))
            ->when($validated['category_id'] ?? null, fn ($query, $categoryId) => $query->whereHas(
                'categories',
                fn ($categoryQuery) => $categoryQuery->where('post_categories.id', $categoryId)
                    ->where('page_type', PostCategoryPageType::MEDIA->value),
            ))
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate($perPage);

        return $this->responsePaginatedSuccess(200, 'Media retrieved successfully.', [
            'media' => MediaResource::collection($media->items()),
        ], $this->paginationService->format($media));
    }

    public function brandIndex(Request $request): JsonResponse
    {
        $request->merge(['site_type' => SiteType::BRAND_SITE->value]);

        return $this->index($request);
    }

    public function show(int $id): JsonResponse
    {
        $media = Media::query()->active()->find($id);

        if (! $media) {
            return response()->json([
                'success' => false,
                'message' => 'Media를 찾을 수 없습니다.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'media' => new MediaResource($media),
            ],
        ]);
    }

    public function categories(): JsonResponse
    {
        $pageType = PostCategoryPageType::MEDIA;
        $categories = PostCategory::query()
            ->withCount([$pageType->relationName().' as total_post'])
            ->where('page_type', $pageType->value)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return $this->responseSuccess(200, 'Media categories retrieved successfully.', [
            'categories' => PostCategoryResource::collection($categories),
        ]);
    }

    public function categoryDetail(int $id): JsonResponse
    {
        $pageType = PostCategoryPageType::MEDIA;
        $category = PostCategory::query()
            ->withCount([$pageType->relationName().' as total_post'])
            ->where('page_type', $pageType->value)
            ->where('is_active', true)
            ->findOrFail($id);

        return $this->responseSuccess(200, 'Media category retrieved successfully.', [
            'category' => new PostCategoryResource($category),
        ]);
    }
}
