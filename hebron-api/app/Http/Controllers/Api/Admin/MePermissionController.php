<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Services\Admin\AdminUserPermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MePermissionController extends BaseController
{
    public function __construct(
        protected AdminUserPermissionService $adminUserPermissionService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'permissions' => $this->adminUserPermissionService->getAllMenuPermissions($user),
            ],
        ]);
    }
}
