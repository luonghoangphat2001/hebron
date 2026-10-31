<?php

namespace App\Http\Controllers\Api;

use App\Enums\PostCategoryPageType;
use App\Http\Resources\ExampleSentenceSampleResource;
use App\Http\Resources\PostCategoryResource;
use App\Models\ExampleSentenceSample;
use App\Models\PostCategory;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExampleSentenceSampleController extends BaseController
{
    public function __construct(private readonly PaginationService $paginationService) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('post_categories', 'id')->where(
                    'page_type',
                    PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE->value,
                ),
            ],
            'title' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $paginator = ExampleSentenceSample::query()
            ->where('is_active', true)
            ->when($validated['category_id'] ?? null, fn ($query, $categoryId) => $query->whereHas(
                'categories',
                fn ($categoryQuery) => $categoryQuery->where('post_categories.id', $categoryId),
            ))
            ->when($validated['title'] ?? null, fn ($query, $title) => $query->where('title', 'like', "%{$title}%"))
            ->latest('id')
            ->paginate((int) ($validated['per_page'] ?? 20));

        return $this->responsePaginatedSuccess(200, 'Example sentence samples retrieved successfully.', [
            'example_sentence_samples' => ExampleSentenceSampleResource::collection($paginator->items()),
        ], $this->paginationService->format($paginator));
    }

    public function categories(): JsonResponse
    {
        $pageType = PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE;
        $categories = PostCategory::query()
            ->withCount([$pageType->relationName().' as total_post'])
            ->where('page_type', $pageType->value)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return $this->responseSuccess(200, 'Example sentence sample categories retrieved successfully.', [
            'categories' => PostCategoryResource::collection($categories),
        ]);
    }

    public function categoryDetail(int $id): JsonResponse
    {
        $pageType = PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE;
        $category = PostCategory::query()
            ->withCount([$pageType->relationName().' as total_post'])
            ->where('page_type', $pageType->value)
            ->where('is_active', true)
            ->findOrFail($id);

        return $this->responseSuccess(200, 'Example sentence sample category retrieved successfully.', [
            'category' => new PostCategoryResource($category),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $sample = ExampleSentenceSample::query()
            ->where('is_active', true)
            ->findOrFail($id);
        $sample->increment('view_count');
        $sample->refresh();

        return $this->responseSuccess(200, 'Example sentence sample retrieved successfully.', [
            'example_sentence_sample' => new ExampleSentenceSampleResource($sample),
        ]);
    }
}
