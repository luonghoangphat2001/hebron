<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserAuthority;
use App\Http\Resources\CategoryProductResource;
use App\Http\Resources\CategoryResource;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends BaseController
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    /**
     * Display a listing of categories
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $options = [
                'with_children' => $request->boolean('with_children', false),
                'root_only' => $request->boolean('root_only', true),
                'customer_id' => $request->query('customer_id') ? (int) $request->query('customer_id') : null,
            ];

            $categories = $this->categoryService->getAllCategories($options);

            return response()->json([
                'success' => true,
                'data' => [
                    'categories' => CategoryResource::collection($categories),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '카테고리 목록을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified category
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $category = $this->categoryService->getCategoryDetails($slug);

            return response()->json([
                'success' => true,
                'data' => [
                    'category' => new CategoryResource($category),
                ],
            ], 200);
        } catch (\Exception $e) {
            $statusCode = $e->getCode() === 404 ? 404 : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }

    /**
     * Display products for a category
     */
    public function products(string $slug, Request $request): JsonResponse
    {
        try {
            $filters = [
                'search' => $request->input('search'),
                'sort_by' => $request->input('sort_by'),
                'sort_order' => $request->input('sort_order'),
                'category_ids' => $request->input('category_ids'),
                'category_slugs' => $request->input('category_slugs'),
                'selling_price_from' => $request->input('selling_price_from'),
                'selling_price_to' => $request->input('selling_price_to'),
            ];
            $perPage = (int) $request->input('per_page', 15);

            $data = $this->categoryService->getCategoryProducts(
                $slug,
                $filters,
                $perPage,
                $this->resolveAuthority($request)
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'category' => new CategoryResource($data['category']),
                    'products' => CategoryProductResource::collection($data['products']),
                ],
                'pagination' => $data['pagination'],
            ], 200);
        } catch (\Exception $e) {
            $statusCode = $e->getCode() === 404 ? 404 : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }

    /**
     * Display children categories for a category
     */
    public function children(string $slug): JsonResponse
    {
        try {
            $children = $this->categoryService->getCategoryChildren($slug);

            return response()->json([
                'success' => true,
                'data' => CategoryResource::collection($children),
            ], 200);
        } catch (\Exception $e) {
            $statusCode = $e->getCode() === 404 ? 404 : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }

    /**
     * Resolve the current user's authority (used to gate products.visible_roles).
     * Returns null for guests, which leaves the repository filter a no-op.
     */
    private function resolveAuthority(Request $request): ?UserAuthority
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        return method_exists($user, 'getAuthorityEnum')
            ? $user->getAuthorityEnum()
            : UserAuthority::tryFromString($user->authority ?? null);
    }
}
