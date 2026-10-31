<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminShoppingSettingResource;
use App\Services\Admin\ShoppingSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShoppingSettingController extends Controller
{
    protected ShoppingSettingService $shoppingSettingService;

    public function __construct(ShoppingSettingService $shoppingSettingService)
    {
        $this->shoppingSettingService = $shoppingSettingService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $settings = $this->shoppingSettingService->getAllShoppingSettings();

            return response()->json([
                'success' => true,
                'data' => [
                    'shopping_settings' => AdminShoppingSettingResource::collection($settings),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve public shopping settings', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve shopping settings.',
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $setting = $this->shoppingSettingService->getShoppingSettingById($id);

            if (! $setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shopping setting not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'shopping_setting' => new AdminShoppingSettingResource($setting),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve public shopping setting', [
                'setting_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve shopping setting.',
            ], 500);
        }
    }
}