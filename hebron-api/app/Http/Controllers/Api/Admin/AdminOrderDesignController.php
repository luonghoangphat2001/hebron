<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Api\BaseController;
use App\Models\DesignGroup;
use App\Models\Order;
use App\Models\OrderDesignFile;
use App\Services\SmsService;
use App\Support\FileStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminOrderDesignController extends BaseController
{
    public function __construct(
        protected SmsService $smsService,
    ) {}

    /**
     * Get design file info for an order (cyan file management).
     */
    public function show(string $orderNumber): JsonResponse
    {
        try {
            $order = Order::with(['designFiles', 'user'])
                ->where('order_number', $orderNumber)
                ->firstOrFail();

            return $this->responseSuccess(200, '디자인 파일 정보가 성공적으로 조회되었습니다.', [
                'order_number' => $order->order_number,
                'status' => $order->status,
                'design_files' => $this->formatOrderFiles($order),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Admin uploads a revised design file for an order artwork.
     * On upload: order status → design_confirmation_requested, SMS/KakaoTalk sent to customer.
     */
    public function uploadRevisedFile(Request $request, string $orderNumber): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,ai,jpg,jpeg,png|max:51200',
        ]);

        try {
            $order = Order::with(['designFiles', 'user'])
                ->where('order_number', $orderNumber)
                ->firstOrFail();

            DB::transaction(function () use ($request, $order) {
                $file = $request->file('file');
                $path = $file->store('orders/revised-designs/'.$order->order_number, config('filesystems.public_disk'));
                $fileName = $file->getClientOriginalName();

                // Files belong to the order, so every upload appends to its array.
                OrderDesignFile::insert([
                    'order_id' => $order->id,
                    'file_path' => $path,
                    'file_name' => $fileName,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $order->update(['status' => OrderStatus::DesignConfirmationRequested->value]);
            });

            $this->sendDesignConfirmationNotification($order);

            $order->refresh()->load('designFiles');

            return $this->responseSuccess(200, '디자인 교정 파일 업로드 완료. 고객에게 확인 요청 알림을 발송했습니다.', [
                'order_number' => $order->order_number,
                'status' => $order->status,
                'design_files' => $this->formatOrderFiles($order),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get rejection reason recorded by customer (admin reads it here).
     */
    public function getRejectionReason(string $orderNumber): JsonResponse
    {
        try {
            $order = Order::with(['items.designGroup'])
                ->where('order_number', $orderNumber)
                ->firstOrFail();

            $designGroups = $order->items->pluck('designGroup')->filter()->unique('id')->values();

            $rejected = $designGroups
                ->whereNotNull('rejection_reason')
                ->values()
                ->map(fn (DesignGroup $group) => [
                    'design_group_id' => $group->id,
                    'design_title' => $group->title,
                    'rejection_reason' => $group->rejection_reason,
                    'rejected_at' => $group->rejected_at?->format('Y-m-d H:i:s'),
                ]);

            return $this->responseSuccess(200, '디자인 반려 사유 조회 성공', [
                'order_number' => $order->order_number,
                'status' => $order->status,
                'rejected_artworks' => $rejected,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    private function formatOrderFiles(Order $order): array
    {
        return $order->designFiles->map(fn (OrderDesignFile $file) => [
            'id' => $file->id,
            'file_name' => $file->file_name,
            'file_url' => FileStorage::publicUrl($file->file_path),
            'created_at' => $file->created_at?->format('Y-m-d H:i:s'),
        ])->values()->all();
    }

    private function sendDesignConfirmationNotification(Order $order): void
    {
        $phone = $order->user?->mobile ?? $order->contact_phone;

        if (! $phone) {
            Log::warning('Design confirmation: no phone for order', ['order_number' => $order->order_number]);

            return;
        }

        try {
            $message = sprintf(
                '[주문번호: %s] 디자인 교정 파일이 업로드되었습니다. 확인 후 승인 또는 반려해 주세요.',
                $order->order_number
            );
            $this->smsService->send($phone, $message);
        } catch (\Throwable $e) {
            Log::error('Design confirmation SMS failed', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
