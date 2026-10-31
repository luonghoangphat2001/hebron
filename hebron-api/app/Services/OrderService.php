<?php

namespace App\Services;

use App\Enums\OrderShipmentStatus;
use App\Enums\DesignRevisionStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ShippingMethod;
use App\Enums\SiteType;
use App\Jobs\ConfirmDesignToMesJob;
use App\Jobs\SyncOrderToMesJob;
use App\Models\AddressBook;
use App\Models\DesignGroup;
use App\Models\Order;
use App\Models\OrderDesignContent;
use App\Models\OrderShipment;
use App\Models\OrderShippingAddressHistory;
use App\Models\Product;
use App\Models\User;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Services\Notifications\AdminNotificationMailService;
use App\Services\Notifications\OrderNotificationService;
use App\Support\CommerceIdentity;
use App\Support\GuestCommerceToken;
use App\Support\OrderNumberGenerator;
use App\Support\OrderShippingPanelPayload;
use App\Support\PaymentMethodResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        protected OrderRepositoryInterface $orderRepository,
        protected ProductQuoteService $productQuoteService,
        protected PaymentService $paymentService,
    ) {}

    public function createOrder(array $payload, ?User $user = null, ?string $guestToken = null): Order
    {
        $order = DB::transaction(function () use ($payload, $user, $guestToken) {

            $product = Product::with('specification')->findOrFail($payload['product_id']);

            if (! $product->hasSufficientStock((int) $payload['quantity'])) {
                throw new \RuntimeException('해당 상품의 재고가 부족합니다.', 422);
            }

            $designGroupId = Arr::get($payload, 'design_group_id');
            $group = null;

            if ($designGroupId !== null) {
                $groupQuery = DesignGroup::query()
                    ->whereKey($designGroupId)
                    ->where('product_id', $payload['product_id']);

                $groupQuery->ownedByIdentity(CommerceIdentity::fromParts($user, $guestToken));

                $group = $groupQuery->firstOrFail();
            }

            $orderDesignContentId = Arr::get($payload, 'order_design_content_id');
            $orderDesignContent = $orderDesignContentId === null
                ? null
                : OrderDesignContent::query()
                    ->ownedByIdentity(CommerceIdentity::fromParts($user, $guestToken))
                    ->findOrFail($orderDesignContentId);

            $selectedOptions = Arr::get($payload, 'selected_options', []);

            $quote = $this->productQuoteService->quote(
                $payload['product_id'],
                [
                    'selected_options' => $selectedOptions,
                ],
                $payload['quantity'],
                SiteType::SHOPPING_MALL
            );

            $paymentMethod = PaymentMethodResolver::resolve(Arr::get($payload, 'payment_method'));

            $order = Order::create([
                'order_number' => OrderNumberGenerator::generate(),
                'user_id' => $user?->id,
                'guest_token_hash' => $user ? null : GuestCommerceToken::hash($guestToken),

                'status' => $paymentMethod === PaymentMethod::TRANSFER ? OrderStatus::AwaitingPayment->value : OrderStatus::Pending->value,
                'payment_status' => PaymentStatus::PENDING->value,

                'currency' => 'KRW',

                'subtotal_amount' => $quote['subtotal_amount'],
                'discount_amount' => 0,
                'tax_amount' => $quote['tax_amount'],
                'shipping_fee' => $quote['shipping_fee'],
                'total_amount' => $quote['total_amount'],

                'payment_method' => $paymentMethod,

                // Contact
                'contact_name' => data_get($payload, 'contact.name'),
                'contact_phone' => data_get($payload, 'contact.phone'),
                'contact_phone2' => data_get($payload, 'contact.phone2'),
                'contact_email' => data_get($payload, 'contact.email'),
                'company_name' => data_get($payload, 'contact.company_name', Arr::get($payload, 'company_name')),

                // Shipping
                'shipping_name' => data_get($payload, 'shipping.name'),
                'shipping_phone' => data_get($payload, 'shipping.phone'),
                'shipping_postcode' => data_get($payload, 'shipping.postcode'),
                'shipping_address' => data_get($payload, 'shipping.address'),
                'shipping_address_detail' => data_get($payload, 'shipping.address_detail'),
                'shipping_method' => Arr::get($payload, 'shipping_method', ShippingMethod::COURIER->value),

                'estimated_production_days' => $quote['estimated_production_days'],
                'placed_at' => now(),
                'customer_note' => data_get($payload, 'shipping.customer_note', Arr::get($payload, 'customer_note')),

                'metadata' => [],
            ]);

            $order->items()->create([
                'product_id' => $product->id,
                'design_group_id' => $group?->id,
                'order_design_content_id' => $orderDesignContent?->id,

                'title' => $product->name,
                'quantity' => $payload['quantity'],

                'supply_price' => $quote['supply_price'],
                'selling_price' => $quote['selling_price'],
                'option_price' => $quote['option_price'],
                'sub_total_amount' => $quote['subtotal_amount'],
                'tax_amount' => $quote['tax_amount'],
                'total_amount' => $quote['total_amount'],

                'configuration' => [
                    'selected_options' => $selectedOptions,
                    'selected_option_values' => $this->mapSelectedOptionsValue(
                        $product,
                        $selectedOptions
                    ),
                    'product_snapshot' => $product->toArray(),
                ],

                'notes' => null,
            ]);

            $this->ensurePendingShipment($order);

            // Bank-transfer orders need a transaction identifier immediately.
            if ($paymentMethod === PaymentMethod::TRANSFER) {
                $this->paymentService->initiatePayment($order, PaymentMethod::TRANSFER->value);
            }

            // Dispatch order to Mes integration job
            SyncOrderToMesJob::dispatch($order);

            return $order->load('items');
        });

        $this->dispatchOrderCreatedNotifications($order);

        return $order;
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
            $group = $product->optionGroups->firstWhere('id', $selection['group_id'] ?? null);

            if (! $group) {
                throw new \InvalidArgumentException('선택한 옵션 그룹이 유효하지 않습니다.');
            }

            $option = $group->options->firstWhere('id', $selection['option_id'] ?? null);

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

    public function getOrdersForUser(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return $this->orderRepository->paginateForUser($user->id, $perPage);
    }

    public function getOrderForUser(string $orderNumber, User $user): Order
    {
        $order = $this->orderRepository->findForUser($orderNumber, $user->id);

        if (! $order) {
            throw new ModelNotFoundException('주문을 찾을 수 없습니다.');
        }

        return $order;
    }

    public function getOrderForIdentity(string $orderNumber, ?User $user, ?string $guestToken = null): Order
    {
        if ($user) {
            return $this->getOrderForUser($orderNumber, $user);
        }

        $order = Order::with('items.designGroup', 'items.orderDesignContent')
            ->where('order_number', $orderNumber)
            ->whereNull('user_id')
            ->where('guest_token_hash', GuestCommerceToken::hash($guestToken))
            ->first();

        if (! $order) {
            throw new ModelNotFoundException('주문을 찾을 수 없습니다.');
        }

        return $order;
    }

    /**
     * Clone a completed order using current product and option prices.
     * Payment and fulfillment state are intentionally reset for the new order.
     */
    public function reorderForUser(string $orderNumber, User $user): Order
    {
        $source = $this->getOrderForUser($orderNumber, $user)->load('items');

        if ($source->status !== OrderStatus::Completed->value) {
            throw new \RuntimeException('완료된 주문만 재주문할 수 있습니다.', 400);
        }

        if ($source->items->isEmpty()) {
            throw new \RuntimeException('재주문할 주문 상품이 없습니다.', 400);
        }

        $order = DB::transaction(function () use ($source, $user) {
            $quotedItems = $source->items->map(function ($item) {
                if (! $item->product_id || ! $item->design_group_id) {
                    throw new \RuntimeException('재주문할 상품 정보가 올바르지 않습니다.', 400);
                }

                $product = Product::findOrFail($item->product_id);
                if (! $product->hasSufficientStock((int) $item->quantity)) {
                    throw new \RuntimeException('해당 상품의 재고가 부족합니다.', 422);
                }

                $selectedOptions = data_get($item->configuration, 'selected_options', []);
                $quote = $this->productQuoteService->quote(
                    (int) $item->product_id,
                    ['selected_options' => $this->normalizeSelectedOptions($selectedOptions)],
                    (int) $item->quantity,
                    SiteType::SHOPPING_MALL
                );

                return compact('item', 'quote');
            });

            $subtotal = $quotedItems->sum(fn (array $row) => $row['quote']['subtotal_amount']);
            $tax = $quotedItems->sum(fn (array $row) => $row['quote']['tax_amount']);
            $shippingFee = $quotedItems->sum(fn (array $row) => $row['quote']['shipping_fee']);

            $order = Order::create([
                'order_number' => OrderNumberGenerator::generate(),
                'user_id' => $user->id,
                'status' => OrderStatus::Pending->value,
                'payment_status' => PaymentStatus::PENDING->value,
                'currency' => $source->currency ?? 'KRW',
                'subtotal_amount' => $subtotal,
                'discount_amount' => 0,
                'tax_amount' => $tax,
                'shipping_fee' => $shippingFee,
                'total_amount' => $subtotal + $tax + $shippingFee,
                'payment_method' => $source->payment_method,
                'contact_name' => $source->contact_name,
                'contact_phone' => $source->contact_phone,
                'contact_phone2' => $source->contact_phone2,
                'contact_email' => $source->contact_email,
                'company_name' => $source->company_name,
                'shipping_name' => $source->shipping_name,
                'shipping_phone' => $source->shipping_phone,
                'shipping_postcode' => $source->shipping_postcode,
                'shipping_address' => $source->shipping_address,
                'shipping_address_detail' => $source->shipping_address_detail,
                'shipping_method' => $source->shipping_method,
                'estimated_production_days' => $quotedItems->max(fn (array $row) => $row['quote']['estimated_production_days']),
                'placed_at' => now(),
                'customer_note' => $source->customer_note,
                'metadata' => array_merge($source->metadata ?? [], [
                    'reordered_from' => $source->order_number,
                ]),
            ]);

            foreach ($quotedItems as $row) {
                $item = $row['item'];
                $quote = $row['quote'];
                $item->replicate(['order_id', 'created_at', 'updated_at'])->forceFill([
                    'order_id' => $order->id,
                    'supply_price' => $quote['supply_price'],
                    'selling_price' => $quote['selling_price'],
                    'option_price' => $quote['option_price'],
                    'sub_total_amount' => $quote['subtotal_amount'],
                    'tax_amount' => $quote['tax_amount'],
                    'total_amount' => $quote['total_amount'],
                    'configuration' => array_merge($item->configuration ?? [], [
                        'selected_options' => $this->normalizeSelectedOptions($quote['selected_options']),
                    ]),
                ])->save();
            }

            $this->ensurePendingShipment($order);

            return $order->fresh(['items']);
        });

        $this->dispatchOrderCreatedNotifications($order);

        return $order;
    }

    public function dispatchOrderCreatedNotifications(Order $order): void
    {
        // 1. (To Admin) Order Receipt Notification Email
        try {
            app(AdminNotificationMailService::class)
                ->sendOrderReceivedNotification($order);
        } catch (\Throwable $e) {
            \Log::error('Failed to send admin order received notification', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }

        // 2. (To Customer) Kakao AlimTalk Order Received Notification (template UB_1260)
        try {
            app(OrderNotificationService::class)
                ->sendOrderComplete($order);
        } catch (\Throwable $e) {
            \Log::error('Failed to send customer order received alimtalk', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function ensurePendingShipment(Order $order): OrderShipment
    {
        return $order->orderShipment()->firstOrCreate([], [
            'status' => OrderShipmentStatus::PENDING->value,
            'shipping_method' => $order->shipping_method?->value ?? $order->shipping_method,
            'shipping_fee' => $order->shipping_fee ?? 0,
            'shipping_name' => $order->shipping_name,
            'shipping_phone' => $order->shipping_phone,
            'shipping_postcode' => $order->shipping_postcode,
            'shipping_address' => $order->shipping_address,
            'shipping_address_detail' => $order->shipping_address_detail,
        ]);
    }

    /** @param array<int, array<string, mixed>> $options */
    private function normalizeSelectedOptions(array $options): array
    {
        return collect($options)->map(function (array $option) {
            return [
                'group_id' => data_get($option, 'group_id', data_get($option, 'group.id')),
                'option_id' => data_get($option, 'option_id', data_get($option, 'option.id')),
            ];
        })->filter(fn (array $option) => $option['group_id'] && $option['option_id'])->values()->all();
    }

    /**
     * Update contact and shipping information for an existing order.
     *
     * @param  array<string, mixed>  $payload
     */
    public function updateShippingInfo(string $orderNumber, User $user, array $payload): Order
    {
        $order = $this->getOrderForUser($orderNumber, $user);

        // Cannot edit if already paid
        if ($order->is_paid) {
            throw new \RuntimeException('이미 결제가 완료된 주문의 배송 정보를 수정할 수 없습니다.', 400);
        }

        $order->update([
            'contact_name' => Arr::get($payload, 'contact.name'),
            'contact_phone' => $this->normalizePhone(Arr::get($payload, 'contact.phone')),
            'contact_phone2' => $this->normalizePhone(Arr::get($payload, 'contact.phone2')),
            'contact_tel' => $this->normalizePhone(Arr::get($payload, 'contact.tel')),
            'contact_email' => Arr::get($payload, 'contact.email'),
            'company_name' => Arr::get($payload, 'company_name'),
            'contact_postcode' => Arr::get($payload, 'contact.postcode'),
            'contact_address' => Arr::get($payload, 'contact.address'),
            'contact_address_detail' => Arr::get($payload, 'contact.address_detail'),
            'shipping_name' => Arr::get($payload, 'shipping.name'),
            'shipping_phone' => $this->normalizePhone(Arr::get($payload, 'shipping.phone')),
            'shipping_phone2' => $this->normalizePhone(Arr::get($payload, 'shipping.phone2')),
            'shipping_postcode' => Arr::get($payload, 'shipping.postcode'),
            'shipping_address' => Arr::get($payload, 'shipping.address'),
            'shipping_address_detail' => Arr::get($payload, 'shipping.address_detail'),
            'shipping_email' => Arr::get($payload, 'shipping.email'),
            'shipping_method' => Arr::get($payload, 'shipping_method'),
            'customer_note' => Arr::get($payload, 'customer_note'),
            'requested_delivery_date' => Arr::get($payload, 'requested_delivery_date'),
        ]);

        return $order->fresh(['items']);
    }

    /**
     * Apply a saved address book entry to the order's shipping fields only (배송지 변경).
     * Stores {@see AddressBook} id in order metadata for picker pre-selection.
     *
     * @throws ModelNotFoundException When the address book row is missing for this user.
     */
    public function updateShippingFromAddressBook(string $orderNumber, User $user, int $addressBookId): Order
    {
        $order = $this->getOrderForUser($orderNumber, $user);

        if ($order->is_paid) {
            throw new \RuntimeException('이미 결제가 완료된 주문의 배송 정보를 수정할 수 없습니다.', 400);
        }

        $address = AddressBook::where('user_id', $user->id)->whereKey($addressBookId)->first();
        if (! $address) {
            throw new ModelNotFoundException('배송지를 찾을 수 없습니다.');
        }

        $this->eagerLoadOrderForShippingPanel($order);

        $payload = $this->buildShippingUpdatePayloadFromAddressBook($order, $address);

        if ($this->orderAlreadyMatchesShippingPayload($order, $address, $payload)) {
            return $this->hydrateOrderForMyPageDeliveryDetail($order->fresh([
                'user.customer',
                'items.artworks',
                'product.designModes',
                'designMode',
                'paymentTransaction',
                'shipment',
                'orderShipment',
                'artworks',
            ]));
        }

        DB::transaction(function () use ($order, $address, $payload): void {
            $existingHistoryCount = OrderShippingAddressHistory::where('order_id', $order->id)->count();

            if ($existingHistoryCount === 0) {
                OrderShippingAddressHistory::create([
                    'order_id' => $order->id,
                    'address_book_id' => null,
                    'changed_at' => $order->placed_at ?? $order->created_at ?? now(),
                    'payload' => OrderShippingPanelPayload::fromOrder($order),
                ]);
            }

            $order->update($payload);

            $order->refresh();
            $this->eagerLoadOrderForShippingPanel($order);

            OrderShippingAddressHistory::create([
                'order_id' => $order->id,
                'address_book_id' => $address->id,
                'changed_at' => now(),
                'payload' => OrderShippingPanelPayload::fromOrder($order),
            ]);
        });

        return $this->hydrateOrderForMyPageDeliveryDetail($order->fresh([
            'user.customer',
            'items.artworks',
            'product.designModes',
            'designMode',
            'paymentTransaction',
            'shipment',
            'orderShipment',
            'artworks',
        ]));
    }

    /**
     * Versions for "변경 이력 확인" modal (newest first).
     *
     * @return Collection<int, array{revision: int, changed_at: string, address_book_id: int|null, snapshot: array<string, mixed>}>
     */
    public function getShippingAddressHistoryVersions(string $orderNumber, User $user): Collection
    {
        $order = $this->getOrderForUser($orderNumber, $user);

        $rows = OrderShippingAddressHistory::query()
            ->where('order_id', $order->id)
            ->orderByDesc('changed_at')
            ->orderByDesc('id')
            ->get();

        $total = $rows->count();

        return $rows->values()->map(function (OrderShippingAddressHistory $row, int $index) use ($total) {
            return [
                'revision' => $total - $index,
                'changed_at' => $row->changed_at->toIso8601String(),
                'address_book_id' => $row->address_book_id,
                'snapshot' => $row->payload ?? [],
            ];
        });
    }

    public function requestProofRevision(
        string $orderNumber,
        User $user,
        string $requestMessage,
        ?UploadedFile $attachment = null
    ): Order {
        $order = $this->getOrderForUser($orderNumber, $user);
        $this->assertProofNotYetConfirmed($order);
        $metadata = is_array($order->metadata) ? $order->metadata : [];
        $corrections = is_array($metadata['corrections'] ?? null) ? $metadata['corrections'] : [];

        $row = [
            'requested_at' => now()->toIso8601String(),
            'message' => $requestMessage,
            'attachment_url' => $attachment ? $this->storeProofFile($order, $attachment, 'corrections') : null,
        ];

        $corrections[] = $row;
        $metadata['corrections'] = $corrections;
        $metadata['proof_status'] = 'revision_requested';
        $metadata['proof_confirmed_at'] = null;

        $order->update(['metadata' => $metadata, 'status' => OrderStatus::DesignRejected->value]);

        $revision = $order->latestDesignRevision;
        if ($revision && $revision->status === DesignRevisionStatus::Pending) {
            $revision->update(['status' => DesignRevisionStatus::Modify,
                'comments' => [...($revision->comments ?? []), $requestMessage]]);
            app(AdminNotificationMailService::class)->sendDraftRevisionRequestedNotification($order, $revision, $requestMessage);
        }

        return $this->reloadProofOrder($order);
    }

    public function resubmitProofFile(
        string $orderNumber,
        User $user,
        UploadedFile $file,
        ?string $note = null
    ): Order {
        $order = $this->getOrderForUser($orderNumber, $user);
        $this->assertProofNotYetConfirmed($order);
        $metadata = is_array($order->metadata) ? $order->metadata : [];
        $resubmissions = is_array($metadata['file_resubmissions'] ?? null) ? $metadata['file_resubmissions'] : [];

        $row = [
            'submitted_at' => now()->toIso8601String(),
            'file_url' => $this->storeProofFile($order, $file, 'resubmissions'),
            'note' => $note,
        ];

        $resubmissions[] = $row;
        $metadata['file_resubmissions'] = $resubmissions;
        $metadata['proof_status'] = 'file_resubmitted';
        $metadata['proof_confirmed_at'] = null;

        $order->update(['metadata' => $metadata]);

        return $this->reloadProofOrder($order);
    }

    public function confirmProof(string $orderNumber, User $user, bool $confirm): Order
    {
        if (! $confirm) {
            throw new \InvalidArgumentException('confirm must be true', 422);
        }

        $order = $this->getOrderForUser($orderNumber, $user);
        if (! empty($order->metadata['proof_confirmed_at'])) {
            throw new \RuntimeException('이미 교정 확인이 완료된 주문입니다.', 400);
        }
        $this->assertProofNotYetConfirmed($order);
        $metadata = is_array($order->metadata) ? $order->metadata : [];
        $metadata['proof_status'] = 'confirmed';
        $metadata['proof_confirmed_at'] = now()->toIso8601String();

        $revision = $order->latestDesignRevision;
        if ($order->status === OrderStatus::DesignRejected->value
            || ($revision && $revision->status !== DesignRevisionStatus::Pending)) {
            throw new \RuntimeException('관리자가 수정 시안을 등록한 후 확정해 주세요.', 422);
        }
        $order->update(['metadata' => $metadata, 'status' => OrderStatus::DesignConfirmed->value]);

        if ($revision && $revision->status === DesignRevisionStatus::Pending) {
            $revision->update(['status' => DesignRevisionStatus::Approve]);
            app(AdminNotificationMailService::class)->sendDraftConfirmedNotification($order, $revision);
        }

        ConfirmDesignToMesJob::dispatch($order);

        return $this->reloadProofOrder($order);
    }

    private function reloadProofOrder(Order $order): Order
    {
        return $order->fresh(['user', 'items.product', 'items.designGroup',
            'items.orderDesignContent', 'paymentTransaction', 'orderShipment', 'orderShipments']);
    }

    private function eagerLoadOrderForShippingPanel(Order $order): void
    {
        $order->loadMissing([
            'orderShipment',
            'shipment.shippingManager',
        ]);
    }

    private function hydrateOrderForMyPageDeliveryDetail(Order $order): Order
    {
        return $order;
    }

    private function assertProofNotYetConfirmed(Order $order): void
    {
        if (! in_array($order->status, [OrderStatus::Confirmed->value, OrderStatus::PendingReception->value,
            OrderStatus::FileError->value, OrderStatus::PendingCorrection->value,
            OrderStatus::DesignConfirmationRequested->value, OrderStatus::DesignRejected->value], true)) {
            throw new \RuntimeException('현재 주문 단계에서는 시안을 수정하거나 확정할 수 없습니다.', 422);
        }
        if (! empty($order->metadata['proof_confirmed_at'])) {
            throw new \RuntimeException('이미 교정 확인이 완료되어 수정/재접수를 할 수 없습니다.', 400);
        }
    }

    private function storeProofFile(Order $order, UploadedFile $file, string $folder): string
    {
        $path = $file->storeAs(
            'orders/proof/'.$order->id.'/'.$folder,
            now()->format('YmdHis').'-'.Str::random(8).'.'.$file->getClientOriginalExtension(),
            config('filesystems.public_disk')
        );

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(config('filesystems.public_disk'));

        return $disk->url($path);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildShippingUpdatePayloadFromAddressBook(Order $order, AddressBook $address): array
    {
        $mobile = trim((string) ($address->mobile ?? ''));
        $phone = trim((string) ($address->phone ?? ''));

        if ($mobile !== '') {
            $primarySource = $mobile;
            $secondarySource = ($phone !== '' && $this->normalizePhone($phone) !== $this->normalizePhone($mobile))
                ? $phone
                : null;
        } else {
            $primarySource = $phone !== '' ? $phone : null;
            $secondarySource = null;
        }

        $metadata = is_array($order->metadata) ? $order->metadata : [];
        $metadata['shipping_address_book_id'] = $address->id;

        $payload = [
            'shipping_name' => $address->recipient,
            'shipping_phone' => $this->normalizePhone($primarySource),
            'shipping_phone2' => $secondarySource ? $this->normalizePhone($secondarySource) : null,
            'shipping_postcode' => $address->postcode,
            'shipping_address' => $address->address,
            'shipping_address_detail' => $address->detailed_address,
            'metadata' => $metadata,
        ];

        if (filled($address->email)) {
            $payload['shipping_email'] = $address->email;
        }

        $deliveryMessage = $address->delivery_message_custom
            ?: $address->delivery_message_preset
            ?: $address->delivery_message;

        if (filled($deliveryMessage)) {
            $payload['customer_note'] = $deliveryMessage;
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function orderAlreadyMatchesShippingPayload(Order $order, AddressBook $address, array $payload): bool
    {
        $expectedEmail = array_key_exists('shipping_email', $payload)
            ? $payload['shipping_email']
            : $order->shipping_email;

        $expectedNote = array_key_exists('customer_note', $payload)
            ? $payload['customer_note']
            : $order->customer_note;

        return trim((string) ($order->shipping_name ?? '')) === trim((string) ($payload['shipping_name'] ?? ''))
            && $this->normalizePhone($order->shipping_phone) === $this->normalizePhone($payload['shipping_phone'] ?? null)
            && $this->normalizePhone($order->shipping_phone2) === $this->normalizePhone($payload['shipping_phone2'] ?? null)
            && trim((string) ($order->shipping_postcode ?? '')) === trim((string) ($payload['shipping_postcode'] ?? ''))
            && trim((string) ($order->shipping_address ?? '')) === trim((string) ($payload['shipping_address'] ?? ''))
            && trim((string) ($order->shipping_address_detail ?? '')) === trim((string) ($payload['shipping_address_detail'] ?? ''))
            && trim((string) ($order->shipping_email ?? '')) === trim((string) ($expectedEmail ?? ''))
            && trim((string) ($order->customer_note ?? '')) === trim((string) ($expectedNote ?? ''))
            && (int) data_get($order->metadata, 'shipping_address_book_id') === $address->id;
    }

    /**
     * Normalize phone number by removing non-digit characters
     */
    private function normalizePhone(?string $phone): ?string
    {
        if (! $phone) {
            return null;
        }

        return preg_replace('/[^0-9]/', '', $phone) ?: null;
    }

    /**
     * Get shipping time based on shipping method
     * 택배,화물은 17고정, 나머지는 9~18 중 숫자 값
     */
    private function getShippingTime(?string $shippingTime, string $shippingMethod): ?string
    {
        // get enum values from ShippingMethod
        if (in_array($shippingMethod, [ShippingMethod::COURIER->value])) {
            return '17';
        }

        // get shipping time 9~18
        if ($shippingTime && is_numeric($shippingTime) && $shippingTime >= 9 && $shippingTime <= 18) {
            return $shippingTime;
        }

        return null;
    }
}
