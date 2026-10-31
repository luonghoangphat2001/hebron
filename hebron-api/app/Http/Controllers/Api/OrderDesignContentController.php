<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderDesignContent\StoreOrderDesignContentRequest;
use App\Http\Requests\OrderDesignContent\UpdateOrderDesignContentRequest;
use App\Http\Resources\OrderDesignContentResource;
use App\Models\OrderDesignContent;
use App\Services\PaginationService;
use App\Support\CommerceIdentity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderDesignContentController extends Controller
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = (int) $request->input('per_page', 15);

            $identity = CommerceIdentity::fromRequest($request);
            $query = OrderDesignContent::query()->ownedByIdentity($identity);

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('recipient_name', 'like', "%{$search}%")
                        ->orWhere('main_text', 'like', "%{$search}%")
                        ->orWhere('sender_name', 'like', "%{$search}%");
                });
            }

            $contents = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'order_design_contents' => OrderDesignContentResource::collection($contents->items()),
                ],
                'pagination' => $this->paginationService->format($contents),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order design contents list could not be retrieved.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $content = OrderDesignContent::query()
                ->ownedByIdentity(CommerceIdentity::fromRequest($request))
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'order_design_content' => new OrderDesignContentResource($content),
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order design content not found.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order design content could not be retrieved.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreOrderDesignContentRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $identity = CommerceIdentity::fromRequest($request);
            $content = DB::transaction(function () use ($validated, $identity) {
                return OrderDesignContent::create(array_merge($validated, [
                    'user_id' => $identity->userId,
                    'guest_token_hash' => $identity->guestTokenHash,
                ]));
            });

            return response()->json([
                'success' => true,
                'message' => 'Order design content created successfully.',
                'data' => [
                    'order_design_content' => new OrderDesignContentResource($content),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order design content could not be created.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateOrderDesignContentRequest $request, int $id): JsonResponse
    {
        try {
            $content = OrderDesignContent::query()
                ->ownedByIdentity(CommerceIdentity::fromRequest($request))
                ->findOrFail($id);

            DB::transaction(function () use ($content, $request) {
                $content->update($request->validated());
            });

            return response()->json([
                'success' => true,
                'message' => 'Order design content updated successfully.',
                'data' => [
                    'order_design_content' => new OrderDesignContentResource($content->fresh()),
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order design content not found.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order design content could not be updated.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $content = OrderDesignContent::query()
                ->ownedByIdentity(CommerceIdentity::fromRequest($request))
                ->findOrFail($id);

            DB::transaction(function () use ($content) {
                $content->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Order design content deleted successfully.',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order design content not found.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order design content could not be deleted.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
