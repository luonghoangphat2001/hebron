<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Calligraphy\AdminCalligraphyBulkDeleteRequest;
use App\Http\Requests\Admin\Calligraphy\AdminCalligraphyBulkUpdateRequest;
use App\Http\Requests\Admin\Calligraphy\AdminCalligraphyListRequest;
use App\Http\Requests\Admin\Calligraphy\AdminCalligraphyStoreRequest;
use App\Http\Requests\Admin\Calligraphy\AdminCalligraphyUpdateRequest;
use App\Http\Resources\Admin\AdminCalligraphyResource;
use App\Services\Admin\AdminCalligraphyService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class AdminCalligraphyController extends BaseController
{
    public function __construct(
        protected AdminCalligraphyService $adminCalligraphyService,
        protected PaginationService $paginationService,
    ) {}

    public function index(AdminCalligraphyListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $paginator = $this->adminCalligraphyService->getCalligraphies(
                $filters,
                (int) ($filters['per_page'] ?? 20),
            );

            return $this->responsePaginatedSuccess(200, 'Calligraphies retrieved successfully.', [
                'calligraphies' => AdminCalligraphyResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function store(AdminCalligraphyStoreRequest $request): JsonResponse
    {
        try {
            $calligraphy = $this->adminCalligraphyService->createCalligraphy(
                $request->user(),
                $request->validated(),
            );

            return $this->responseSuccess(201, 'Calligraphy created successfully.', [
                'calligraphy' => new AdminCalligraphyResource($calligraphy),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->responseSuccess(200, 'Calligraphy retrieved successfully.', [
                'calligraphy' => new AdminCalligraphyResource(
                    $this->adminCalligraphyService->getCalligraphy($id)
                ),
            ]);
        } catch (ModelNotFoundException) {
            return $this->responseError(404, 'Calligraphy not found.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function update(AdminCalligraphyUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $calligraphy = $this->adminCalligraphyService->updateCalligraphy($id, $request->validated());

            return $this->responseSuccess(200, 'Calligraphy updated successfully.', [
                'calligraphy' => new AdminCalligraphyResource($calligraphy),
            ]);
        } catch (ModelNotFoundException) {
            return $this->responseError(404, 'Calligraphy not found.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function bulkUpdate(AdminCalligraphyBulkUpdateRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            return $this->responseSuccess(200, 'Calligraphies updated successfully.',
                $this->adminCalligraphyService->bulkUpdateType(
                    $data['calligraphy_ids'],
                    $data['value'],
                )
            );
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminCalligraphyService->deleteCalligraphy($id);

            return $this->responseSuccess(200, 'Calligraphy deleted successfully.');
        } catch (ModelNotFoundException) {
            return $this->responseError(404, 'Calligraphy not found.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function bulkDelete(AdminCalligraphyBulkDeleteRequest $request): JsonResponse
    {
        try {
            return $this->responseSuccess(200, 'Calligraphies deleted successfully.',
                $this->adminCalligraphyService->bulkDelete(
                    $request->validated('calligraphy_ids')
                )
            );
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
