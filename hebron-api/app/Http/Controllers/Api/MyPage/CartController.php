<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MyPage\BatchDeleteCartItemsRequest;
use App\Http\Requests\MyPage\CartSelectionSummaryRequest;
use App\Http\Requests\MyPage\CheckoutCartQuoteRequest;
use App\Http\Requests\MyPage\CheckoutCartRequest;
use App\Http\Requests\MyPage\StoreCartItemRequest;
use App\Http\Requests\MyPage\UpdateCartItemRequest;
use App\Services\MyPage\MyPageCartService;
use App\Support\GuestCommerceToken;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class CartController extends BaseController
{
    public function __construct(
        protected MyPageCartService $cartService
    ) {}

    /**
     * GET /api/mypage/cart
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validate(['search' => 'nullable|string|max:255']);
            $search = $validated['search'] ?? null;

            $cartResource = $this->cartService->getCart($user, $search, GuestCommerceToken::fromRequest($request));
            $fullLineCount = $cartResource->resource->items()->count();
            $displayedCount = $cartResource->resource->items->count();

            return $this->responseSuccess(200, 'successfully', [
                'cart' => $cartResource,
                'meta' => [
                    'search' => $search,
                    'displayed_line_count' => $displayedCount,
                    'total_lines_in_cart' => $fullLineCount,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Get MyPage cart failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError($this->cartErrorStatus($e), '장바구니를 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * POST /api/mypage/cart/selection-summary
     */
    public function selectionSummary(CartSelectionSummaryRequest $request): JsonResponse
    {
        try {
            $summary = $this->cartService->selectionSummary(
                $request->user(),
                $request->validated()['item_ids'],
                GuestCommerceToken::fromRequest($request),
            );

            return $this->responseSuccess(200, 'successfully', ['selection' => $summary]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '선택한 장바구니 항목을 찾을 수 없습니다.');
        } catch (\InvalidArgumentException $e) {
            return $this->responseError(422, $e->getMessage());
        } catch (\Throwable $e) {
            Log::error('Cart selection summary failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError($this->cartErrorStatus($e), '합계를 계산하는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * POST /api/mypage/cart
     */
    public function store(StoreCartItemRequest $request): JsonResponse
    {
        try {
            $cartItem = $this->cartService->addItem(
                $request->user(),
                $request->validated(),
                GuestCommerceToken::fromRequest($request),
            );

            return $this->responseSuccess(201, '장바구니에 상품이 추가되었습니다.', ['cart_item' => $cartItem]);
        } catch (ModelNotFoundException $e) {
            Log::error('Error', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError(404, '상품을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Add cart item failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError($this->cartErrorStatus($e), '장바구니에 상품을 추가하는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * PUT /api/mypage/cart/{itemId}
     */
    public function update(UpdateCartItemRequest $request, int $itemId): JsonResponse
    {
        try {
            $cartItem = $this->cartService->updateItem(
                $request->user(),
                $itemId,
                $request->validated(),
                GuestCommerceToken::fromRequest($request),
            );

            return $this->responseSuccess(200, '장바구니 항목이 수정되었습니다.', ['cart_item' => $cartItem]);
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '장바구니 항목을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Update cart item failed', [
                'user_id' => $request->user()?->id,
                'item_id' => $itemId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError($this->cartErrorStatus($e), '장바구니 항목을 수정하는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * DELETE /api/mypage/cart/{itemId}
     */
    public function destroy(Request $request, int $itemId): JsonResponse
    {
        try {
            $this->cartService->deleteItem(
                $request->user(),
                $itemId,
                GuestCommerceToken::fromRequest($request),
            );

            return $this->responseSuccess(200, '장바구니 항목이 삭제되었습니다.');
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '장바구니 항목을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Delete cart item failed', [
                'user_id' => $request->user()?->id,
                'item_id' => $itemId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError($this->cartErrorStatus($e), '장바구니 항목을 삭제하는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * DELETE /api/mypage/cart/batch
     */
    public function batchDestroy(BatchDeleteCartItemsRequest $request): JsonResponse
    {
        try {
            $this->cartService->batchDeleteItems(
                $request->user(),
                $request->validated()['item_ids'],
                GuestCommerceToken::fromRequest($request),
            );

            return $this->responseSuccess(200, '선택한 장바구니 항목이 삭제되었습니다.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (ModelNotFoundException $e) {
            return $this->responseError(404, '선택한 항목을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Batch delete cart items failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $statusCode = str_contains($e->getMessage(), '찾을 수 없거나') ? 400 : 500;

            return $this->responseError($statusCode, $e->getMessage() ?: '장바구니 항목을 삭제하는 중 오류가 발생했습니다.');
        }
    }

    /**
     * POST /api/mypage/cart/{itemId}/extend-storage
     */
    public function extendStorage(Request $request, int $itemId): JsonResponse
    {
        try {
            $cartItem = $this->cartService->extendStorage(
                $request->user(),
                $itemId,
                GuestCommerceToken::fromRequest($request),
            );

            return $this->responseSuccess(200, '보관일이 7일 연장되었습니다.', ['cart_item' => $cartItem]);
        } catch (ModelNotFoundException $e) {
            Log::error('Error extending cart item storage', [
                'user_id' => $request->user()?->id,
                'item_id' => $itemId,
                'error' => $e->getMessage(),
            ]);

            return $this->responseError(404, '장바구니 항목을 찾을 수 없습니다.');
        } catch (\Throwable $e) {
            Log::error('Extend cart item storage failed', [
                'user_id' => $request->user()->id ?? null,
                'item_id' => $itemId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError($this->cartErrorStatus($e), '보관일을 연장하는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }

    /**
     * POST /api/mypage/cart/checkout/quote
     */
    public function checkoutQuote(CheckoutCartQuoteRequest $request): JsonResponse
    {
        try {
            $result = $this->cartService->checkoutQuote(
                $request->user(),
                $request->validated(),
                GuestCommerceToken::fromRequest($request),
            );

            return $this->responseSuccess(200, $result['message'] ?? '견적이 계산되었습니다.', $result);
        } catch (\Throwable $e) {
            Log::error('Checkout cart failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError($this->cartErrorStatus($e), $e->getMessage() ?: '주문 처리 중 오류가 발생했습니다.');
        }
    }

    /**
     * POST /api/mypage/cart/checkout
     */
    public function checkout(CheckoutCartRequest $request): JsonResponse
    {
        try {
            $result = $this->cartService->checkout(
                $request->user(),
                $request->validated(),
                GuestCommerceToken::fromRequest($request),
            );

            return $this->responseSuccess(200, $result['message'] ?? '주문이 생성되었습니다.', $result);
        } catch (\Throwable $e) {
            Log::error('Checkout cart failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->responseError($this->cartErrorStatus($e), $e->getMessage() ?: '주문 처리 중 오류가 발생했습니다.');
        }
    }

    private function cartErrorStatus(\Throwable $e): int
    {
        if ($e instanceof \InvalidArgumentException || $e instanceof \RuntimeException) {
            return (int) $e->getCode() >= 400 ? (int) $e->getCode() : 422;
        }

        return $this->resolveStatusCode($e);
    }
}
