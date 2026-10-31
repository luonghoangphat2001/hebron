<?php

namespace App\Http\Controllers\Api;

use App\Enums\PostCategoryPageType;
use App\Http\Requests\Faq\StoreFaqRequest;
use App\Http\Requests\Faq\UpdateFaqRequest;
use App\Http\Resources\FaqResource;
use App\Http\Resources\PostCategoryResource;
use App\Models\Faq;
use App\Models\PostCategory;
use App\Services\FaqService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends BaseController
{
    public function __construct(
        protected FaqService $faqService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * GET /api/faqs — Active FAQs with category counts for tab badges.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $result = $this->faqService->list(
                user: $request->user(),
                category: $request->input('category'),
                search: $request->input('search'),
                perPage: (int) $request->input('per_page', 15),
                siteType: $request->input('site_type'),
            );

            return $this->responsePaginatedSuccess(200, 'successfully', [
                'faqs' => $result['faqs'],
            ], $result['pagination']);
        } catch (\Exception $e) {
            return $this->responseError(500, 'FAQ 목록을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    public function categories(): JsonResponse
    {
        $pageType = PostCategoryPageType::FAQ;
        $categories = PostCategory::query()
            ->withCount([$pageType->relationName().' as total_post'])
            ->where('page_type', $pageType->value)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return $this->responseSuccess(200, 'FAQ categories retrieved successfully.', [
            'categories' => PostCategoryResource::collection($categories),
        ]);
    }

    public function categoryDetail(int $id): JsonResponse
    {
        $pageType = PostCategoryPageType::FAQ;
        $category = PostCategory::query()
            ->withCount([$pageType->relationName().' as total_post'])
            ->where('page_type', $pageType->value)
            ->where('is_active', true)
            ->findOrFail($id);

        return $this->responseSuccess(200, 'FAQ category retrieved successfully.', [
            'category' => new PostCategoryResource($category),
        ]);
    }

    /**
     * GET /api/faqs/category-counts
     */
    public function categoryCounts(Request $request): JsonResponse
    {
        try {
            return $this->responseSuccess(200, 'successfully', [
                'category_counts' => $this->faqService->categoryCounts(
                    $request->user(),
                    $request->input('search'),
                    $request->input('site_type'),
                ),
            ]);
        } catch (\Exception $e) {
            return $this->responseError(500, 'FAQ 카테고리 집계를 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * GET /api/faqs/{id}
     */
    public function show(int $id): JsonResponse
    {
        try {
            return $this->responseSuccess(200, 'successfully', ['faq' => $this->faqService->show($id)]);
        } catch (\Exception) {
            return $this->responseError(404, 'FAQ를 찾을 수 없습니다.');
        }
    }

    /**
     * POST /api/faqs/{id}/view — Increment view count.
     */
    public function recordView(int $id): JsonResponse
    {
        try {
            $this->faqService->incrementView($id);

            return $this->responseSuccess(200, 'successfully');
        } catch (\Exception) {
            return $this->responseError(404, 'FAQ를 찾을 수 없습니다.');
        }
    }

    /**
     * GET /api/faqs/admin/list — All FAQs including inactive (Admin).
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $category = $request->input('category');
            $question = $request->input('question');
            $isActive = $request->input('is_active');
            $siteType = $request->input('site_type');
            $perPage  = (int) $request->input('per_page', 15);

            $query = Faq::ordered();

            if ($category) {
                $query->ofCategory($category);
            }

            if ($question) {
                $query->where('question', 'like', "%{$question}%");
            }

            if ($isActive !== null) {
                $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
            }

            if ($siteType) {
                $query->where('site_type', $siteType);
            }

            $faqs = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data'    => [
                    'faqs'       => FaqResource::collection($faqs->items()),
                    'pagination' => $this->paginationService->format($faqs),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'FAQ 목록을 가져오는 중 오류가 발생했습니다.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/faqs
     */
    public function store(StoreFaqRequest $request): JsonResponse
    {
        try {
            $faq = Faq::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'FAQ가 생성되었습니다.',
                'data'    => ['faq' => new FaqResource($faq)],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'FAQ 생성 중 오류가 발생했습니다.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PUT /api/faqs/{id}
     */
    public function update(UpdateFaqRequest $request, int $id): JsonResponse
    {
        try {
            $faq = Faq::findOrFail($id);
            $faq->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'FAQ가 수정되었습니다.',
                'data'    => ['faq' => new FaqResource($faq->fresh())],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'FAQ 수정 중 오류가 발생했습니다.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/faqs/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            Faq::findOrFail($id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'FAQ가 삭제되었습니다.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'FAQ 삭제 중 오류가 발생했습니다.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
