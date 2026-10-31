<?php

namespace App\Http\Controllers\Api;

use App\Enums\SiteType;
use App\Models\Product;
use App\Services\ProductConfiguratorService;
use App\Services\ProductQuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductConfiguratorController extends BaseController
{
    public function __construct(
        protected ProductConfiguratorService $configuratorService,
        protected ProductQuoteService $quoteService,
    ) {}

    public function quote(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);
        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        }

        $validated = $request->validate([
            'selected_options' => ['nullable', 'array'],
            'selected_options.*.group_id' => [
                'required_with:selected_options',
                'integer',
                'exists:product_option_groups,id',
            ],
            'selected_options.*.option_id' => [
                'required_with:selected_options',
                'integer',
                'exists:product_options,id',
            ],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $selectedOptions = $request->input('selected_options', []);
        $quantity = (int) ($request->input('quantity', 1));

        try {
            $data = $this->quoteService->quote($id, $validated, $quantity, SiteType::SHOPPING_MALL);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
