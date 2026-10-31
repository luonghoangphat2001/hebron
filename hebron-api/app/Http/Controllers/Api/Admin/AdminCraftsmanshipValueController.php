<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\CraftsmanshipValue\CraftsmanshipValueRequest;
use App\Http\Resources\Admin\AdminCraftsmanshipValueResource;
use App\Services\Admin\AdminCraftsmanshipValueService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCraftsmanshipValueController extends BaseController
{
    public function __construct(
        private readonly AdminCraftsmanshipValueService $service,
        private readonly PaginationService $paginationService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
        $paginator = $this->service->paginate($filters);

        return $this->responsePaginatedSuccess(200, 'Craftsmanship values retrieved successfully.', [
            'craftsmanship_values' => AdminCraftsmanshipValueResource::collection($paginator->items()),
        ], $this->paginationService->format($paginator));
    }

    public function store(CraftsmanshipValueRequest $request): JsonResponse
    {
        return $this->responseSuccess(201, 'Craftsmanship value created successfully.', [
            'craftsmanship_value' => new AdminCraftsmanshipValueResource($this->service->create($request->validated())),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        return $this->responseSuccess(200, 'Craftsmanship value retrieved successfully.', [
            'craftsmanship_value' => new AdminCraftsmanshipValueResource($this->service->get($id)),
        ]);
    }

    public function update(CraftsmanshipValueRequest $request, int $id): JsonResponse
    {
        return $this->responseSuccess(200, 'Craftsmanship value updated successfully.', [
            'craftsmanship_value' => new AdminCraftsmanshipValueResource($this->service->update($id, $request->validated())),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return $this->responseSuccess(200, 'Craftsmanship value deleted successfully.');
    }
}
