<?php

namespace App\Services\Notifications;

use App\Jobs\SendNotificationJob;
use Illuminate\Support\Facades\Log;

abstract class BaseNotificationService
{
    public function __construct(
        protected readonly AligoAlimTalkService $aligoAlimTalkService,
    ) {}

    protected function send(
        string $templateCode,
        string $receiver,
        array $variables = [],
        array $buttons = [],
        ?array $template = null,
        ?string $recvname = null,
        ?string $subject = null,
        ?string $sendDate = null,
    ): void {

        if (app()->environment('testing')) {
            Log::info('Notification skipped in test environment', ['template_code' => $templateCode]);

            return;
        }

        if (! app()->environment('production') && ! env('ALIGO_ENABLED_IN_DEV', false) && empty(config('services.aligo.api_key'))) {
            Log::info('Notification would be sent (non-production mode without Aligo credentials)', [
                'template_code' => $templateCode,
                'receiver' => $receiver,
            ]);

            return;
        }

        $template = $template ?? $this->aligoAlimTalkService->getTemplate($templateCode);
        $templateData = $template ?? null;

        if ($templateData === null) {
            throw new \RuntimeException(
                "Aligo template not found: {$templateCode}"
            );
        }

        $message = $this->replaceVariables(
            $templateData['templtContent'],
            $variables,
        );
        $buttons = $buttons ?? $templateData['buttons'] ?? [];

        SendNotificationJob::dispatch(
            templateCode: $templateCode,
            receiver: $receiver,
            message: $message,
            recvname: $recvname,
            subject: $subject,
            buttons: $buttons,
            sendDate: $sendDate,
        );

        Log::info('Aligo AlimTalk queued', [
            'template_code' => $templateCode,
            'receiver' => $receiver,
        ]);
    }

    private function replaceVariables(
        string $content,
        array $variables,
    ): string {
        return preg_replace_callback(
            '/#\{([^}]+)\}/',
            static function (array $matches) use ($variables): string {
                $key = $matches[1];

                return array_key_exists($key, $variables)
                    ? (string) $variables[$key]
                    : $matches[0];
            },
            $content,
        );
    }
}
