<?php

namespace App\Http\Controllers\Api;

use App\Models\EditorSize;
use App\Services\EditorSizeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EditorSizeController extends BaseController
{
    public function __construct(
        protected EditorSizeService $editorSizeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $sizes = $this->editorSizeService->getList($request);

            return response()->json([
                'success' => true,
                'data' => [
                    'editor_sizes' => $sizes,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'error',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
