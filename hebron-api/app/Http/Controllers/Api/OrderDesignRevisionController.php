<?php

namespace App\Http\Controllers\Api;

use App\Enums\DesignRevisionStatus;
use App\Enums\OrderStatus;
use App\Http\Resources\DesignRevisionResource;
use App\Jobs\ConfirmDesignToMesJob;
use App\Models\DesignRevision;
use App\Services\Notifications\AdminNotificationMailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderDesignRevisionController extends BaseController
{
    public function get(string $slug): JsonResponse
    {
        $revision = DesignRevision::with('order.items')->where('slug', $slug)->firstOrFail();

        $isLatest = DesignRevision::where('order_id', $revision->order_id)
            ->where('id', '>', $revision->id)
            ->exists();

        if ($isLatest) {
            return $this->responseError(422, '최신 디자인 수정 요청이 아닙니다.');
        }

        return $this->responseSuccess(200, '디자인 수정 요청 상세 조회 성공.', [
            'design_revision' => new DesignRevisionResource($revision),
        ]);
    }

    public function action(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:modify,approve',
            'comment' => 'nullable|string',
        ]);

        $revision = DesignRevision::with([
            'order.latestDesignRevision',
        ])
            ->where('slug', $slug)
            ->firstOrFail();

        $order = $revision->order;

        // Check latest revision
        if ($order->latestDesignRevision?->id !== $revision->id) {
            return $this->responseError(
                422,
                '최신 설문 수정 요청이 아닙니다.'
            );
        }

        // Check revision status
        if ($revision->status !== DesignRevisionStatus::Pending) {
            return $this->responseError(
                422,
                '이미 처리된 요청입니다.'
            );
        }

        // Check order status
        if (! in_array($order->status, [
            OrderStatus::Confirmed->value,
            OrderStatus::PendingReception->value,
            OrderStatus::FileError->value,
            OrderStatus::PendingCorrection->value,
            OrderStatus::DesignConfirmationRequested->value,
        ], true)) {
            return $this->responseError(
                400,
                '이미 교정 확인이 완료된 주문 항목입니다.'
            );
        }

        $revisionStatus = $validated['status'] === 'approve'
            ? DesignRevisionStatus::Approve
            : DesignRevisionStatus::Modify;

        $comments = $revision->comments ?? [];

        if (! empty($validated['comment'])) {
            $comments[] = $validated['comment'];
        }

        DB::transaction(function () use (
            $revision,
            $order,
            $revisionStatus,
            $comments,
            $validated
        ) {
            $revision->update([
                'status' => $revisionStatus,
                'comments' => $comments,
            ]);

            $orderStatus = OrderStatus::DesignRejected->value;

            if ($validated['status'] === 'approve') {
                $orderStatus = OrderStatus::DesignConfirmed->value;
            }

            $order->update([
                'status' => $orderStatus,
                'metadata' => array_merge($order->metadata ?? [], [
                    'proof_status' => $validated['status'] === 'approve' ? 'confirmed' : 'revision_requested',
                    'proof_confirmed_at' => $validated['status'] === 'approve' ? now()->toIso8601String() : null,
                ]),
            ]);
        });

        if ($validated['status'] === 'approve') {
            ConfirmDesignToMesJob::dispatch($order);

            try {
                app(AdminNotificationMailService::class)
                    ->sendDraftConfirmedNotification($order, $revision);
            } catch (\Throwable $e) {
                Log::error('Failed to send admin draft confirmed notification', [
                    'order_number' => $order->order_number,
                    'error' => $e->getMessage(),
                ]);
            }
        } else {
            try {
                app(AdminNotificationMailService::class)
                    ->sendDraftRevisionRequestedNotification($order, $revision, $validated['comment'] ?? null);
            } catch (\Throwable $e) {
                Log::error('Failed to send admin draft revision requested notification', [
                    'order_number' => $order->order_number,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $this->responseSuccess(
            200,
            '요청이 성공적으로 처리되었습니다.',
            [
                'design_revision' => new DesignRevisionResource(
                    $revision->fresh()
                ),
            ]
        );
    }
}
