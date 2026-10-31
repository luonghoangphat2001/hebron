<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentMethod;
use App\Exceptions\TossPaymentSessionExpiredException;
use App\Http\Requests\Payment\InitiatePaymentRequest;
use App\Http\Requests\Payment\PayVirtualAccountRequest;
use App\Http\Requests\Payment\TossConfirmRequest;
use App\Http\Requests\Payment\WebhookDepositCallbackRequest;
use App\Http\Requests\Payment\WebhookRequest;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\PaymentService;
use App\Support\GuestCommerceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends BaseController
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    private function canAccessOrder(Request $request, Order $order): bool
    {
        $user = $request->user();
        if ($user) {
            return $order->user_id === $user->id;
        }

        $guestTokenHash = GuestCommerceToken::hash(GuestCommerceToken::fromRequest($request));

        return $order->user_id === null
            && $guestTokenHash !== null
            && $order->guest_token_hash !== null
            && hash_equals($order->guest_token_hash, $guestTokenHash);
    }

    private function unauthorizedOrderResponse(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized to access this order.',
        ], 403);
    }

    /**
     * List payment methods for order form (결제 수단 목록)
     * GET /api/payment-methods
     */
    public function methods(Request $request): JsonResponse
    {
        $allowedMethods = PaymentMethod::allowedForDisplay();

        $paymentMethods = array_map(function (PaymentMethod $method) {
            return [
                'code' => $method->value,
                'label' => $method->label(),
                'available' => true,
                'requires_redirect' => $method->requiresImmediateVerification(),
            ];
        }, $allowedMethods);

        return response()->json([
            'success' => true,
            'data' => [
                'payment_methods' => $paymentMethods,
            ],
        ]);
    }

    /**
     * Initiate payment for an order
     */
    public function initiate(InitiatePaymentRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            // Find order
            $order = Order::where('order_number', $validated['order_number'])->first();

            if (! $order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found.',
                ], 404);
            }

            if (! $this->canAccessOrder($request, $order)) {
                return $this->unauthorizedOrderResponse();
            }

            $additionalData = [
                'bank_account_holder' => $validated['bank_account_holder'] ?? null,
                'metadata' => $validated['metadata'] ?? null,
            ];

            $transaction = $this->paymentService->initiatePayment(
                $order,
                $validated['payment_method'],
                $additionalData
            );

            return response()->json([
                'success' => true,
                'message' => 'Payment initiated successfully.',
                'data' => [
                    'transaction_id' => $transaction->transaction_id,
                    'payment_method' => $transaction->payment_method,
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    // Add PG-specific data here (e.g., redirect URL for card payment)
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Verify payment (for manual confirmation or after PG redirect)
     */
    public function verify(Request $request, string $transactionId): JsonResponse
    {
        try {
            $transaction = PaymentTransaction::with('order')
                ->where('transaction_id', $transactionId)
                ->first();

            if (! $transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment transaction not found.',
                ], 404);
            }

            if (! $this->canAccessOrder($request, $transaction->order)) {
                return $this->unauthorizedOrderResponse();
            }

            $verificationData = $request->all();

            $transaction = $this->paymentService->verifyPayment($transactionId, $verificationData);

            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully.',
                'data' => [
                    'transaction_id' => $transaction->transaction_id,
                    'status' => $transaction->status,
                    'paid_at' => $transaction->paid_at,
                    'order' => [
                        'order_number' => $transaction->order->order_number,
                        'status' => $transaction->order->status,
                        'payment_status' => $transaction->order->payment_status,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Handle payment webhook from PG
     */
    public function webhook(WebhookRequest $request): JsonResponse
    {
        try {
            $webhookData = $request->validated();

            $transaction = $this->paymentService->handleTossWebhook($webhookData);

            return response()->json([
                'success' => true,
                'message' => 'Webhook processed successfully.',
                'data' => [
                    'transaction_id' => $transaction->transaction_id,
                    'status' => $transaction->status,
                    'order' => [
                        'order_number' => $transaction->order->order_number,
                        'status' => $transaction->order->status,
                        'payment_status' => $transaction->order->payment_status,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            Log::warning('Toss payment webhook rejected', [
                'error' => $e->getMessage(),
                'event_type' => $request->input('eventType'),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function depositCallback(WebhookDepositCallbackRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $this->paymentService->handleDepositCallback($validated);

            return response()->json(['success' => true, 'message' => 'Deposit callback processed'], 200);
        } catch (\Exception $e) {
            Log::error('Deposit callback error: '.$e->getMessage(), [
                'webhook_data' => $request->all(),
                'stack' => $e->getTraceAsString(),
            ]);

            return response()->json(['success' => false, 'message' => $e->getMessage()], 200);
        }
    }

    /**
     * Confirm Toss payment after frontend receives success redirect.
     */
    public function confirmToss(TossConfirmRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $order = Order::where('order_number', $validated['orderNumber'])->firstOrFail();

            if (! $this->canAccessOrder($request, $order)) {
                return $this->unauthorizedOrderResponse();
            }

            $transaction = $this->paymentService->confirmTossPayment($validated);

            return response()->json([
                'success' => true,
                'message' => 'Toss payment confirmed successfully.',
                'data' => [
                    'transaction_id' => $transaction->transaction_id,
                    'status' => $transaction->status,
                    'order' => [
                        'order_number' => $transaction->order->order_number,
                        'status' => $transaction->order->status,
                        'payment_status' => $transaction->order->payment_status,
                    ],
                ],
            ]);
        } catch (TossPaymentSessionExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'code' => $e->getTossCode(),
            ], $e->getCode() ?: 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Cancel payment
     */
    public function cancel(Request $request, string $transactionId): JsonResponse
    {
        try {
            $existingTransaction = PaymentTransaction::with('order')
                ->where('transaction_id', $transactionId)
                ->firstOrFail();

            if (! $this->canAccessOrder($request, $existingTransaction->order)) {
                return $this->unauthorizedOrderResponse();
            }

            $reason = $request->input('reason');

            $transaction = $this->paymentService->cancelPayment($transactionId, $reason);

            return response()->json([
                'success' => true,
                'message' => 'Payment cancelled successfully.',
                'data' => [
                    'transaction_id' => $transaction->transaction_id,
                    'status' => $transaction->status,
                    'order' => [
                        'order_number' => $transaction->order->order_number,
                        'status' => $transaction->order->status,
                        'payment_status' => $transaction->order->payment_status,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Request refund
     */
    public function refund(Request $request, string $transactionId): JsonResponse
    {
        try {
            $existingTransaction = PaymentTransaction::with('order')
                ->where('transaction_id', $transactionId)
                ->firstOrFail();

            if (! $this->canAccessOrder($request, $existingTransaction->order)) {
                return $this->unauthorizedOrderResponse();
            }

            $validated = $request->validate([
                'reason' => 'required|string|max:500',
                'amount' => 'nullable|numeric|min:0',
            ]);

            $transaction = $this->paymentService->requestRefund(
                $transactionId,
                $validated['reason'],
                $validated['amount'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Refund requested successfully.',
                'data' => [
                    'transaction_id' => $transaction->transaction_id,
                    'status' => $transaction->status,
                    'refunded_at' => $transaction->refunded_at,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get payment transaction details
     */
    public function show(Request $request, string $transactionId): JsonResponse
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)
                ->orWhere('pg_transaction_id', $transactionId)
                ->with('order')
                ->first();

            if (! $transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment transaction not found.',
                ], 404);
            }

            if (! $this->canAccessOrder($request, $transaction->order)) {
                return $this->unauthorizedOrderResponse();
            }

            $cardDetails = $this->paymentService->getCardDetails($transaction);

            return response()->json([
                'success' => true,
                'data' => [
                    'transaction' => [
                        'id' => $transaction->id,
                        'transaction_id' => $transaction->transaction_id,
                        'payment_key' => $transaction->pg_transaction_id,
                        'order_number' => $transaction->order?->order_number,
                        'payment_method' => $transaction->payment_method,
                        'status' => $transaction->status,
                        'amount' => $transaction->amount,
                        'currency' => $transaction->currency,
                        'paid_at' => $transaction->paid_at,
                        'failed_at' => $transaction->failed_at,
                        'refunded_at' => $transaction->refunded_at,
                        'created_at' => $transaction->created_at,
                        'card' => $cardDetails,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Pay by virtual account (wallet-based)
     *
     * 1. Validate Order
     * 2. Get Wallet
     * 3. Check Balance
     * 4. Check Order Already Paid
     * 5. Deduct Wallet Balance
     * 6. Create WalletTransaction
     * 7. Create PaymentTransaction
     * 8. Update Order Status
     */
    public function payByVirtualAccount(PayVirtualAccountRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $order = Order::where('order_number', $request['order_number'])->first();

            if (! $order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found.',
                ], 404);
            }

            $user = $request->user();
            if ($user && $order->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to access this order.',
                ], 403);
            }

            $transaction = $this->paymentService->payByVirtualAccount($validated);

            return response()->json([
                'success' => true,
                'message' => '결제가 완료되었습니다.',
                'data' => [
                    'transaction_id' => $transaction->transaction_id,
                    'payment_method' => $transaction->payment_method,
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'order' => [
                        'order_number' => $transaction->order->order_number,
                        'payment_status' => $transaction->order->payment_status,
                    ],
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    protected function resolveStatusCode(\Throwable $e): int
    {
        return $e->getCode() >= 400 && $e->getCode() < 600 ? (int) $e->getCode() : 422;
    }
}
