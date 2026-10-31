<?php

namespace App\Http\Requests\Admin\Product;

use App\Enums\ProductVisibleRole;
use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminProductUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Add admin authorization check
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $id = $this->route('id'); // Get product ID or slug from route

        // Get product ID - if id is numeric, use it as ID, otherwise query by slug
        $productId = is_numeric($id)
            ? $id
            : Product::where('slug', $id)->value('id');

        // Create unique rules that ignore current product
        $slugRule = $productId
            ? Rule::unique('products', 'slug')->ignore($productId)
            : 'unique:products,slug';

        return [
            // Basic Information (all optional for update)
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
            'template_ids' => 'sometimes|array',
            'template_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('templates', 'id')->whereNull('deleted_at'),
            ],
            'name' => 'sometimes|string|max:200',
            'name_en' => 'nullable|string|max:200',
            'slug' => ['sometimes', 'string', 'max:200', $slugRule],
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',

            // Pricing
            'supply_price' => 'sometimes|numeric|min:0',
            'brand_site_price' => 'sometimes|numeric|min:0',
            'plain_site_price' => 'sometimes|numeric|min:0',
            'shipping_fee' => 'sometimes|numeric|min:0',
            'price_content' => 'nullable|string|max:255',
            'selling_price' => 'sometimes|numeric|min:0',
            'sku' => ['nullable', 'string', 'max:100'],

            // Representative image(s) – FSD: set via CRUD (no upload). Array of image URLs.
            'images' => 'nullable|array',
            'images.*' => 'url|max:500',
            'file_ai' => 'nullable|array',
            'file_ai.*' => 'string|max:500',

            // Status & Flags (sales status: is_active = sold/hidden, is_featured = promotional)
            'is_active' => 'sometimes|boolean',
            'is_popular' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'is_top_product' => 'sometimes|boolean',
            'stock_quantity' => 'sometimes|integer|min:0',
            'mes_inventory_enabled' => 'sometimes|boolean',
            'stock_inventory_enabled' => 'sometimes|boolean',
            'min_quantity' => 'sometimes|integer|min:1',
            'max_quantity' => 'sometimes|integer|min:0',
            'sort_order' => 'sometimes|integer',
            'visible_roles' => 'nullable|array',
            'visible_roles.*' => ['string', Rule::in(ProductVisibleRole::values())],

            // Specification (optional)
            'specification' => 'sometimes|array',
            'specification.size' => 'nullable|string',
            'specification.materials' => 'nullable|string',
            'specification.case' => 'nullable|string|max:256',
            'specification.product_period' => 'nullable|string',
            'specification.total_product_amount' => 'nullable|string',
            'specification.shipping_info' => 'nullable|string',
            'specification.weight' => 'nullable|string|max:256',
            'specification.notes' => 'nullable|string',

            // Option Groups (optional)
            'has_option' => 'required|boolean',
            'option_group_ids' => 'nullable|array',
            'option_group_ids.*' => 'integer|exists:product_option_groups,id',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $images = $this->input('images');

        if (is_array($images)) {
            $this->merge([
                'images' => array_map(
                    static fn (mixed $image): mixed => is_string($image)
                        ? str_replace(' ', '%20', $image)
                        : $image,
                    $images
                ),
            ]);
        }

        $fileAi = $this->input('file_ai');
        if (is_string($fileAi)) {
            $this->merge([
                'file_ai' => [$fileAi],
            ]);
        }
    }
}
