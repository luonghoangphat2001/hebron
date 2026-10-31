<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Media\AdminMediaStoreRequest;
use App\Http\Requests\Admin\Media\AdminMediaUpdateRequest;
use App\Http\Resources\Admin\AdminMediaResource;
use App\Services\Admin\AdminMediaService;
use App\Services\Cache;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMediaController extends BaseController
{
    public function __construct(
        private readonly AdminMediaService $mediaService,
        private readonly PaginationService $paginationService,
        private readonly Cache $cache,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->all();
        $paginator = $this->mediaService->getMedia($filters, (int) ($filters['per_page'] ?? 20));

        return $this->responsePaginatedSuccess(200, 'Media list retrieved successfully.', [
            'media' => AdminMediaResource::collection($paginator->items()),
        ], $this->paginationService->format($paginator));
    }

    public function store(AdminMediaStoreRequest $request): JsonResponse
    {
        $media = $this->mediaService->create($request->user(), $request->validated());
        $this->cache->invalidate(['media', 'pages']);

        return $this->responseSuccess(201, 'Media created successfully.', [
            'media' => new AdminMediaResource($media),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        return $this->responseSuccess(200, 'Media retrieved successfully.', [
            'media' => new AdminMediaResource($this->mediaService->get($id)),
        ]);
    }

    public function update(AdminMediaUpdateRequest $request, int $id): JsonResponse
    {
        $media = $this->mediaService->update($id, $request->validated());
        $this->cache->invalidate(['media', 'pages']);

        return $this->responseSuccess(200, 'Media updated successfully.', [
            'media' => new AdminMediaResource($media),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->mediaService->delete($id);
        $this->cache->invalidate(['media', 'pages']);

        return $this->responseSuccess(200, 'Media deleted successfully.');
    }
}
