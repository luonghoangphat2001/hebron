<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\DesignRevisionStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\Admin\DesignRevisionResource;
use App\Models\DesignRevision;
use App\Models\Order;
use App\Services\Notifications\OrderNotificationService;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminOrderDesignRevisionController extends BaseController
{
    public function __construct(
        protected SmsService $smsService,
        protected OrderNotificationService $notificationService,
    ) {}

    public function index(string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $revisions = $order->designRevisions()->latest()->get();

        return $this->responseSuccess(200, '디자인 수정 요청 목록이 조회되었습니다.', [
            'design_revisions' => DesignRevisionResource::collection($revisions),
        ]);
    }

    public function store(Request $request, string $orderNumber): JsonResponse
    {
        $request->validate([
            'files' => ['required', 'array', 'min:1'],
            'files.*.url' => ['required', 'url'],
            'files.*.name' => ['required', 'string', 'max:255'],
            'files.*.size' => ['required', 'integer', 'min:0'],
        ]);

        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if (! in_array($order->status, [OrderStatus::Pending->value, OrderStatus::AwaitingPayment->value,
            OrderStatus::Confirmed->value, OrderStatus::PendingReception->value,
            OrderStatus::FileError->value, OrderStatus::PendingCorrection->value,
            OrderStatus::DesignRejected->value, OrderStatus::DesignConfirmationRequested->value], true)) {
            return $this->responseError(422, '현재 주문 단계에서는 시안을 등록할 수 없습니다.');
        }

        $lastRevision = $order->designRevisions()->latest('id')->first();

        if ($lastRevision !== null && $lastRevision->status !== DesignRevisionStatus::Modify) {
            return $this->responseError(422, '마지막 디자인 수정 요청 상태가 modify가 아닙니다.');
        }

        $slug = $this->generateUniqueSlug($order);

        $revision = DB::transaction(function () use ($order, $slug, $request) {
            $revision = $order->designRevisions()->create([
                'slug' => $slug,
                'status' => DesignRevisionStatus::Pending,
                'files' => $request->input('files'),
                'comments' => [],
            ]);
            $metadata = $order->metadata ?? [];
            $metadata['proof_status'] = 'confirmation_requested';
            $metadata['proof_confirmed_at'] = null;
            $order->update([
                'status' => OrderStatus::DesignConfirmationRequested->value,
                'metadata' => $metadata,
            ]);

            return $revision;
        });

        $this->sendRevisionNotification($order, $revision);

        return $this->responseSuccess(201, '디자인 수정 요청이 생성되었습니다.', [
            'design_revision' => new DesignRevisionResource($revision),
        ]);
    }

    private function generateUniqueSlug(Order $order): string
    {
        do {
            $timestamp = now()->format('YmdHis');
            $random = Str::random(6);
            $slug = "rev-{$order->order_number}-{$timestamp}-{$random}";
        } while (DesignRevision::where('slug', $slug)->exists());

        return $slug;
    }

    private function sendRevisionNotification(
        Order $order,
        DesignRevision $revision
    ): void {
        try {
            $baseUrl = config('app.frontend_url', env('FRONTEND_URL', config('app.url')));
            $url = rtrim($baseUrl, '/')
                .'/confirm-design/'
                .$revision->slug;

            $this->notificationService->sendDesignConfirm(
                order: $order,
                url: $url,
            );
        } catch (\Throwable $e) {
            \Log::error('Design revision notification failed', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
