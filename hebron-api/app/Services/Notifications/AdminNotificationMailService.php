<?php

namespace App\Services\Notifications;

use App\Mail\AdminDraftConfirmedMail;
use App\Mail\AdminDraftRevisionRequestedMail;
use App\Mail\AdminOrderReceivedMail;
use App\Models\DesignRevision;
use App\Models\EmailIntegrationLog;
use App\Models\EmailSetting;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminNotificationMailService
{
    /**
     * Send order received notification to administrators.
     */
    public function sendOrderReceivedNotification(Order $order): void
    {
        $recipients = EmailSetting::getOrCreate()->getEffectiveReceiverEmails();

        if (empty($recipients)) {
            Log::info('No admin notification email recipients configured for order received', [
                'order_number' => $order->order_number,
            ]);

            return;
        }

        try {
            Mail::to($recipients)->queue(new AdminOrderReceivedMail($order));
            EmailIntegrationLog::create([
                'order_number' => $order->order_number,
                'sender' => EmailSetting::getOrCreate()->getEffectiveSenderEmail(),
                'recipients' => $recipients,
                'subject' => "[Hebron] 신규 주문이 접수되었습니다. ({$order->order_number})",
                'status' => 'queued',
                'queued_at' => now(),
            ]);

            Log::info('Admin order received email queued', [
                'order_number' => $order->order_number,
                'recipients' => $recipients,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to queue admin order received email', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send draft revision requested notification to administrators.
     */
    public function sendDraftRevisionRequestedNotification(Order $order, DesignRevision $revision, ?string $comment = null): void
    {
        $recipients = EmailSetting::getOrCreate()->getEffectiveReceiverEmails();

        if (empty($recipients)) {
            Log::info('No admin notification email recipients configured for draft revision request', [
                'order_number' => $order->order_number,
            ]);

            return;
        }

        try {
            Mail::to($recipients)->queue(new AdminDraftRevisionRequestedMail($order, $revision, $comment));
            EmailIntegrationLog::create([
                'order_number' => $order->order_number,
                'sender' => EmailSetting::getOrCreate()->getEffectiveSenderEmail(),
                'recipients' => $recipients,
                'subject' => "[Hebron] 시안 수정 요청이 접수되었습니다. ({$order->order_number})",
                'status' => 'queued',
                'queued_at' => now(),
            ]);

            Log::info('Admin draft revision requested email queued', [
                'order_number' => $order->order_number,
                'recipients' => $recipients,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to queue admin draft revision requested email', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send draft confirmed notification to administrators.
     */
    public function sendDraftConfirmedNotification(Order $order, DesignRevision $revision): void
    {
        $recipients = EmailSetting::getOrCreate()->getEffectiveReceiverEmails();

        if (empty($recipients)) {
            Log::info('No admin notification email recipients configured for draft confirmed', [
                'order_number' => $order->order_number,
            ]);

            return;
        }

        try {
            Mail::to($recipients)->queue(new AdminDraftConfirmedMail($order, $revision));
            EmailIntegrationLog::create([
                'order_number' => $order->order_number,
                'sender' => EmailSetting::getOrCreate()->getEffectiveSenderEmail(),
                'recipients' => $recipients,
                'subject' => "[Hebron] 고객 시안 확정이 완료되었습니다. ({$order->order_number})",
                'status' => 'queued',
                'queued_at' => now(),
            ]);

            Log::info('Admin draft confirmed email queued', [
                'order_number' => $order->order_number,
                'recipients' => $recipients,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to queue admin draft confirmed email', [
                'order_number' => $order->order_number,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
