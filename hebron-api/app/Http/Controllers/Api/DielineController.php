<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Services\DielineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DielineController extends BaseController
{
    public function __construct(
        protected DielineService $dielineService,
    ) {}

    /**
     * Preview dieline dimensions for a given trim size (no PDF generation).
     * GET /products/{slug}/dieline/preview?trim_width_mm=90&trim_height_mm=50
     */
    public function preview(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->with('specification')->firstOrFail();
        $spec = $product->specification;

        if (! $spec || ! $spec->dieline_enabled) {
            return $this->responseError(404, 'Dieline download is not available for this product.');
        }

        $validated = $request->validate([
            'trim_width_mm' => ['required', 'numeric', 'min:1', 'max:2000'],
            'trim_height_mm' => ['required', 'numeric', 'min:1', 'max:2000'],
        ]);

        $dims = $this->dielineService->calculateDimensions(
            (float) $validated['trim_width_mm'],
            (float) $validated['trim_height_mm'],
            (float) $spec->dieline_margin_mm,
        );

        return $this->responseSuccess(200, 'Dieline dimensions calculated', [
            'dieline' => $dims,
        ]);
    }

    /**
     * Download dieline PDF for a product with user-supplied trim size.
     * GET /products/{slug}/dieline/download?trim_width_mm=90&trim_height_mm=50
     */
    public function download(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->with('specification')->firstOrFail();
        $spec = $product->specification;

        if (! $spec || ! $spec->dieline_enabled) {
            return $this->responseError(404, 'Dieline download is not available for this product.');
        }

        $validated = $request->validate([
            'trim_width_mm' => ['required', 'numeric', 'min:1', 'max:2000'],
            'trim_height_mm' => ['required', 'numeric', 'min:1', 'max:2000'],
        ]);

        $trimWidth = (float) $validated['trim_width_mm'];
        $trimHeight = (float) $validated['trim_height_mm'];
        $margin = (float) $spec->dieline_margin_mm;

        $result = $this->dielineService->generateAndStore(
            $trimWidth,
            $trimHeight,
            $margin,
            $product->slug,
        );

        return $this->responseSuccess(200, 'Dieline generated successfully', [
            'url'      => $result['url'],
            'filename' => $result['filename'],
        ]);
    }
}
