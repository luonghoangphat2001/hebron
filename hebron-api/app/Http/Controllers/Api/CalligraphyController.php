<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Calligraphy\CalligraphyListRequest;
use App\Http\Resources\CalligraphyResource;
use App\Models\Calligraphy;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;

class CalligraphyController extends BaseController
{
    public function __construct(
        protected PaginationService $paginationService,
    ) {}

    public function index(CalligraphyListRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $query = Calligraphy::query();

        if (Arr::get($filters, 'type')) {
            $query->where('type', $filters['type']);
        }

        if (Arr::get($filters, 'search')) {
            $query->where('text', 'like', '%'.$filters['search'].'%');
        }

        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');
        $paginator = $query
            ->orderBy($sortBy, $sortOrder)
            ->orderByDesc('id')
            ->paginate((int) ($filters['per_page'] ?? 20));

        return $this->responsePaginatedSuccess(200, 'Calligraphies retrieved successfully.', [
            'calligraphies' => CalligraphyResource::collection($paginator->items()),
        ], $this->paginationService->format($paginator));
    }
}
