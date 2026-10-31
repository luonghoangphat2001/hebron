<?php

namespace App\Http\Requests\Admin\Product;

use App\Enums\ProductVisibleRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminProductCreateRequest extends FormRequest
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
        return [
            // Basic Information - either category_ids OR product_type (product_type is resolved to category_id)
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
            'template_ids' => 'sometimes|array',
            'template_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('templates', 'id')->whereNull('deleted_at'),
            ],
            'name' => 'required|string|max:200',
            'name_en' => 'nullable|string|max:200',
            'slug' => 'nullable|string|max:200|unique:products,slug',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',

            // Pricing
            'supply_price' => 'required|numeric|min:0',
            'brand_site_price' => 'required|numeric|min:0',
            'plain_site_price' => 'required|numeric|min:0',
            'shipping_fee' => 'required|numeric|min:0',
            'price_content' => 'nullable|string|max:255',
            'selling_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:100',

            // Representative image(s) – FSD: set via CRUD (no upload). Array of image URLs.
            'images' => 'nullable|array',
            'images.*' => 'url|max:500',
            'file_ai' => 'nullable|array',
            'file_ai.*' => 'string|max:500',

            // Status & Flags (sales status: is_active = sold/hidden, is_featured = promotional)
            'is_active' => 'nullable|boolean',
            'is_popular' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'is_top_product' => 'nullable|boolean',
            'stock_quantity' => 'nullable|integer|min:0',
            'mes_inventory_enabled' => 'nullable|boolean',
            'stock_inventory_enabled' => 'nullable|boolean',
            'min_quantity' => 'nullable|integer|min:1',
            'max_quantity' => 'nullable|integer|min:0',
            'sort_order' => 'nullable|integer',
            'visible_roles' => 'nullable|array',
            'visible_roles.*' => ['string', Rule::in(ProductVisibleRole::values())],

            // Specification (optional)
            'specification' => 'required|array',
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

        $data = [
            'is_active' => $this->input('is_active', true),
            'is_popular' => $this->input('is_popular', false),
            'is_featured' => $this->input('is_featured', false),
            'is_top_product' => $this->input('is_top_product', false),
            'stock_quantity' => $this->input('stock_quantity', 0),
            'mes_inventory_enabled' => $this->input('mes_inventory_enabled', true),
            'stock_inventory_enabled' => $this->input('stock_inventory_enabled', true),
            'min_quantity' => $this->input('min_quantity', 1),
            'max_quantity' => $this->input('max_quantity', 0),
            'sort_order' => $this->input('sort_order', 0),
        ];

        $this->merge($data);
    }
}
