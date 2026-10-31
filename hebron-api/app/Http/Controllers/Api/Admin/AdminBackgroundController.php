<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exceptions\BackgroundInUseException;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Background\AdminBackgroundBulkDeleteRequest;
use App\Http\Requests\Admin\Background\AdminBackgroundListRequest;
use App\Http\Requests\Admin\Background\AdminBackgroundStoreRequest;
use App\Http\Requests\Admin\Background\AdminBackgroundUpdateRequest;
use App\Http\Resources\Admin\AdminBackgroundResource;
use App\Services\Admin\AdminBackgroundService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class AdminBackgroundController extends BaseController
{
    public function __construct(
        protected AdminBackgroundService $adminBackgroundService,
        protected PaginationService $paginationService,
    ) {}

    public function index(AdminBackgroundListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $paginator = $this->adminBackgroundService->getBackgrounds(
                $filters,
                (int) ($filters['per_page'] ?? 20),
            );

            return $this->responsePaginatedSuccess(200, 'Backgrounds retrieved successfully.', [
                'backgrounds' => AdminBackgroundResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->responseSuccess(200, 'Background retrieved successfully.', [
                'background' => new AdminBackgroundResource(
                    $this->adminBackgroundService->getBackground($id)
                ),
            ]);
        } catch (ModelNotFoundException) {
            return $this->responseError(404, 'Background not found.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function store(AdminBackgroundStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            if ($request->hasFile('file')) {
                $path = $request->file('file')->store('backgrounds', config('filesystems.public_disk'));
                $data['image_path'] = $path;
            }

            $background = $this->adminBackgroundService->createBackground(
                $request->user(),
                $data,
            );

            return $this->responseSuccess(201, 'Background created successfully.', [
                'background' => new AdminBackgroundResource($background),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function update(AdminBackgroundUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $background = $this->adminBackgroundService->updateBackground($id, $request->validated());

            return $this->responseSuccess(200, 'Background updated successfully.', [
                'background' => new AdminBackgroundResource($background),
            ]);
        } catch (ModelNotFoundException) {
            return $this->responseError(404, 'Background not found.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminBackgroundService->deleteBackground($id);

            return $this->responseSuccess(200, 'Background deleted successfully.');
        } catch (BackgroundInUseException $e) {
            return $this->responseError(409, $e->getMessage(), [
                'backgrounds' => $e->backgrounds,
            ]);
        } catch (ModelNotFoundException) {
            return $this->responseError(404, 'Background not found.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function bulkDelete(AdminBackgroundBulkDeleteRequest $request): JsonResponse
    {
        try {
            $result = $this->adminBackgroundService->bulkDelete(
                $request->validated('background_ids')
            );

            return $this->responseSuccess(200, 'Backgrounds deleted successfully.', $result);
        } catch (BackgroundInUseException $e) {
            return $this->responseError(409, $e->getMessage(), [
                'backgrounds' => $e->backgrounds,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
