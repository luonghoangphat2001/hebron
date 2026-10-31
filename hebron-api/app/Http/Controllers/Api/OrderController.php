<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Order\CreateReOrderRequest;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderShippingInfoRequest;
use App\Http\Requests\Order\ValidateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\DesignGroup;
use App\Models\OrderArtwork;
use App\Models\OrderDesignContent;
use App\Services\LimitManagementService;
use App\Services\OrderService;
use App\Services\PaginationService;
use App\Support\GuestCommerceToken;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends BaseController
{
    public function __construct(
        protected OrderService $orderService,
        protected PaginationService $paginationService,
        protected LimitManagementService $limitManagementService
    ) {}

    /**
     * Validate order payload before submit (주문 유효성 검사)
     * POST /api/orders/validate
     */
    public function validate(ValidateOrderRequest $request): JsonResponse
    {
        $request->validated();

        return response()->json([
            'success' => true,
            'data' => [
                'valid' => true,
                'warnings' => [],
                'errors' => [],
            ],
        ]);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $request->validated();

            $order = $this->orderService->createOrder(
                $data,
                $user,
                GuestCommerceToken::fromRequest($request),
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => new OrderResource($order->load('items', 'items.designGroup', 'items.orderDesignContent')),
                ],
            ], 201);
        } catch (ValidationException $e) {
            throw $e;
        } catch (ModelNotFoundException $e) {
            $message = match ($e->getModel()) {
                OrderDesignContent::class => '주문 디자인 내용을 찾을 수 없습니다.',
                DesignGroup::class => '디자인 그룹을 찾을 수 없습니다.',
                default => '상품을 찾을 수 없습니다.',
            };

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => '인증이 필요합니다.',
            ], 401);
        }

        $perPage = (int) $request->input('per_page', 10);

        $orders = $this->orderService->getOrdersForUser($user, $perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => OrderResource::collection($orders->items()),
            ],
            'pagination' => $this->paginationService->format($orders),
        ]);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();

            $order = $this->orderService
                ->getOrderForIdentity(
                    $orderNumber,
                    $user,
                    GuestCommerceToken::fromRequest($request),
                );

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => new OrderResource($order),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '주문을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Create a new order from a completed order.
     */
    public function reorder(CreateReOrderRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            $order = $this->orderService->reorderForUser($orderNumber, $user);

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => new OrderResource($order),
                ],
            ], 201);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Update contact & shipping information for an existing order.
     */
    public function updateShippingInfo(UpdateOrderShippingInfoRequest $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            $order = $this->orderService->updateShippingInfo(
                $orderNumber,
                $user,
                $request->validated()
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => new OrderResource($order),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Attach existing designs (order_artworks) to an order after it has been created.
     * UX: user creates designs first, then creates order, then links designs to the order.
     */
    public function attachDesigns(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '인증이 필요합니다.',
                ], 401);
            }

            $validated = $request->validate([
                'design_ids' => ['required', 'array', 'min:1'],
                'design_ids.*' => ['integer'],
            ]);

            $designIds = $validated['design_ids'];

            $order = $this->orderService->getOrderForUser($orderNumber, $user);

            // Link designs (OrderArtwork) to this order
            // NOTE: For now we only set order_id; PDF uses order->artworks.
            $updatedCount = OrderArtwork::whereIn('id', $designIds)
                ->where('user_id', $user->id)
                ->update([
                    'order_id' => $order->id,
                ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'order_number' => $order->order_number,
                    'linked_design_count' => $updatedCount,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    protected function resolveStatusCode(\Throwable $e): int
    {
        return $e->getCode() >= 400 && $e->getCode() < 600 ? (int) $e->getCode() : 422;
    }
}
