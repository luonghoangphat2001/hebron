<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\TemplatePublicResource;
use App\Models\Product;
use App\Models\Template;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController extends BaseController
{
    /**
     * Get active templates for user web.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Template::query()
                ->active()
                ->with(['product', 'background'])
                ->orderByDesc('updated_at')
                ->orderByDesc('id');

            if ($request->filled('product_id')) {
                $query->forProduct((int) $request->query('product_id'));
            }

            if ($request->filled('product_slug')) {
                $product = Product::query()
                    ->where('slug', (string) $request->query('product_slug'))
                    ->first();

                if (! $product) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Product not found',
                    ], 404);
                }

                $query->forProduct($product->id);
            }

            $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
            $templates = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'templates' => TemplatePublicResource::collection($templates->items()),
                    'pagination' => [
                        'current_page' => $templates->currentPage(),
                        'per_page' => $templates->perPage(),
                        'total_page' => $templates->lastPage(),
                        'total_item' => $templates->total(),
                    ],
                ],
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get active templates for a given product (by slug).
     * Used by user web to show available templates for a product.
     */
    public function byProduct(string $slug): JsonResponse
    {
        try {
            $product = Product::query()->where('slug', $slug)->first();
            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            $templates = Template::query()
                ->active()
                ->with('background')
                ->forProduct($product->id)
                ->orderBy('id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'templates' => TemplatePublicResource::collection($templates),
                ],
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get a single active template by ID for rendering Simple Text Editing / Web Editor.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $template = Template::query()
                ->active()
                ->with('background')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'template' => new TemplatePublicResource($template),
                ],
            ], 200);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
