<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Portfolio\AdminPortfolioListRequest;
use App\Http\Requests\Admin\Portfolio\AdminPortfolioStoreRequest;
use App\Http\Requests\Admin\Portfolio\AdminPortfolioUpdateRequest;
use App\Http\Resources\Admin\AdminPortfolioResource;
use App\Models\Portfolio;
use App\Enums\PostCategoryPageType;
use App\Models\PostCategory;
use App\Services\PostCategoryService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminPortfolioController extends BaseController
{
    public function __construct(
        protected PaginationService $paginationService,
        protected PostCategoryService $postCategories,
    ) {}

    public function index(AdminPortfolioListRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $query = Portfolio::query();

        if (! empty($filters['site_type'])) {
            $query->ofSite($filters['site_type']);
        }

        if (! empty($filters['title'])) {
            $query->where('title', 'like', "%{$filters['title']}%");
        }

        if (! empty($filters['category'])) {
            $query->where('category', 'like', "%{$filters['category']}%");
        }

        if (isset($filters['year'])) {
            $query->where('year', $filters['year']);
        }

        foreach (['is_active', 'is_featured'] as $field) {
            if (array_key_exists($field, $filters)) {
                $query->where($field, filter_var($filters[$field], FILTER_VALIDATE_BOOLEAN));
            }
        }

        $paginator = $query->orderBy('sort_order')->orderBy('id')->paginate((int) ($filters['per_page'] ?? 20));

        return $this->responsePaginatedSuccess(200, 'Portfolio 목록이 성공적으로 조회되었습니다.', [
            'portfolios' => AdminPortfolioResource::collection($paginator->items()),
        ], $this->paginationService->format($paginator));
    }

    public function show(int $id): JsonResponse
    {
        return $this->responseSuccess(200, 'Portfolio가 성공적으로 조회되었습니다.', [
            'portfolio' => new AdminPortfolioResource(Portfolio::findOrFail($id)),
        ]);
    }

    public function store(AdminPortfolioStoreRequest $request): JsonResponse
    {
        $data = $request->validated();
        $categoryId = $data['category_id'] ?? null;
        unset($data['category_id']);
        $portfolio = Portfolio::create($data);

        if ($categoryId !== null) {
            $this->postCategories->assign(
                PostCategoryPageType::PORTFOLIO->value,
                $portfolio->id,
                PostCategory::query()->findOrFail($categoryId),
            );
        }

        return $this->responseSuccess(201, 'Portfolio가 성공적으로 생성되었습니다.', [
            'portfolio' => new AdminPortfolioResource($portfolio->fresh(['categories'])),
        ]);
    }

    public function update(AdminPortfolioUpdateRequest $request, int $id): JsonResponse
    {
        $portfolio = Portfolio::findOrFail($id);
        $data = $request->validated();
        $hasCategory = array_key_exists('category_id', $data);
        $categoryId = $data['category_id'] ?? null;
        unset($data['category_id']);
        $portfolio->update($data);

        if ($hasCategory) {
            if ($categoryId === null) {
                $this->postCategories->detach(PostCategoryPageType::PORTFOLIO->value, $portfolio->id);
            } else {
                $this->postCategories->assign(
                    PostCategoryPageType::PORTFOLIO->value,
                    $portfolio->id,
                    PostCategory::query()->findOrFail($categoryId),
                );
            }
        }

        return $this->responseSuccess(200, 'Portfolio가 성공적으로 수정되었습니다.', [
            'portfolio' => new AdminPortfolioResource($portfolio->fresh(['categories'])),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        Portfolio::findOrFail($id)->delete();

        return $this->responseSuccess(200, 'Portfolio가 성공적으로 삭제되었습니다.');
    }
}
