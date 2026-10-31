<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\Admin\AdminEmailIntegrationLogResource;
use App\Models\EmailIntegrationLog;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminEmailIntegrationLogController extends BaseController
{
    public function __construct(protected PaginationService $paginationService) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
        $query = EmailIntegrationLog::query()->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }
        if ($request->filled('order_number')) {
            $query->where('order_number', $request->string('order_number')->toString());
        }

        $paginator = $query->paginate($perPage);

        return $this->responsePaginatedSuccess(200, 'Email integration logs retrieved successfully.', [
            'email_integration_logs' => AdminEmailIntegrationLogResource::collection($paginator->items()),
        ], $this->paginationService->format($paginator));
    }

    public function show(int $id): JsonResponse
    {
        return $this->responseSuccess(200, 'Email integration log retrieved successfully.', [
            'email_integration_log' => new AdminEmailIntegrationLogResource(EmailIntegrationLog::findOrFail($id)),
        ]);
    }
}
