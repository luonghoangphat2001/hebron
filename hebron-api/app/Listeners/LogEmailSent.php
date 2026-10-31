<?php

namespace App\Listeners;

use App\Models\EmailIntegrationLog;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\Log;

class LogEmailSent
{
    public function handle(MessageSent $event): void
    {
        $message = $event->message;
        $subject = (string) $message->getSubject();
        preg_match('/\(([^)]+)\)\s*$/u', $subject, $matches);
        $recipients = collect($message->getTo())->map(fn ($address) => $address->getAddress())->values()->all();
        $sender = collect($message->getFrom())->map(fn ($address) => $address->getAddress())->first();

        EmailIntegrationLog::create([
            'order_number' => $matches[1] ?? null,
            'sender' => $sender,
            'recipients' => $recipients,
            'subject' => $subject,
            'status' => 'sent',
            'message_id' => $event->sent->getMessageId(),
            'sent_at' => now(),
        ]);

        Log::info('Email sent successfully', [
            'subject' => $subject,
            'sender' => $sender,
            'recipients' => $recipients,
            'message_id' => $event->sent->getMessageId(),
        ]);
    }
}
