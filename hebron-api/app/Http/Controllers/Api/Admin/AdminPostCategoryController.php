<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\PostCategoryPageType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\PostCategory\AdminPostCategoryListRequest;
use App\Http\Resources\PostCategoryResource;
use App\Models\PostCategory;
use App\Services\Cache;
use App\Services\PaginationService;
use App\Services\PostCategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminPostCategoryController extends BaseController
{
    public function __construct(
        private readonly PostCategoryService $service,
        private readonly PaginationService $paginationService,
        private readonly Cache $cache,
    ) {}

    public function index(AdminPostCategoryListRequest $request, string $page): JsonResponse
    {
        $pageType = $this->pageType($page);
        $filters = $request->validated();
        $query = PostCategory::query()
            ->withCount([$pageType->relationName().' as total_post'])
            ->where('page_type', $pageType->value)
            ->when(array_key_exists('is_active', $filters), fn ($query) => $query->where('is_active', $filters['is_active']))
            ->when($filters['keyword'] ?? null, fn ($query, $keyword) => $query->where('name', 'like', "%{$keyword}%"))
            ->orderBy('name');

        if ($pageType === PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE) {
            $paginator = $query->paginate((int) ($filters['per_page'] ?? 20));

            return $this->responsePaginatedSuccess(200, 'Post categories retrieved successfully.', [
                'categories' => PostCategoryResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        }

        $categories = $query->get();

        return $this->responseSuccess(200, 'Post categories retrieved successfully.', [
            'categories' => PostCategoryResource::collection($categories),
        ]);
    }

    public function store(Request $request, string $page): JsonResponse
    {
        $pageType = $this->pageType($page);
        $data = $request->validate($this->rules($request, $pageType));
        $data['page_type'] = $pageType->value;
        $category = PostCategory::query()->create($data);
        $this->cache->invalidate([$page, 'pages']);

        return $this->responseSuccess(201, 'Post category created successfully.', [
            'category' => new PostCategoryResource($category),
        ]);
    }

    public function show(string $page, int $id): JsonResponse
    {
        $pageType = $this->pageType($page);
        $category = PostCategory::query()
            ->withCount([$pageType->relationName().' as total_post'])
            ->where('page_type', $pageType->value)
            ->findOrFail($id);

        return $this->responseSuccess(200, 'Post category retrieved successfully.', [
            'category' => new PostCategoryResource($category),
        ]);
    }

    public function update(Request $request, string $page, int $id): JsonResponse
    {
        $pageType = $this->pageType($page);
        $postCategory = $this->findForPage($pageType, $id);
        $data = $request->validate($this->rules($request, $pageType, $postCategory, true));
        $postCategory->update($data);
        if (array_key_exists('name', $data)) {
            $this->service->syncLegacyCategoryName($postCategory);
        }
        $this->cache->invalidate([$page, 'pages']);

        return $this->responseSuccess(200, 'Post category updated successfully.', [
            'category' => new PostCategoryResource($postCategory->fresh()),
        ]);
    }

    public function destroy(string $page, int $id): JsonResponse
    {
        $postCategory = $this->findForPage($this->pageType($page), $id);
        abort_if($this->isInUse($postCategory), 409, 'Category is currently in use.');
        $postCategory->delete();
        $this->cache->invalidate([$page, 'pages']);

        return $this->responseSuccess(200, 'Post category deleted successfully.');
    }

    private function rules(
        Request $request,
        PostCategoryPageType $pageType,
        ?PostCategory $category = null,
        bool $partial = false,
    ): array {
        $nameRule = Rule::unique('post_categories', 'name')
            ->where(fn ($query) => $query->where('page_type', $pageType->value))
            ->ignore($category?->id);
        $boardCategoryRule = Rule::unique('post_categories', 'board_category_no')
            ->where(fn ($query) => $query->where('page_type', $pageType->value))
            ->ignore($category?->id);

        return [
            'name' => [$partial ? 'sometimes' : 'required', 'string', 'max:100', $nameRule],
            ...($pageType === PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE ? [] : [
                'board_category_no' => array_values(array_filter([
                    'nullable', 'integer', 'min:1', $request->filled('board_category_no') ? $boardCategoryRule : null,
                ])),
            ]),
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    private function pageType(string $page): PostCategoryPageType
    {
        return match ($page) {
            'notices' => PostCategoryPageType::NOTICE,
            'faqs' => PostCategoryPageType::FAQ,
            'portfolios' => PostCategoryPageType::PORTFOLIO,
            'media' => PostCategoryPageType::MEDIA,
            'example-sentence-samples' => PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE,
        };
    }

    private function findForPage(PostCategoryPageType $pageType, int $id): PostCategory
    {
        return PostCategory::query()
            ->where('page_type', $pageType->value)
            ->findOrFail($id);
    }

    private function isInUse(PostCategory $category): bool
    {
        return $category->notices()->exists()
            || $category->faqs()->exists()
            || $category->portfolios()->exists()
            || $category->media()->exists()
            || $category->exampleSentenceSamples()->exists();
    }
}
