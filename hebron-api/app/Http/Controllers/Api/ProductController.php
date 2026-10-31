<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserAuthority;
use App\Http\Resources\ProductListResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\BrandProductResource;
use App\Services\PaginationService;
use App\Services\ProductPdfService;
use App\Services\ProductService;
use App\Services\ReviewService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductController extends BaseController
{
    public function __construct(
        protected ProductService $productService,
        protected ReviewService $reviewService,
        protected PaginationService $paginationService,
        protected ProductPdfService $productPdfService
    ) {}

    /**
     * Display a listing of products with pagination
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = [
                'category_id' => $request->input('category_id'),
                'q' => $request->input('q'),
                'sort_by' => $request->input('sort_by'),
                'sort_order' => $request->input('sort_order'),
                'selling_price_from' => $request->input('selling_price_from'),
                'selling_price_to' => $request->input('selling_price_to'),
                'is_popular' => $request->has('is_popular')
                    ? $request->boolean('is_popular')
                    : null,
                'is_featured' => $request->has('is_featured')
                    ? $request->boolean('is_featured')
                    : null,
                'is_top_product' => $request->has('is_top_product')
                    ? $request->boolean('is_top_product')
                    : null,
                'availability' => $request->input('availability'),
            ];

            $perPage = (int) $request->input('per_page', 15);

            $products = $this->productService->getProductList($filters, $perPage, $this->resolveAuthority($request));

            return $this->responsePaginatedSuccess(200, 'Success', [
                'products' => ProductListResource::collection($products->items()),
            ], $this->paginationService->format($products));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '제품 목록을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Return the complete active product catalog for the Brand site.
     */
    public function brandIndex(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);
        $products = $this->productService->getProductList([], $perPage, $this->resolveAuthority($request));

        return $this->responsePaginatedSuccess(200, 'Success', [
            'products' => BrandProductResource::collection($products->items()),
        ], $this->paginationService->format($products));
    }

    /**
     * Display reviews for a product (제품 리뷰 목록)
     * GET /products/{slug}/reviews
     */
    public function reviews(Request $request, string $slug): JsonResponse
    {
        try {
            $reviews = $this->reviewService->getProductReviews($slug, $request);

            return $this->responsePaginatedSuccess(200, 'Success', [
                'reviews' => $reviews['reviews'],
            ], $reviews['pagination']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '리뷰 목록을 불러오는 중 오류가 발생했습니다.',
            ], 500);
        }
    }

    /**
     * Display the specified product
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        try {
            $product = $this->productService->getProductDetails($slug, $this->resolveAuthority($request));

            return response()->json([
                'success' => true,
                'data' => [
                    'product' => new ProductResource($product),
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
     * Download a public product specification sheet as a PDF.
     */
    public function downloadPdf(string $slug): Response|JsonResponse
    {
        try {
            $product = $this->productPdfService->getProduct($slug);
            $pdfContent = $this->productPdfService->render($product);
            $filename = 'product-'.$this->sanitizePdfFilename($product->slug).'.pdf';

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Content-Length' => (string) strlen($pdfContent),
                'Cache-Control' => 'public, max-age=300',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => '제품 PDF를 생성하는 중 오류가 발생했습니다.',
            ], 500);
        }
    }

    private function sanitizePdfFilename(string $value): string
    {
        $filename = preg_replace('/[^a-zA-Z0-9_-]+/', '-', $value) ?: 'document';

        return trim($filename, '-') ?: 'document';
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

    /**
     * Display popular products (인기상품)
     */
    public function popular(Request $request): JsonResponse
    {
        try {
            $limit = (int) $request->input('limit', 10);

            $products = $this->productService->getPopularProducts($limit, $this->resolveAuthority($request));

            return response()->json([
                'success' => true,
                'data' => [
                    'products' => ProductListResource::collection($products),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '인기 상품을 불러오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search products by keyword
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $keyword = $request->input('q', '');
            $includeChildCategory = true;
            $categoryIds = $request->input('category_ids', []);
            $filters = [
                'category_ids' => $categoryIds,
                'sort_by' => $request->input('sort_by'),
                'sort_order' => $request->input('sort_order'),
                'selling_price_from' => $request->input('selling_price_from'),
                'selling_price_to' => $request->input('selling_price_to'),
                'is_popular' => $request->has('is_popular')
                    ? $request->boolean('is_popular')
                    : null,
                'is_featured' => $request->has('is_featured')
                    ? $request->boolean('is_featured')
                    : null,
                'is_top_product' => $request->has('is_top_product')
                    ? $request->boolean('is_top_product')
                    : null,
                'exclude_id' => $request->input('exclude_id'),
            ];
            $perPage = (int) $request->input('per_page', 15);

            $products = $this->productService->searchProducts($keyword, $filters, $perPage, $includeChildCategory, $this->resolveAuthority($request));

            return $this->responsePaginatedSuccess(200, 'Success', [
                'keyword' => $keyword,
                'products' => ProductListResource::collection($products->items()),
            ], $this->paginationService->format($products));
        } catch (\Exception $e) {
            $statusCode = $e->getCode() === 400 ? 400 : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }
}
