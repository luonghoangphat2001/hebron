<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'legacy_product_id',
        'name_en',
        'slug',
        'description',
        'short_description',
        'supply_price',
        'selling_price',
        'brand_site_price',
        'plain_site_price',
        'shipping_fee',
        'price_content',
        'sku',
        'images',
        'file_ai',
        'is_popular',
        'is_featured',
        'is_top_product',
        'stock_quantity',
        'min_quantity',
        'max_quantity',
        'has_option',
        'option_type',
        'sort_order',
        'visible_roles', // ["ALL", "MEMBER", "MANAGER"]
        'is_active',
        'view_count',
        'exposure_count',
        'average_rating',
        'total_reviews',
        'total_rating',
        'mes_inventory_enabled',
        'stock_inventory_enabled',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'selling_price' => 'integer',
        'brand_site_price' => 'integer',
        'plain_site_price' => 'integer',
        'supply_price' => 'integer',
        'shipping_fee' => 'integer',
        'images' => 'array',
        'file_ai' => 'array',
        'is_popular' => 'boolean',
        'is_featured' => 'boolean',
        'is_top_product' => 'boolean',
        'is_active' => 'boolean',
        'stock_quantity' => 'integer',
        'min_quantity' => 'integer',
        'max_quantity' => 'integer',
        'sort_order' => 'integer',
        'view_count' => 'integer',
        'exposure_count' => 'integer',
        'average_rating' => 'integer',
        'total_reviews' => 'integer',
        'total_rating' => 'integer',
        'visible_roles' => 'array',
        'mes_inventory_enabled' => 'boolean',
        'stock_inventory_enabled' => 'boolean',
    ];

    public function specification(): HasOne
    {
        return $this->hasOne(ProductSpecification::class);
    }

    public function templates(): HasMany
    {
        return $this->hasMany(Template::class)->orderBy('id');
    }

    public function getOneTemplate(): ?Template
    {
        return $this->templates()->first();
    }

    public function optionGroups(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductOptionGroup::class,
            'product_option_group_products',
            'product_id',
            'product_option_group_id'
        )
            ->as('assignment')
            ->withPivot([
                'id',
                'sort_order',
            ])
            ->wherePivotNull('deleted_at')
            ->orderByPivot('sort_order');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(
            Category::class,
            'category_product',
            'product_id',
            'category_id'
        )
            ->withPivot([
                'id',
                'sort_order',
                'deleted_at',
                'created_at',
                'updated_at',
            ])
            ->wherePivotNull('deleted_at')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    public function craftsmanshipValues(): BelongsToMany
    {
        return $this->belongsToMany(CraftsmanshipValue::class, 'craftsmanship_value_product')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    public function categoryProducts(): HasMany
    {
        return $this->hasMany(CategoryProduct::class, 'product_id');
    }

    /**
     * Determine whether the product has sufficient stock for the requested quantity.
     * When stock inventory management is disabled, purchase is allowed regardless of stock.
     */
    public function hasSufficientStock(int $requestedQuantity = 1): bool
    {
        if (! $this->stock_inventory_enabled) {
            return true;
        }

        return $this->stock_quantity >= $requestedQuantity;
    }

    /**
     * Determine whether the product is out of stock.
     * Products with inventory management disabled are never treated as out of stock.
     */
    public function isOutOfStock(): bool
    {
        if (! $this->stock_inventory_enabled) {
            return false;
        }

        return $this->stock_quantity <= 0;
    }

    public function scopeIsOutOfStock($query)
    {
        return $query->where('stock_inventory_enabled', true)
            ->where('stock_quantity', '<=', 0);
    }

    public function scopeSearch($query, ?string $keyword)
    {
        if (empty($keyword)) {
            return $query;
        }

        return $query->where(function ($q) use ($keyword) {
            $q->where('name', 'LIKE', "%{$keyword}%")
                ->orWhere('short_description', 'LIKE', "%{$keyword}%")
                ->orWhere('description', 'LIKE', "%{$keyword}%");
        });
    }

    /**
     * Search fields used by public product listings and the product search API.
     * Match only identifying product fields so incidental words in a
     * description or ngram token do not surface unrelated products.
     */
    public function scopeSearchList($query, ?string $keyword)
    {
        $keyword = trim((string) $keyword);
        if ($keyword === '') {
            return $query;
        }

        $contains = '%'.addcslashes($keyword, '\\%_').'%';

        return $query->where(function ($search) use ($keyword, $contains) {
            $search->where('products.name', $keyword)
                ->orWhere('products.name_en', $keyword)
                ->orWhere('products.sku', $keyword)
                ->orWhere('products.name', 'LIKE', $contains)
                ->orWhere('products.name_en', 'LIKE', $contains)
                ->orWhere('products.sku', 'LIKE', $contains);
        });
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePopular($query)
    {
        return $query->where('is_popular', true)->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->where('is_active', true);
    }
}
