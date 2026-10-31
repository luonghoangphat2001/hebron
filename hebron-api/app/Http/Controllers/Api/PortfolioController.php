<?php

namespace App\Http\Controllers\Api;

use App\Enums\PostCategoryPageType;
use App\Enums\SiteType;
use App\Http\Controllers\Controller;
use App\Http\Resources\PostCategoryResource;
use App\Http\Resources\PortfolioListResource;
use App\Http\Resources\PortfolioResource;
use App\Models\PostCategory;
use App\Models\Portfolio;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function __construct(protected PaginationService $paginationService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Portfolio::active()->ofSite($request->input('site_type', SiteType::BRAND_SITE->value));

        if ($request->filled('category')) {
            $query->where('category', $request->string('category')->toString());
        }

        if ($request->filled('title')) {
            $query->where('title', 'like', '%'.$request->string('title').'%');
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', filter_var($request->input('is_featured'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $portfolios = $query
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'portfolios' => PortfolioListResource::collection($portfolios->items()),
            ],
            'pagination' => $this->paginationService->format($portfolios),
        ]);
    }

    public function categories(): JsonResponse
    {
        $pageType = PostCategoryPageType::PORTFOLIO;
        $categories = PostCategory::query()
            ->withCount([$pageType->relationName().' as total_post'])
            ->where('page_type', $pageType->value)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Portfolio categories retrieved successfully.',
            'data' => ['categories' => PostCategoryResource::collection($categories)],
        ]);
    }

    public function categoryDetail(int $id): JsonResponse
    {
        $pageType = PostCategoryPageType::PORTFOLIO;
        $category = PostCategory::query()
            ->withCount([$pageType->relationName().' as total_post'])
            ->where('page_type', $pageType->value)
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Portfolio category retrieved successfully.',
            'data' => ['category' => new PostCategoryResource($category)],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $portfolio = Portfolio::active()->find($id);

        if (! $portfolio) {
            return response()->json([
                'success' => false,
                'message' => 'Portfolio를 찾을 수 없습니다.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'portfolio' => new PortfolioResource($portfolio),
            ],
        ]);
    }
}
