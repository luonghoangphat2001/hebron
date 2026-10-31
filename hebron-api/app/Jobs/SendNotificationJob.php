<?php

namespace App\Jobs;

use App\Enums\NotificationChannel;
use App\Models\NotificationHistory;
use App\Models\NotificationTemplate;
use App\Services\Notifications\AligoAlimTalkService;
use App\Services\Notifications\AlimtalkService;
use App\Services\Notifications\TeamsWebhookService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendNotificationJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 10;

    public function __construct(
        private readonly string $templateCode,
        private readonly string $receiver,
        private readonly string $message,
        private readonly ?string $recvname = null,
        private readonly ?string $subject = null,
        private readonly array $buttons = [],
        private readonly ?string $sendDate = null,
    ) {}

    public function handle(AligoAlimTalkService $aligoAlimTalkService): void
    {
        try {
            $response = $aligoAlimTalkService->sendOne(
                $this->templateCode,
                $this->receiver,
                $this->message,
                $this->recvname,
                $this->subject,
                $this->buttons,
                $this->sendDate,
            );

            Log::info('Aligo AlimTalk sent successfully', [
                'template_code' => $this->templateCode,
                'receiver' => $this->receiver,
                'response_code' => $response['code'] ?? null,
            ]);
        } catch (\Throwable $e) {
            Log::error('Aligo AlimTalk sending failed', [
                'template_code' => $this->templateCode,
                'receiver' => $this->receiver,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('Aligo AlimTalk job failed after retries', [
            'template_code' => $this->templateCode,
            'receiver' => $this->receiver,
            'error' => $e->getMessage(),
        ]);
    }
}
