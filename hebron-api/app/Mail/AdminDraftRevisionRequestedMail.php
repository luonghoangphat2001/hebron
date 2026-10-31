<?php

namespace App\Mail;

use App\Models\DesignRevision;
use App\Models\EmailSetting;
use App\Models\EmailIntegrationLog;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminDraftRevisionRequestedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public DesignRevision $revision,
        public ?string $comment = null,
    ) {}

    public function envelope(): Envelope
    {
        $setting = EmailSetting::getOrCreate();

        return new Envelope(
            from: new Address(
                $setting->getEffectiveSenderEmail(),
                $setting->getEffectiveSenderName(),
            ),
            subject: "[Hebron] 시안 수정 요청이 접수되었습니다. ({$this->order->order_number})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.draft-revision-requested',
        );
    }

    public function attachments(): array
    {
        return [];
    }

    public function failed(\Throwable $e): void
    {
        EmailIntegrationLog::create([
            'order_number' => $this->order->order_number,
            'sender' => EmailSetting::getOrCreate()->getEffectiveSenderEmail(),
            'recipients' => EmailSetting::getOrCreate()->getEffectiveReceiverEmails(),
            'subject' => "[Hebron] 시안 수정 요청이 접수되었습니다. ({$this->order->order_number})",
            'status' => 'failed',
            'error_message' => $e->getMessage(),
            'failed_at' => now(),
        ]);
        \Log::error('Email job failed after retries', [
            'order_number' => $this->order->order_number,
            'error' => $e->getMessage(),
        ]);
    }
}
