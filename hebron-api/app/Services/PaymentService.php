<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PaymentWebhookEventType;
use App\Enums\PaymentWebhookProcessingStatus;
use App\Enums\PaymentWebhookProvider;
use App\Enums\WalletTransactionType;
use App\Exceptions\TossPaymentSessionExpiredException;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\User;
use App\Models\VirtualAccount;
use App\Models\Wallet;
use App\Services\MyPage\MyPageCartService;
use App\Services\Notifications\OrderNotificationService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentService
{
    /**
     * Card company code mapping from Toss Payments
     */
    public const TOSS_CARD_COMPANIES = [
        '11' => 'KB국민',
        '21' => '하나',
        '31' => 'BC',
        '41' => '신한',
        '51' => '삼성',
        '61' => '현대',
        '71' => '롯데',
        '81' => 'NH농협',
        '91' => '씨티',
        '32' => '광주',
        '33' => '전북',
        '34' => '제주',
        '35' => '수협',
        '36' => 'KDB산업',
        '37' => '우체국',
        '38' => '새마을',
        '39' => '저축',
        '3A' => '케이뱅크',
        '3C' => '카카오뱅크',
        '3D' => '토스뱅크',
        '4V' => '비자',
        '4M' => '마스터',
        '3J' => 'JCB',
        '6D' => '다이너스',
        '4D' => '디스커버',
        '4U' => '유니온페이',
        '4A' => '아멕스',
    ];

    public function __construct(
        protected PointTransactionService $pointTransactionService,
        protected WalletTransactionService $walletTransactionService,
        protected PaymentWebhookLogService $paymentWebhookLogService,
        protected OrderNotificationService $orderNotificationService,
        protected MyPageCartService $cartService,
    ) {}

    /**
     * Initiate payment for an order
     *
     * @throws Exception
     */
    public function initiatePayment(Order $order, string $paymentMethod, array $additionalData = []): PaymentTransaction
    {
        return DB::transaction(function () use ($order, $paymentMethod, $additionalData): PaymentTransaction {
            // Reload and lock order row to avoid race conditions (double pending payments)
            $order = Order::whereKey($order->id)->lockForUpdate()->first();

            // Orders that are already fully paid/refunded cannot proceed to new payment
            if (in_array($order->payment_status, [
                PaymentStatus::PAID->value,
                PaymentStatus::REFUNDED->value,
                PaymentStatus::PARTIALLY_REFUNDED->value,
            ], true)) {
                throw new Exception('이 주문은 이미 결제가 완료되었습니다.', 400);
            }

            // Orders in certain terminal states cannot be paid
            $blockedOrderStatuses = [
                OrderStatus::Cancelled->value,
                OrderStatus::Completed->value,
                OrderStatus::RefundRequested->value,
                OrderStatus::RefundCompleted->value,
            ];

            if (in_array($order->status, $blockedOrderStatuses, true)) {
                throw new Exception('현재 상태의 주문은 결제할 수 없습니다.', 400);
            }

            if (! in_array($order->status, [
                OrderStatus::Pending->value,
                OrderStatus::AwaitingPayment->value,
            ], true)) {
                throw new Exception('결제를 시작할 수 없는 주문 상태입니다.', 409);
            }

            if (! in_array($order->payment_status, [
                PaymentStatus::PENDING->value,
                PaymentStatus::FAILED->value,
                PaymentStatus::CANCELLED->value,
                PaymentStatus::EXPIRED->value,
            ], true)) {
                throw new Exception('결제를 다시 시작할 수 없는 상태입니다.', 409);
            }

            // Validate payment method
            $paymentMethodEnum = PaymentMethod::tryFrom($paymentMethod);
            if (! $paymentMethodEnum) {
                throw new Exception('유효하지 않은 결제 수단입니다.', 400);
            }

            // If there is an existing latest transaction, handle resume/change-of-method or amount-change cases
            $latestTransaction = $order->paymentTransaction()->latest('id')->first();

            if ($latestTransaction && $latestTransaction->isPending()) {
                $latestMethodEnum = $latestTransaction->getPaymentMethodEnum();
                $sameMethod = $latestMethodEnum && $latestMethodEnum->value === $paymentMethodEnum->value;
                $sameAmount = (string) $latestTransaction->amount === (string) $order->total_amount;
                $sameCurrency = $latestTransaction->currency === $order->currency;

                if ($sameMethod && $sameAmount && $sameCurrency) {
                    // Reuse existing pending transaction
                    return $latestTransaction->fresh();
                }

                // Auto-cancel previous pending transaction before creating a new one
                $latestTransaction->update([
                    'status' => PaymentStatus::CANCELLED->value,
                    'refund_reason' => 'Auto-cancel before creating new payment (method/amount changed)',
                    'failed_at' => now(),
                ]);

                $order->update([
                    'payment_status' => PaymentStatus::CANCELLED->value,
                ]);
            }

            // Generate unique transaction ID
            $transactionId = $this->generateTransactionId();

            // Create payment transaction with normalized payment method value
            $transaction = PaymentTransaction::create([
                'order_id' => $order->id,
                'transaction_id' => $transactionId,
                'payment_method' => $paymentMethodEnum->value,
                'status' => PaymentStatus::PENDING->value,
                'amount' => $order->total_amount,
                'currency' => $order->currency,
                'bank_account_holder' => $additionalData['bank_account_holder'] ?? null,
                'metadata' => $additionalData['metadata'] ?? null,
            ]);

            // Update order payment status
            $order->update([
                'status' => OrderStatus::AwaitingPayment->value,
                'payment_status' => PaymentStatus::PENDING->value,
            ]);

            // If payment method requires immediate verification (card, seomun_pay, toss),
            // here you would integrate with PG (Payment Gateway).
            if ($paymentMethodEnum->requiresImmediateVerification()) {
                // TODO: Integrate with actual PG (KG Inicis, Toss, etc.)
                // $pgResponse = $this->callPaymentGateway($transaction, $additionalData);
                // $transaction->update(['pg_transaction_id' => $pgResponse['tid'], ...]);
            }

            return $transaction->fresh();
        });
    }

    /**
     * Confirm payment with Toss Payments after frontend receives success redirect.
     *
     * @param  array{paymentKey:string,orderNumber:string,amount:int}  $data
     *
     * @throws Exception
     */
    public function confirmTossPayment(array $data): PaymentTransaction
    {
        $order = Order::where('order_number', $data['orderNumber'])->first();

        if (! $order) {
            throw new Exception('Order not found.', 404);
        }

        if ((int) $order->total_amount !== (int) $data['amount']) {
            throw new Exception('Amount mismatch for Toss payment.', 400);
        }

        $pendingTransaction = PaymentTransaction::query()
            ->where('order_id', $order->id)
            ->whereIn('status', [PaymentStatus::PENDING->value, PaymentStatus::PROCESSING->value])
            ->latest('id')
            ->first();

        if (! $pendingTransaction) {
            $completedTransaction = PaymentTransaction::query()
                ->where('order_id', $order->id)
                ->where('pg_transaction_id', $data['paymentKey'])
                ->where('status', PaymentStatus::PAID->value)
                ->first();

            if ($completedTransaction) {
                return $completedTransaction->fresh('order');
            }

            throw new Exception('A pending payment transaction is required before confirmation.', 409);
        }

        $secretKey = config('services.toss.secret_key');
        $baseUrl = rtrim(config('services.toss.base_url', 'https://api.tosspayments.com'), '/');

        if (! $secretKey) {
            throw new Exception('Toss secret key is not configured.', 500);
        }

        $response = Http::withBasicAuth($secretKey, '')
            ->post($baseUrl.'/v1/payments/confirm', [
                'paymentKey' => $data['paymentKey'],
                'orderId' => $data['orderNumber'],
                'amount' => $data['amount'],
            ]);

        if ($response->failed()) {
            $body = $response->json();
            $tossCode = $body['code'] ?? null;
            $tossMessage = $body['message'] ?? $response->body();

            $this->markPaymentFailed($pendingTransaction, $tossMessage);

            if ($tossCode === 'NOT_FOUND_PAYMENT_SESSION') {
                throw new TossPaymentSessionExpiredException(
                    '결제 시간이 만료되었습니다. 결제를 다시 시작해 주세요.',
                    400
                );
            }

            throw new Exception('Toss confirm failed: '.$tossMessage, $response->status());
        }

        $payload = $response->json();

        if (
            data_get($payload, 'orderId') !== $order->order_number
            || (int) data_get($payload, 'totalAmount') !== (int) $order->total_amount
            || data_get($payload, 'paymentKey') !== $data['paymentKey']
            || data_get($payload, 'status') !== 'DONE'
        ) {
            throw new Exception('Toss payment response did not match the pending order.', 409);
        }

        $transaction = DB::transaction(function () use ($pendingTransaction, $data, $payload, $order) {
            $transaction = PaymentTransaction::query()->whereKey($pendingTransaction->id)->lockForUpdate()->firstOrFail();
            if (! $transaction->isPending()) {
                throw new Exception('Payment transaction is no longer pending.', 409);
            }

            $transaction->update([
                'status' => PaymentStatus::PAID->value,
                'pg_transaction_id' => $data['paymentKey'],
                'pg_name' => 'toss',
                'pg_response' => $payload,
                'paid_at' => now(),
                // Card
                'card_number' => data_get($payload, 'card.number'),

                // Virtual account
                'virtual_account_number' => data_get($payload, 'virtualAccount.accountNumber'),
                'virtual_account_bank' => data_get($payload, 'virtualAccount.bankCode'),
                'virtual_account_expires_at' => data_get($payload, 'virtualAccount.dueDate'),
                'bank_account_holder' => data_get($payload, 'virtualAccount.customerName'),
            ]);

            $order->update([
                'payment_status' => PaymentStatus::PAID->value,
                'status' => OrderStatus::Confirmed->value,
            ]);

            $this->cartService->removeCheckoutItems($order);

            if (filled(data_get($payload, 'virtualAccount.accountNumber'))) {
                try {
                    $this->orderNotificationService->sendBankTransfer(
                        order: $order,
                        bankName: (string) data_get($payload, 'virtualAccount.bankCode', ''),
                        accountHolder: (string) data_get($payload, 'virtualAccount.customerName', ''),
                        accountNumber: (string) data_get($payload, 'virtualAccount.accountNumber', ''),
                        totalPrice: (float) $order->total_amount
                    );
                } catch (\Throwable $e) {
                    \Log::error('Bank transfer notification failed on confirmPayment', [
                        'order_number' => $order->order_number,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return $transaction->fresh('order');
        });

        return $transaction;
    }

    private function markPaymentFailed(PaymentTransaction $payment, string $reason): void
    {
        DB::transaction(function () use ($payment, $reason): void {
            $transaction = PaymentTransaction::query()
                ->with('order')
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->first();

            if (! $transaction || ! $transaction->isPending()) {
                return;
            }

            $transaction->update([
                'status' => PaymentStatus::FAILED->value,
                'failed_at' => now(),
                'refund_reason' => $reason,
            ]);
            $transaction->order->update([
                'payment_status' => PaymentStatus::FAILED->value,
                'status' => OrderStatus::AwaitingPayment->value,
            ]);
        });
    }

    /**
     * Verify payment (callback from PG or manual confirmation)
     *
     * @throws Exception
     */
    public function verifyPayment(string $transactionId, array $verificationData = []): PaymentTransaction
    {
        $transaction = PaymentTransaction::where('transaction_id', $transactionId)->first();

        if (! $transaction) {
            throw new Exception('결제 정보를 찾을 수 없습니다.', 404);
        }

        if ($transaction->isPaid()) {
            return $transaction->fresh('order');
        }

        throw new Exception('Client verification cannot complete a payment. Wait for the payment gateway callback.', 409);
    }

    /**
     * Handle payment webhook from PG
     *
     * @throws Exception
     */
    public function handleWebhook(array $webhookData): PaymentTransaction
    {
        // Extract transaction ID from webhook data
        // This depends on PG provider format
        $pgTransactionId = $webhookData['tid'] ?? $webhookData['transaction_id'] ?? null;

        if (! $pgTransactionId) {
            throw new Exception('Invalid webhook data: missing transaction ID', 400);
        }

        $transaction = PaymentTransaction::where('pg_transaction_id', $pgTransactionId)->first();

        if (! $transaction) {
            throw new Exception('Payment transaction not found', 404);
        }

        // Update based on webhook status
        $webhookStatus = $webhookData['status'] ?? 'unknown';

        $newStatus = match ($webhookStatus) {
            'paid', 'success', 'completed' => PaymentStatus::PAID->value,
            'failed', 'error' => PaymentStatus::FAILED->value,
            'cancelled' => PaymentStatus::CANCELLED->value,
            default => $transaction->getPaymentStatusEnum()?->value,
        };

        if ($newStatus === $transaction->getPaymentStatusEnum()?->value) {
            return $transaction->fresh('order');
        }

        if (! $transaction->isPending()) {
            throw new Exception('Invalid payment state transition.', 409);
        }

        $updateData = [
            'status' => $newStatus,
            'pg_response' => $webhookData,
        ];

        if ($newStatus === PaymentStatus::PAID->value) {
            $updateData['paid_at'] = now();

            // Update order payment status
            $transaction->order->update([
                'payment_status' => PaymentStatus::PAID->value,
                'status' => OrderStatus::Confirmed->value,
            ]);
            $this->cartService->removeCheckoutItems($transaction->order);
        } elseif ($newStatus === PaymentStatus::FAILED->value) {
            $updateData['failed_at'] = now();

            // Update order payment status
            $transaction->order->update([
                'payment_status' => PaymentStatus::FAILED->value,
                'status' => OrderStatus::AwaitingPayment->value,
            ]);
        }

        $transaction->update($updateData);

        return $transaction->fresh('order');
    }

    /**
     * General Toss payment webhooks do not carry a signed payload. Re-querying
     * Toss with the server secret is therefore the authentication step.
     */
    public function handleTossWebhook(array $webhookData): PaymentTransaction
    {
        $paymentKey = data_get($webhookData, 'data.paymentKey', $webhookData['paymentKey'] ?? null);
        if (! is_string($paymentKey) || $paymentKey === '') {
            throw new Exception('Missing Toss payment key.', 422);
        }

        $payload = $this->retrieveTossPayment($paymentKey);
        $orderNumber = data_get($payload, 'orderId');
        $amount = (int) data_get($payload, 'totalAmount');
        $status = data_get($payload, 'status');

        return DB::transaction(function () use ($paymentKey, $orderNumber, $amount, $status, $payload): PaymentTransaction {
            $order = Order::query()->where('order_number', $orderNumber)->lockForUpdate()->first();
            if (! $order || $amount !== (int) $order->total_amount) {
                throw new Exception('Toss payment does not match an order.', 409);
            }

            $transaction = PaymentTransaction::query()
                ->where('order_id', $order->id)
                ->where('pg_transaction_id', $paymentKey)
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new Exception('Toss payment does not match a payment transaction.', 409);
            }

            $newStatus = match ($status) {
                'DONE' => PaymentStatus::PAID->value,
                'CANCELED' => PaymentStatus::CANCELLED->value,
                'PARTIAL_CANCELED' => PaymentStatus::PARTIALLY_REFUNDED->value,
                'ABORTED', 'EXPIRED' => PaymentStatus::FAILED->value,
                default => throw new Exception('Unsupported Toss payment status.', 409),
            };

            if ($transaction->getPaymentStatusEnum()?->value === $newStatus) {
                return $transaction->fresh('order');
            }
            if (! $transaction->isPending()) {
                throw new Exception('Invalid payment state transition.', 409);
            }

            $transaction->update([
                'status' => $newStatus,
                'pg_response' => $payload,
                'paid_at' => $newStatus === PaymentStatus::PAID->value ? now() : null,
                'failed_at' => $newStatus === PaymentStatus::FAILED->value ? now() : null,
            ]);
            $order->update([
                'payment_status' => $newStatus,
                'status' => $newStatus === PaymentStatus::PAID->value
                    ? OrderStatus::Confirmed->value
                    : OrderStatus::AwaitingPayment->value,
            ]);

            if ($newStatus === PaymentStatus::PAID->value) {
                $this->cartService->removeCheckoutItems($order);
            }

            return $transaction->fresh('order');
        });
    }

    public function retrieveTossPayment(string $paymentKey): array
    {
        $secretKey = config('services.toss.secret_key');
        if (! $secretKey) {
            throw new Exception('Toss secret key is not configured.', 500);
        }

        $response = Http::withBasicAuth($secretKey, '')
            ->get(rtrim(config('services.toss.base_url', 'https://api.tosspayments.com'), '/').'/v1/payments/'.$paymentKey);

        if ($response->failed()) {
            throw new Exception('Toss payment verification failed.', $response->status());
        }

        return $response->json();
    }

    /**
     * Get card payment details from transaction or Toss Payments API
     */
    public function getCardDetails(PaymentTransaction $transaction): ?array
    {
        $payload = $transaction->pg_response;

        // If card data is not found in pg_response but pg_transaction_id (paymentKey) exists and provider is Toss,
        // fetch from Toss Payments API and cache into transaction
        if (empty(data_get($payload, 'card')) && $transaction->pg_transaction_id && ($transaction->pg_name === 'toss' || empty($transaction->pg_name))) {
            try {
                $fetchedPayload = $this->retrieveTossPayment($transaction->pg_transaction_id);
                if (! empty($fetchedPayload)) {
                    $payload = $fetchedPayload;
                    $updates = ['pg_response' => $payload];
                    if (! $transaction->card_number && data_get($payload, 'card.number')) {
                        $updates['card_number'] = data_get($payload, 'card.number');
                    }
                    $issuerCode = data_get($payload, 'card.issuerCode');
                    if (! $transaction->card_name && $issuerCode && isset(self::TOSS_CARD_COMPANIES[$issuerCode])) {
                        $updates['card_name'] = self::TOSS_CARD_COMPANIES[$issuerCode];
                    }
                    $transaction->update($updates);
                }
            } catch (\Throwable $e) {
                Log::warning('Could not retrieve Toss payment details for card info', [
                    'transaction_id' => $transaction->transaction_id,
                    'pg_transaction_id' => $transaction->pg_transaction_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $card = data_get($payload, 'card');

        if (! empty($card)) {
            $issuerCode = $card['issuerCode'] ?? null;
            $acquirerCode = $card['acquirerCode'] ?? null;
            $issuerName = self::TOSS_CARD_COMPANIES[$issuerCode] ?? $transaction->card_name;
            $acquirerName = self::TOSS_CARD_COMPANIES[$acquirerCode] ?? null;

            return [
                'card_number' => $card['number'] ?? $transaction->card_number,
                'card_name' => $issuerName ?? $transaction->card_name,
                'card_type' => $card['cardType'] ?? null,
                'owner_type' => $card['ownerType'] ?? null,
                'issuer_code' => $issuerCode,
                'issuer_name' => $issuerName,
                'acquirer_code' => $acquirerCode,
                'acquirer_name' => $acquirerName,
                'installment_plan_months' => $card['installmentPlanMonths'] ?? 0,
                'is_interest_free' => (bool) ($card['isInterestFree'] ?? false),
                'approve_no' => $card['approveNo'] ?? null,
                'use_card_point' => (bool) ($card['useCardPoint'] ?? false),
            ];
        }

        if (! empty($transaction->card_number) || ! empty($transaction->card_name)) {
            return [
                'card_number' => $transaction->card_number,
                'card_name' => $transaction->card_name,
                'card_type' => null,
                'owner_type' => null,
                'issuer_code' => null,
                'issuer_name' => $transaction->card_name,
                'acquirer_code' => null,
                'acquirer_name' => null,
                'installment_plan_months' => 0,
                'is_interest_free' => false,
                'approve_no' => null,
                'use_card_point' => false,
            ];
        }

        return null;
    }

    /**
     * Cancel payment
     *
     * @throws Exception
     */
    public function cancelPayment(string $transactionId, ?string $reason = null): PaymentTransaction
    {
        return DB::transaction(function () use ($transactionId, $reason): PaymentTransaction {
            $transaction = PaymentTransaction::with('order')
                ->where('transaction_id', $transactionId)
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new Exception('결제 정보를 찾을 수 없습니다.', 404);
            }

            if ($transaction->isPaid()) {
                throw new Exception('이미 완료된 결제는 취소할 수 없습니다. 환불을 요청하세요.', 400);
            }

            $transaction->update([
                'status' => PaymentStatus::CANCELLED->value,
                'refund_reason' => $reason,
                'failed_at' => now(),
            ]);

            // Keep order payment and workflow statuses synchronized.
            $transaction->order->update([
                'payment_status' => PaymentStatus::CANCELLED->value,
                'status' => OrderStatus::AwaitingPayment->value,
            ]);

            return $transaction->fresh('order');
        });
    }

    /**
     * Update a payment status from the admin payment management screen.
     *
     * The transaction and its order are locked together so the duplicated
     * payment status cannot be changed independently by concurrent requests.
     */
    public function updatePaymentStatus(string $transactionId, PaymentStatus $status): PaymentTransaction
    {
        return DB::transaction(function () use ($transactionId, $status): PaymentTransaction {
            $transaction = PaymentTransaction::query()
                ->where(function ($query) use ($transactionId): void {
                    $query->where('transaction_id', $transactionId);

                    if (ctype_digit($transactionId)) {
                        $query->orWhereKey((int) $transactionId);
                    }
                })
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new Exception('결제 정보를 찾을 수 없습니다.', 404);
            }

            $order = Order::query()
                ->whereKey($transaction->order_id)
                ->lockForUpdate()
                ->firstOrFail();

            $currentStatus = $transaction->getPaymentStatusEnum()?->value;
            if ($currentStatus === $status->value) {
                return $transaction->fresh('order');
            }

            $this->validateAdminPaymentStatusChange($transaction, $order, $status);

            $updateData = ['status' => $status->value];

            match ($status) {
                PaymentStatus::PAID => $updateData['paid_at'] = now(),
                PaymentStatus::FAILED => $updateData['failed_at'] = now(),
                PaymentStatus::CANCELLED => $updateData['failed_at'] = now(),
                PaymentStatus::REFUNDED,
                PaymentStatus::PARTIALLY_REFUNDED => $updateData['refunded_at'] = now(),
                default => null,
            };

            $transaction->update($updateData);

            $order->update(['payment_status' => $status->value]);

            match ($status) {
                PaymentStatus::PAID => $order->update(['status' => OrderStatus::Confirmed->value]),
                PaymentStatus::REFUNDED => $order->update(['status' => OrderStatus::RefundCompleted->value]),
                PaymentStatus::PARTIALLY_REFUNDED => $order->update(['status' => OrderStatus::RefundRequested->value]),
                PaymentStatus::FAILED,
                PaymentStatus::CANCELLED,
                PaymentStatus::EXPIRED => $order->update(['status' => OrderStatus::AwaitingPayment->value]),
                default => null,
            };

            if ($status === PaymentStatus::PAID) {
                $this->cartService->removeCheckoutItems($order);
            }

            return $transaction->fresh('order');
        });
    }

    /**
     * Keep an admin status correction consistent with the order lifecycle.
     */
    private function validateAdminPaymentStatusChange(
        PaymentTransaction $transaction,
        Order $order,
        PaymentStatus $newStatus,
    ): void {
        $currentStatus = $transaction->getPaymentStatusEnum();

        if ($currentStatus && in_array($currentStatus, [
            PaymentStatus::REFUNDED,
            PaymentStatus::PARTIALLY_REFUNDED,
        ], true)) {
            throw new Exception('환불 완료된 결제 상태는 되돌릴 수 없습니다.', 409);
        }

        if ($currentStatus === PaymentStatus::PAID && $newStatus !== PaymentStatus::REFUNDED
            && $newStatus !== PaymentStatus::PARTIALLY_REFUNDED) {
            throw new Exception('결제 완료 상태는 환불 처리로만 변경할 수 있습니다.', 409);
        }

        if (in_array($newStatus, [
            PaymentStatus::REFUNDED,
            PaymentStatus::PARTIALLY_REFUNDED,
        ], true) && ! $currentStatus?->isCompleted()) {
            throw new Exception('결제 완료된 거래만 환불 상태로 변경할 수 있습니다.', 409);
        }

        if ($newStatus === PaymentStatus::PAID) {
            if ((int) $transaction->amount !== (int) $order->total_amount) {
                throw new Exception('결제 금액과 주문 금액이 일치하지 않습니다.', 409);
            }

            if (in_array($order->status, [
                OrderStatus::Cancelled->value,
                OrderStatus::Completed->value,
                OrderStatus::RefundRequested->value,
                OrderStatus::RefundCompleted->value,
            ], true)) {
                throw new Exception('취소 또는 종료된 주문은 결제 완료 처리할 수 없습니다.', 409);
            }

            $hasAnotherCompletedPayment = PaymentTransaction::query()
                ->where('order_id', $order->id)
                ->whereKeyNot($transaction->id)
                ->whereIn('status', [
                    PaymentStatus::PAID->value,
                    PaymentStatus::PARTIALLY_REFUNDED->value,
                    PaymentStatus::REFUNDED->value,
                ])
                ->lockForUpdate()
                ->exists();

            if ($hasAnotherCompletedPayment) {
                throw new Exception('이미 결제 완료된 거래가 있는 주문입니다.', 409);
            }
        }

        if ($currentStatus?->isCompleted() && in_array($newStatus, [
            PaymentStatus::PENDING,
            PaymentStatus::PROCESSING,
            PaymentStatus::FAILED,
            PaymentStatus::CANCELLED,
            PaymentStatus::EXPIRED,
        ], true)) {
            throw new Exception('완료된 결제는 대기 또는 실패 상태로 되돌릴 수 없습니다.', 409);
        }

        if (in_array($newStatus, [
            PaymentStatus::PENDING,
            PaymentStatus::PROCESSING,
            PaymentStatus::FAILED,
            PaymentStatus::CANCELLED,
            PaymentStatus::EXPIRED,
        ], true) && $order->is_paid) {
            throw new Exception('이미 결제 완료 또는 환불된 주문의 결제 상태를 되돌릴 수 없습니다.', 409);
        }
    }

    /**
     * Request refund for completed payment
     *
     * @param  float|null  $amount  Partial refund amount (null for full refund)
     *
     * @throws Exception
     */
    public function requestRefund(string $transactionId, string $reason, ?float $amount = null): PaymentTransaction
    {
        return DB::transaction(function () use ($transactionId, $reason, $amount): PaymentTransaction {
            $transaction = PaymentTransaction::with('order')
                ->where('transaction_id', $transactionId)
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new Exception('결제 정보를 찾을 수 없습니다.', 404);
            }

            if (! $transaction->isPaid()) {
                throw new Exception('완료된 결제만 환불할 수 있습니다.', 400);
            }

            // Determine refund type
            $isPartialRefund = $amount !== null && $amount < (float) $transaction->amount;
            $refundStatus = $isPartialRefund
                ? PaymentStatus::PARTIALLY_REFUNDED->value
                : PaymentStatus::REFUNDED->value;

            // TODO: Integrate with PG for actual refund request
            // $pgRefundResponse = $this->callPaymentGatewayRefund($transaction, $amount ?? $transaction->amount);

            $transaction->update([
                'status' => $refundStatus,
                'refund_reason' => $reason,
                'refunded_at' => now(),
            ]);

            // Keep order payment and workflow statuses synchronized.
            $transaction->order->update([
                'payment_status' => $refundStatus,
                'status' => $isPartialRefund
                    ? OrderStatus::RefundRequested->value
                    : OrderStatus::RefundCompleted->value,
            ]);

            return $transaction->fresh('order');
        });
    }

    /**
     * Create a virtual account with Toss Payments.
     *
     * @param  array  $payload  The payload for the Toss Payments API.
     * @return array The JSON response from Toss Payments.
     *
     * @throws Exception
     */
    public function createTossVirtualAccount(array $payload): array
    {
        $secretKey = config('services.toss.secret_key');
        $baseUrl = rtrim(config('services.toss.base_url', 'https://api.tosspayments.com'), '/');

        if (! $secretKey) {
            throw new Exception('Toss secret key is not configured.', 500);
        }

        $response = Http::withBasicAuth($secretKey, '')
            ->post($baseUrl.'/v1/virtual-accounts', $payload);

        if ($response->failed()) {
            $body = $response->json();
            $message = $body['message'] ?? 'Failed to create virtual account with TossPayments';

            throw new Exception($message, $response->status());
        }

        return $response->json();
    }

    /**
     * Handle deposit callback from Toss Payments.
     *
     * @param  array{createdAt:string,secret:string,status:string,transactionKey:string,orderId:string}  $webhookData
     *
     * @throws Exception
     */
    public function handleDepositCallback(array $webhookData): PaymentTransaction
    {
        $this->paymentWebhookLogService->log([
            'provider' => PaymentWebhookProvider::TOSS,
            'event_type' => PaymentWebhookEventType::DEPOSIT_CALLBACK,
            'transaction_key' => $webhookData['transactionKey'],
            'order_id' => $webhookData['orderId'],
            'payload' => $webhookData,
            'processing_status' => PaymentWebhookProcessingStatus::RECEIVED,
        ]);

        return DB::transaction(function () use ($webhookData) {

            $transaction = PaymentTransaction::with('order.user')
                ->where(function ($query) use ($webhookData) {
                    $query->WhereHas('order', function ($orderQuery) use ($webhookData) {
                        $orderQuery->where(
                            'order_number',
                            $webhookData['orderId']
                        );
                    });
                })
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new \RuntimeException('Payment transaction not found');
            }

            $expectedSecret = $transaction->metadata['secret'] ?? null;

            if (! $expectedSecret || $webhookData['secret'] !== $expectedSecret) {
                throw new \RuntimeException('Invalid webhook signature');
            }

            $oldStatus = $transaction->status;

            $newStatus = match ($webhookData['status']) {
                'DONE' => PaymentStatus::PAID->value,
                'CANCELED' => PaymentStatus::CANCELLED->value,
                'PARTIAL_CANCELED' => PaymentStatus::PARTIALLY_REFUNDED->value,
                'FAILED' => PaymentStatus::FAILED->value,
                default => $oldStatus,
            };

            $updateData = [
                'status' => $newStatus,
                'pg_response' => $webhookData,
                'pg_transaction_id' => $webhookData['transactionKey'],
            ];

            if (isset($webhookData['virtualAccount'])) {
                $updateData['virtual_account_number'] = data_get($webhookData, 'virtualAccount.accountNumber');
                $updateData['virtual_account_bank'] = data_get($webhookData, 'virtualAccount.bankCode');
                $updateData['virtual_account_expires_at'] = data_get($webhookData, 'virtualAccount.dueDate');
                $updateData['bank_account_holder'] = data_get($webhookData, 'virtualAccount.customerName');
            }

            match ($newStatus) {
                PaymentStatus::PAID->value => $updateData['paid_at'] = now(),
                PaymentStatus::FAILED->value => $updateData['failed_at'] = now(),
                PaymentStatus::CANCELLED->value,
                PaymentStatus::PARTIALLY_REFUNDED->value => $updateData['refunded_at'] = now(),
                default => null,
            };

            $transaction->update($updateData);

            if ($transaction->order) {
                $transaction->order->update([
                    'payment_status' => $newStatus,
                ]);

                if (($webhookData['status'] ?? null) === 'WAITING_FOR_DEPOSIT') {
                    try {
                        $this->orderNotificationService->sendBankTransfer(
                            order: $transaction->order,
                            bankName: $transaction->virtual_account_bank ?? '',
                            accountHolder: $transaction->bank_account_holder ?? '',
                            accountNumber: $transaction->virtual_account_number ?? '',
                            totalPrice: (float) $transaction->amount
                        );
                    } catch (\Throwable $e) {
                        \Log::error('Bank transfer notification failed on waiting for deposit', [
                            'order_number' => $transaction->order->order_number,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                if ($newStatus === PaymentStatus::PAID->value) {
                    $this->cartService->removeCheckoutItems($transaction->order);
                }
            }

            if (
                $oldStatus !== PaymentStatus::PAID->value
                && $newStatus === PaymentStatus::PAID->value
            ) {
                $this->walletTransactionService->createWalletTransaction(
                    $transaction->order->user->id,
                    $transaction->amount,
                    WalletTransactionType::DEPOSIT
                );
            }

            return $transaction->fresh('order');
        });
    }

    public function payByVirtualAccount(array $validated): PaymentTransaction
    {
        return DB::transaction(function () use ($validated) {

            $order = Order::query()
                ->where('order_number', $validated['order_number'])
                ->lockForUpdate()
                ->firstOrFail();

            $existingPayment = PaymentTransaction::query()
                ->where('order_id', $order->id)
                ->first();

            if ($existingPayment) {
                throw new \RuntimeException(
                    'Payment transaction already exists.'
                );
            }

            if (in_array($order->payment_status, [
                PaymentStatus::PAID->value,
                PaymentStatus::REFUNDED->value,
                PaymentStatus::PARTIALLY_REFUNDED->value,
            ], true)) {
                throw new \RuntimeException('Order already paid.');
            }

            $wallet = Wallet::with('user')
                ->where('user_id', $order->user_id)
                ->lockForUpdate()
                ->first();

            if (! $wallet) {
                throw new \RuntimeException('Wallet not found.');
            }

            $amount = (int) $order->total_amount;
            $metadata = $validated['metadata'] ?? [];

            $paymentStatus = PaymentStatus::PAID->value;

            if ($wallet->balance < $amount) {
                $virtualPayment = $this->createPaymentByVirtualAccount(
                    $wallet->user,
                    $order
                );
                $metadata = array_merge(
                    $metadata,
                    is_array($virtualPayment)
                        ? $virtualPayment
                        : $virtualPayment->toArray()
                );
                $paymentStatus = PaymentStatus::PENDING->value;
            }

            $walletTransaction = $this->walletTransactionService
                ->createWalletTransaction(
                    $wallet->user_id,
                    -$amount,
                    WalletTransactionType::PAYMENT
                );

            $paymentTransaction = PaymentTransaction::create([
                'order_id' => $order->id,
                'transaction_id' => $this->generateTransactionId(),
                'payment_method' => PaymentMethod::VIRTUAL_ACCOUNT->value,
                'status' => $paymentStatus,
                'amount' => $amount,
                'currency' => $order->currency,
                'pg_name' => 'wallet',
                'metadata' => ! empty($metadata)
                    ? $metadata
                    : null,
            ]);

            if (isset($walletTransaction)) {
                $walletTransaction->update([
                    'reference_id' => $paymentTransaction->id,
                ]);
            }

            $order->update([
                'payment_status' => $paymentStatus,
                'payment_method' => PaymentMethod::VIRTUAL_ACCOUNT->value,
                'status' => $paymentStatus == PaymentStatus::PAID->value ? OrderStatus::Confirmed->value : OrderStatus::AwaitingPayment->value,
            ]);

            if ($paymentStatus === PaymentStatus::PAID->value) {
                $this->cartService->removeCheckoutItems($order);
            }

            return $paymentTransaction->fresh('order');
        });
    }

    public function createPaymentByVirtualAccount(User $user, Order $order)
    {
        return DB::transaction(function () use ($user, $order) {

            $existingAccount = VirtualAccount::where('user_id', $user->id)->first();

            if (! $existingAccount) {
                throw new Exception('Not found account');
            }

            $tossPayload = [
                'amount' => (float) $order->total_amount,
                'orderId' => $order->order_number,
                'orderName' => $order->product_name ?? 'Payment order #'.$order->id,
                'customerName' => $user->name,
                'bank' => $existingAccount['bank_code'],
                'accountType' => '고정',
                'accountKey' => $user->id,
            ];

            return $this->createTossVirtualAccount($tossPayload);
        });
    }

    /**
     * Generate unique transaction ID
     */
    public function generateTransactionId(): string
    {
        do {
            $transactionId = 'TXN-'.now()->format('YmdHis').'-'.strtoupper(Str::random(8));
        } while (PaymentTransaction::where('transaction_id', $transactionId)->exists());

        return $transactionId;
    }
}
