<?php

namespace App\Services\MyPage;

use App\Enums\OrderShipmentStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ShippingMethod;
use App\Enums\SiteType;
use App\Http\Resources\CartItemResource;
use App\Http\Resources\CartResource;
use App\Jobs\SyncOrderToMesJob;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\DesignGroup;
use App\Models\Order;
use App\Models\OrderDesignContent;
use App\Models\OrderItem;
use App\Models\OrderShipment;
use App\Models\Product;
use App\Models\User;
use App\Services\BulkOrderService;
use App\Services\DesignService;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Services\PointService;
use App\Services\PointTransactionService;
use App\Services\ProductQuoteService;
use App\Support\CommerceIdentity;
use App\Support\GuestCommerceToken;
use App\Support\OrderNumberGenerator;
use App\Support\PaymentMethodResolver;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyPageCartService
{
    public function __construct(
        protected BulkOrderService $bulkOrderService,
        protected DesignService $designService,
        protected PointService $pointService,
        protected PointTransactionService $pointTransactionService,
        protected ProductQuoteService $productQuoteService,
    ) {}

    /**
     * Cart item by id, scoped to carts owned by the user.
     *
     * Avoids Cart::where('user_id')->first() picking the wrong row when duplicate carts exist.
     */
    private function resolveCart(?User $user, ?string $guestToken): Cart
    {
        if ($user) {
            return Cart::getOrCreateForUser($user->id);
        }

        $guestTokenHash = GuestCommerceToken::hash($guestToken);
        if ($guestTokenHash === null) {
            throw new \InvalidArgumentException('Guest token is required.');
        }

        return Cart::getOrCreateForGuest($guestTokenHash);
    }

    private function cartItemOwnedByIdentity(?User $user, int $itemId, ?string $guestToken): CartItem
    {
        $cart = $this->resolveCart($user, $guestToken);

        return CartItem::query()
            ->whereKey($itemId)
            ->where('cart_id', $cart->id)
            ->firstOrFail();
    }

    /**
     * Get or create cart for user
     *
     * @param  string|null  $search  Optional filter: product name, notes, options JSON text, artwork title/file name (client display list).
     */
    public function getCart(?User $user, ?string $search = null, ?string $guestToken = null): CartResource
    {
        try {
            $cart = $this->resolveCart($user, $guestToken);

            $items = $cart->items()
                ->with([
                    'product',
                    'product.specification',
                    'designGroup',
                    'orderDesignContent',
                ])
                ->orderBy('created_at')
                ->get();

            if ($search !== null && trim($search) !== '') {
                $items = $this->filterCartItemsForSearch($items, trim($search));
            }

            $cart->setRelation('items', $items);

            return new CartResource($cart);
        } catch (\Exception $e) {
            Log::error('Get MyPage cart failed', [
                'user_id' => $user?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Subtotals for checked rows (장바구니 화면 — 선택 상품 합계).
     *
     * @param  list<int>  $itemIds
     * @return array{item_count: int, line_quantity_total: float, subtotal: float, currency: string}
     */
    public function selectionSummary(?User $user, array $itemIds, ?string $guestToken = null): array
    {
        $cart = $this->resolveCart($user, $guestToken);
        $itemIds = array_values(array_unique(array_map('intval', $itemIds)));
        if ($itemIds === []) {
            throw new \InvalidArgumentException('item_ids is required.');
        }

        $items = CartItem::query()
            ->whereIn('id', $itemIds)
            ->where('cart_id', $cart->id)
            ->with(['product'])
            ->get();

        if ($items->count() !== count($itemIds)) {
            throw new ModelNotFoundException('One or more cart items were not found.');
        }

        $lineQuantity = (int) $items->sum(fn (CartItem $i) => $i->quantity);
        $subtotal = (int) $items->sum(fn (CartItem $i) => (int) $i->subtotal);

        return [
            'item_count' => $items->count(),
            'line_quantity_total' => $lineQuantity,
            'subtotal' => round($subtotal),
            'currency' => 'KRW',
        ];
    }

    private function filterCartItemsForSearch(Collection $items, string $search): Collection
    {
        $needle = mb_strtolower($search, 'UTF-8');

        return $items->filter(function (CartItem $item) use ($needle) {
            $name = mb_strtolower((string) ($item->product->name ?? ''), 'UTF-8');
            if ($name !== '' && str_contains($name, $needle)) {
                return true;
            }

            return false;
        })->values();
    }

    public function addItem(?User $user, array $data, ?string $guestToken = null): CartItemResource
    {
        $cart = $this->resolveCart($user, $guestToken);
        $identity = CommerceIdentity::fromParts($user, $guestToken);

        if (isset($data['design_group_id'])) {
            $designGroupQuery = DesignGroup::query()
                ->whereKey($data['design_group_id'])
                ->where('product_id', $data['product_id']);

            $designGroupQuery->ownedByIdentity($identity);

            $designGroupQuery->firstOrFail();
        }

        if (isset($data['order_design_content_id'])) {
            OrderDesignContent::query()
                ->ownedByIdentity($identity)
                ->whereKey($data['order_design_content_id'])
                ->firstOrFail();
        }

        $product = Product::findOrFail($data['product_id']);
        if (! $product->hasSufficientStock((int) $data['quantity'])) {
            throw new \RuntimeException('해당 상품의 재고가 부족합니다.', 422);
        }

        $quote = $this->productQuoteService->quote(
            productId: $data['product_id'],
            payload: [
                'selected_options' => $data['selected_options'] ?? [],
            ],
            quantity: 1,
            siteType: SiteType::SHOPPING_MALL,
        );

        $cartItem = DB::transaction(function () use ($cart, $data, $quote) {
            return CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $data['product_id'],
                'design_group_id' => $data['design_group_id'] ?? null,
                'order_design_content_id' => $data['order_design_content_id'] ?? null,

                'quantity' => $data['quantity'],

                'original_price' => $quote['supply_price'],
                'sale_price' => $quote['selling_price'],
                'option_price' => $quote['option_price'],

                'selected_options' => $quote['selected_options'],

                'storage_date' => now(),
            ]);
        });

        $cartItem->load([
            'product.categories',
            'product.specification',
            'designGroup',
            'orderDesignContent',
        ]);

        return new CartItemResource($cartItem);
    }

    private function checkDesignGroupExistInCartOrder(User $user, int $designGroupId): DesignGroup
    {
        $exists = CartItem::query()
            ->join('carts', 'carts.id', '=', 'cart_items.cart_id')
            ->where('carts.user_id', $user->id)
            ->where('cart_items.design_group_id', $designGroupId)
            ->exists();

        if ($exists) {
            throw new \InvalidArgumentException('Group design id exist.');
        }

        return $this->getAndCheckDesginGroupEmptyOrderItem($user, $designGroupId);
    }

    /**
     * Update cart item (quantity_price_tier via `quantity`, bundle_tier via `number_of_cases` / pivot ids).
     */
    public function updateItem(?User $user, int $itemId, array $data, ?string $guestToken = null): CartItemResource
    {
        try {
            $cartItem = $this->cartItemOwnedByIdentity($user, $itemId, $guestToken);

            $newQuantity = $data['quantity'] ?? $cartItem->quantity;
            $product = $cartItem->product ?? Product::findOrFail($cartItem->product_id);
            if (! $product->hasSufficientStock((int) $newQuantity)) {
                throw new \RuntimeException('해당 상품의 재고가 부족합니다.', 422);
            }

            $cartItem->quantity = $newQuantity;
            $cartItem->save();

            $cartItem->load([
                'product',
                'designGroup',
                'orderDesignContent',
            ]);

            return new CartItemResource($cartItem);
        } catch (\Exception $e) {
            Log::error('Update cart item failed', [
                'user_id' => $user?->id,
                'item_id' => $itemId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Delete cart item
     */
    public function deleteItem(?User $user, int $itemId, ?string $guestToken = null): void
    {
        try {
            $cartItem = $this->cartItemOwnedByIdentity($user, $itemId, $guestToken);

            $cartItem->delete();
        } catch (\Exception $e) {
            Log::error('Delete cart item failed', [
                'user_id' => $user?->id,
                'item_id' => $itemId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Batch delete cart items
     */
    public function batchDeleteItems(?User $user, array $itemIds, ?string $guestToken = null): void
    {
        try {
            DB::beginTransaction();

            // Get or create cart for user (avoid exception if cart doesn't exist)
            $cart = $this->resolveCart($user, $guestToken);

            // Verify all items belong to user's cart
            $itemsCount = CartItem::where('cart_id', $cart->id)
                ->whereIn('id', $itemIds)
                ->count();

            if ($itemsCount !== count($itemIds)) {
                throw new \Exception('일부 항목을 찾을 수 없거나 권한이 없습니다.');
            }

            // Delete items
            CartItem::where('cart_id', $cart->id)
                ->whereIn('id', $itemIds)
                ->delete();

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Batch delete cart items failed', [
                'user_id' => $user?->id,
                'item_ids' => $itemIds,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Extend storage date (보관일 연장) for a cart item by 7 days.
     */
    public function extendStorage(?User $user, int $itemId, ?string $guestToken = null): CartItemResource
    {
        try {
            /** @var CartItem $cartItem */
            $cartItem = $this->cartItemOwnedByIdentity($user, $itemId, $guestToken);

            $current = $cartItem->storage_date ?? now()->addDays(7);
            $cartItem->storage_date = $current->copy()->addDays(7);
            $cartItem->save();

            $cartItem->load([
                'product',
                'designGroup',
                'orderDesignContent',
            ]);

            return new CartItemResource($cartItem);
        } catch (\Exception $e) {
            Log::error('Extend cart item storage failed', [
                'user_id' => $user?->id,
                'item_id' => $itemId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Calculate checkout quote from cart items without creating an order.
     */
    public function checkoutQuote(?User $user, array $data = [], ?string $guestToken = null): array
    {
        $cart = $this->resolveCart($user, $guestToken);

        $cart->load([
            'items.product.specification',
            'items.product.categories',
        ]);

        $items = $this->resolveCartItems($cart, $data);

        if ($items->isEmpty()) {
            throw new \RuntimeException('장바구니가 비어있습니다.', 422);
        }

        $quote = $this->buildCheckoutQuote($items);
        unset($quote['line_quotes']);

        return $quote;
    }

    private function buildCheckoutQuote(Collection $items): array
    {
        $itemQuotes = [];
        $lineQuotes = [];

        $summary = [
            'supply_price' => 0,
            'selling_price' => 0,
            'option_price' => 0,
            'sub_total' => 0,
            'vat' => 0,
            'total' => 0,
        ];

        foreach ($items as $item) {
            $product = $item->product ?? Product::find($item->product_id);
            if (! $product || ! $product->hasSufficientStock((int) $item->quantity)) {
                throw new \RuntimeException('해당 상품의 재고가 부족합니다.', 422);
            }

            $freshQuote = $this->productQuoteService->quote(
                productId: $item->product_id,
                payload: ['selected_options' => $item->selected_options ?? []],
                quantity: $item->quantity,
                siteType: SiteType::SHOPPING_MALL,
            );
            $lineQuotes[$item->id] = $freshQuote;

            $lineSupplyPrice = $freshQuote['supply_price'];
            $lineSellingPrice = $freshQuote['selling_price'];
            $lineOptionPrice = $freshQuote['option_price'];

            $lineSubTotal = $freshQuote['subtotal_amount'];

            $summary['supply_price'] += $lineSupplyPrice;
            $summary['selling_price'] += $lineSellingPrice;
            $summary['option_price'] += $lineOptionPrice;
            $summary['sub_total'] += $lineSubTotal;
            $summary['vat'] += $freshQuote['tax_amount'];

            $itemQuotes[] = [
                'cart_item_id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product->name,
                'thumbnail' => $item->product->thumbnail,

                'price' => $freshQuote['selling_price'],
                'supply_price' => $freshQuote['supply_price'],
                'selling_price' => $freshQuote['selling_price'],
                'option_price' => $freshQuote['option_price'],
                'selected_options' => $freshQuote['selected_options'],
                'quantity' => $item->quantity,
                'sub_total' => round($lineSubTotal),
                'estimated_production_days' => $item->product->specification?->production_time_days ?? 0,
            ];
        }

        $summary['total'] = $summary['sub_total'];
        $summary['estimated_production_days'] = $items->max(
            fn ($item) => $item->product->specification?->production_time_days ?? 0
        );

        return [
            'items' => $itemQuotes,
            'line_quotes' => $lineQuotes,
            'summary' => $summary,
        ];
    }

    private function resolveCartItems(Cart $cart, array $data): Collection
    {
        $items = $cart->items;

        if (empty($data['item_ids']) || ! is_array($data['item_ids'])) {
            $items = $items->values();
            $this->assertValidDesignReferences($items);

            return $items;
        }

        $itemIds = collect($data['item_ids'])
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values();

        $items = $items
            ->whereIn('id', $itemIds)
            ->values();

        if ($items->count() !== $itemIds->count()) {
            throw new \InvalidArgumentException(
                '선택한 항목 중 일부를 찾을 수 없거나 장바구니에 없습니다.'
            );
        }

        $this->assertValidDesignReferences($items);

        return $items;
    }

    private function assertValidDesignReferences(Collection $items): void
    {
        foreach ($items as $item) {
            if ($item->design_group_id !== null && $item->order_design_content_id !== null) {
                throw new \InvalidArgumentException('Each cart item cannot have both design references.');
            }
        }
    }

    /**
     * Checkout cart (move to order)
     * Creates an actual order from cart items for demo purposes
     *
     * @param  array  $data  Optional checkout data (shipping_address_id, payment_method, etc.)
     */
    public function checkout(?User $user, array $data, ?string $guestToken = null): array
    {
        $cart = $this->resolveCart($user, $guestToken);

        return DB::transaction(function () use (
            $user,
            $cart,
            $data,
            $guestToken,
        ) {
            $cart = Cart::query()->whereKey($cart->id)->lockForUpdate()->firstOrFail();
            $cart->setRelation('items', $cart->items()
                ->with(['product.specification', 'product.categories'])
                ->lockForUpdate()
                ->get());

            $items = $this->resolveCartItems($cart, $data);
            if ($items->isEmpty()) {
                throw new \RuntimeException('장바구니가 비어있습니다.', 422);
            }

            // Recalculate only after cart lines are locked.
            $quote = $this->buildCheckoutQuote($items);

            $paymentMethod = PaymentMethodResolver::resolve($data['payment_method'] ?? null);

            $order = Order::create([
                'order_number' => OrderNumberGenerator::generate(),
                'user_id' => $user?->id,
                'guest_token_hash' => $user ? null : GuestCommerceToken::hash($guestToken),
                'status' => $paymentMethod === PaymentMethod::TRANSFER ? OrderStatus::AwaitingPayment->value : OrderStatus::Pending->value,
                'payment_status' => PaymentStatus::PENDING->value,
                'currency' => 'KRW',
                'subtotal_amount' => $quote['summary']['sub_total'],
                'discount_amount' => 0,
                'tax_amount' => $quote['summary']['vat'],
                'shipping_fee' => 0,
                'total_amount' => $quote['summary']['total'],
                'payment_method' => $paymentMethod,

                'contact_name' => $data['contact']['name'],
                'contact_phone' => $data['contact']['phone'],
                'contact_phone2' => $data['contact']['phone2'] ?? null,
                'contact_email' => $data['contact']['email'],
                'company_name' => data_get($data, 'contact.company_name', $data['company_name'] ?? null),
                'contact_postcode' => $data['contact']['postcode'] ?? null,
                'contact_address' => $data['contact']['address'] ?? null,
                'contact_address_detail' => $data['contact']['address_detail'] ?? null,

                'shipping_name' => data_get($data, 'shipping.name'),
                'shipping_phone' => data_get($data, 'shipping.phone'),
                'shipping_postcode' => data_get($data, 'shipping.postcode'),
                'shipping_address' => data_get($data, 'shipping.address'),
                'shipping_address_detail' => data_get($data, 'shipping.address_detail'),
                'shipping_method' => $data['shipping_method'] ?? ShippingMethod::COURIER->value,

                'estimated_production_days' => $quote['summary']['estimated_production_days'],
                'customer_note' => data_get($data, 'shipping.customer_note', $data['customer_note'] ?? null),
                'placed_at' => now(),
                'metadata' => [
                    'checkout_source' => 'cart',
                    'cart_id' => $cart->id,
                    'cart_item_ids' => $items->pluck('id')->map(fn ($id) => (int) $id)->values()->all(),
                ],
            ]);

            foreach ($items as $item) {
                $itemQuote = $quote['line_quotes'][$item->id];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'design_group_id' => $item['design_group_id'],
                    'order_design_content_id' => $item->order_design_content_id,
                    'title' => $item->product->name,
                    'quantity' => $item->quantity,

                    'supply_price' => $itemQuote['supply_price'],
                    'selling_price' => $itemQuote['selling_price'],
                    'option_price' => $itemQuote['option_price'],
                    'sub_total_amount' => $itemQuote['subtotal_amount'],
                    'tax_amount' => $itemQuote['tax_amount'],
                    'total_amount' => $itemQuote['total_amount'],
                    'configuration' => [
                        'selected_options' => $itemQuote['selected_options'],
                        'selected_option_values' => $this->mapSelectedOptionsValue($item->product, $itemQuote['selected_options']),
                        'product_snapshot' => $item->product->toArray(),
                    ],
                ]);
            }

            $this->ensurePendingShipment($order);

            if ($paymentMethod === PaymentMethod::TRANSFER) {
                // Bank-transfer orders need a transaction identifier immediately.
                app(PaymentService::class)->initiatePayment($order, PaymentMethod::TRANSFER->value);
                $this->removeCheckoutItems($order);
            }

            // Dispatch order to Mes integration job
            SyncOrderToMesJob::dispatch($order);

            return [
                'order' => $order->fresh('items'),
            ];
        });

        if (isset($result['order']) && $result['order'] instanceof Order) {
            app(OrderService::class)->dispatchOrderCreatedNotifications($result['order']);
        }

        return $result;
    }

    /**
     * Remove the cart rows that were converted into an order.
     * The identifiers are server-written when checkout creates the order.
     */
    public function removeCheckoutItems(Order $order): void
    {
        $metadata = is_array($order->metadata) ? $order->metadata : [];
        if (($metadata['checkout_source'] ?? null) !== 'cart') {
            return;
        }

        $cartId = filter_var($metadata['cart_id'] ?? null, FILTER_VALIDATE_INT);
        $itemIds = collect($metadata['cart_item_ids'] ?? [])
            ->filter(fn ($id) => filter_var($id, FILTER_VALIDATE_INT) !== false)
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        if (! $cartId || $itemIds->isEmpty()) {
            return;
        }

        CartItem::query()
            ->where('cart_id', $cartId)
            ->whereIn('id', $itemIds)
            ->delete();
    }

    private function getAndCheckDesginGroupEmptyOrderItem(User $user, int $design_group_id): DesignGroup
    {
        $designGroup = DesignGroup::where('id', $design_group_id)
            ->where('user_id', $user->id)
            ->first();

        if (! $designGroup) {
            throw new \RuntimeException(
                "Design group [{$design_group_id}] not found."
            );
        } elseif ($designGroup->order_item_id != null) {
            throw new \RuntimeException(
                "Design group [{$design_group_id}] exist other order."
            );
        }

        return $designGroup;
    }

    /**
     * @param  array<int, array<string, mixed>>  $selectedOptions
     * @return array<int, array<string, mixed>>
     */
    private function mapSelectedOptionsValue(Product $product, array $selectedOptions): array
    {
        if (empty($selectedOptions)) {
            return [];
        }

        return collect($selectedOptions)->map(function (array $selection) use ($product) {
            // Cart items store the enriched quote shape (`group.id` / `option.id`),
            // while older rows and direct request payloads may still use
            // `group_id` / `option_id`. Accept both when creating the order.
            $groupId = data_get($selection, 'group_id', data_get($selection, 'group.id'));
            $optionId = data_get($selection, 'option_id', data_get($selection, 'option.id'));

            $group = $product->optionGroups->firstWhere('id', $groupId);

            if (! $group) {
                throw new \InvalidArgumentException('선택한 옵션 그룹이 유효하지 않습니다.');
            }

            $option = $group->options->firstWhere('id', $optionId);

            if (! $option) {
                throw new \InvalidArgumentException('선택한 옵션이 유효하지 않습니다.');
            }

            return [
                'group' => [
                    'id' => $group->id,
                    'code' => $group->code,
                    'name' => $group->name,
                ],
                'option' => [
                    'id' => $option->id,
                    'name' => $option->name,
                    'additional_price' => $option->additional_price,
                ],
            ];
        })->values()->all();
    }

    private function normalizePhoneDigits(?string $phone): string
    {
        if ($phone === null || $phone === '') {
            return '';
        }

        return preg_replace('/\D/', '', $phone) ?? '';
    }

    private function createOrderShipments(Order $order): void
    {
        $shippingInfo = [
            'shipping_name' => $order->shipping_name,
            'shipping_phone' => $order->shipping_phone,
            'shipping_postcode' => $order->shipping_postcode,
            'shipping_address' => $order->shipping_address,
            'shipping_address_detail' => $order->shipping_address_detail,
        ];

        $order->orderShipment()->firstOrCreate([], array_merge($shippingInfo, [
            'status' => OrderShipmentStatus::PENDING->value,
            'shipping_fee' => $order->shipping_fee ?? 0,
        ]));
    }

    private function ensurePendingShipment(Order $order): OrderShipment
    {
        $this->createOrderShipments($order);

        return $order->orderShipment()->first();
    }
}
