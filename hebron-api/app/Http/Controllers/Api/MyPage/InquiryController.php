<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MyPage\GetInquiriesRequest;
use App\Http\Requests\MyPage\StoreInquiryCommentRequest;
use App\Http\Requests\MyPage\StoreInquiryRequest;
use App\Http\Requests\MyPage\UpdateInquiryRequest;
use App\Services\MyPage\MyPageInquiryService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InquiryController extends BaseController
{
    public function __construct(
        protected MyPageInquiryService $inquiryService
    ) {}

    /**
     * GET /api/mypage/inquiries
     */
    public function index(GetInquiriesRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $perPage = (int) $request->input('per_page', 15);

            $filters = $request->validated();

            $data = $this->inquiryService->getInquiries(
                $user,
                $filters,
                $perPage,
            );

            return $this->responsePaginatedSuccess(200, 'successfully', [
                'inquiries' => $data['inquiries'],
            ], $data['pagination']);
        } catch (\Throwable $e) {
            Log::error('Get MyPage inquiries failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '문의 목록을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * GET /api/mypage/inquiries/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $inquiry = $this->inquiryService->getInquiryDetail($request->user(), $id);

            return $this->responseSuccess(200, 'successfully', ['inquiry' => $inquiry]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '문의를 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Get MyPage inquiry detail failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '문의 상세 정보를 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * POST /api/mypage/inquiries
     */
    public function store(StoreInquiryRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            $inquiry = $this->inquiryService->createInquiry($user, $validated);

            return $this->responseSuccess(201, '문의가 성공적으로 등록되었습니다.', ['inquiry' => $inquiry]);
        } catch (\Throwable $e) {
            Log::error('Create MyPage inquiry failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '문의 등록 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * PATCH /api/mypage/inquiries/{id}
     */
    public function update(UpdateInquiryRequest $request, int $id): JsonResponse
    {
        try {
            $inquiry = $this->inquiryService->updateInquiry($request->user(), $id, $request->validated());

            return $this->responseSuccess(200, '문의가 성공적으로 수정되었습니다.', ['inquiry' => $inquiry]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '문의를 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Update MyPage inquiry failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '문의 수정 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * DELETE /api/mypage/inquiries/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $this->inquiryService->deleteInquiry($request->user(), $id);

            return $this->responseSuccess(200, '문의가 성공적으로 삭제되었습니다.');
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '문의를 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Delete MyPage inquiry failed', [
                'user_id' => $request->user()->id ?? null,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '문의 삭제 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * POST /api/mypage/inquiries/{id}/comments
     */
    public function addComment(StoreInquiryCommentRequest $request, int $id): JsonResponse
    {
        try {
            $comment = $this->inquiryService->addComment($request->user(), $id, $request->validated());

            return $this->responseSuccess(201, '댓글이 성공적으로 등록되었습니다.', ['comment' => $comment]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '문의를 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Add inquiry comment failed', [
                'user_id' => $request->user()->id,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(500, '댓글 등록 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }
}
