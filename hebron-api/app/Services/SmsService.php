<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class SmsService
{
    protected string $baseUrl = 'https://apis.aligo.in';

    public function send(string $to, string $message): bool
    {
        try {
            $to = $this->normalizePhoneNumber($to);

            if (app()->environment(['local', 'testing'])) {
                Log::info('SMS would be sent (local/testing mode)', [
                    'to' => $to,
                    'message' => $message,
                    'environment' => app()->environment(),
                ]);

                return true;
            }

            if (! config('services.aligo.sms_enabled', false)) {
                Log::info('SMS sending is disabled by ALIGO_SMS_ENABLED', [
                    'to' => $to,
                    'environment' => app()->environment(),
                ]);

                return true;
            }

            $senderNumber = config('services.aligo.sender_number');

            if (empty($senderNumber)) {
                throw new \Exception(
                    'Aligo sender number not configured. Please set ALIGO_SENDER_NUMBER in .env'
                );
            }

            return $this->sendViaAligo(
                $to,
                $senderNumber,
                $message
            );
        } catch (Throwable $e) {
            Log::error('SMS service error', [
                'to' => $to ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    protected function sendViaAligo(
        string $to,
        string $from,
        string $text
    ): bool {
        try {
            $response = Http::asForm()->post(
                $this->baseUrl . '/send/',
                [
                    'key' => config('services.aligo.api_key'),
                    'user_id' => config('services.aligo.user_id'),
                    'sender' => $from,
                    'receiver' => $to,
                    'msg' => $text,
                    'msg_type' => 'SMS',
                    'testmode_yn' => config('services.aligo.test_mode')
                        ? 'Y'
                        : 'N',
                ]
            );
            
            if ($response->failed()) {
                Log::error('Aligo API HTTP error', [
                    'to' => $to,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                return false;
            }

            $data = $response->json();

            /*
             * Aligo:
             * result_code >= 0 => success
             * result_code < 0  => error
             */
            if (($data['result_code'] ?? -1) < 0) {
                Log::error('Aligo SMS sending failed', [
                    'to' => $to,
                    'response' => $data,
                ]);

                return false;
            }

            Log::info('SMS sent successfully via Aligo', [
                'to' => $to,
                'from' => $from,
                'response' => $data,
            ]);

            return true;
        } catch (Throwable $e) {
            Log::error('Aligo SMS service error', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function sendVerificationCode(
        string $phoneNumber,
        string $code
    ): bool {
        $message = "인증번호: {$code}\n유효기간: 10분";

        return $this->send($phoneNumber, $message);
    }

    protected function normalizePhoneNumber(string $phoneNumber): string
    {
        $cleaned = preg_replace('/[^\d+]/', '', $phoneNumber);

        if (! str_starts_with($cleaned, '+')) {
            if (str_starts_with($cleaned, '0')) {
                $cleaned = '+82' . substr($cleaned, 1);
            } else {
                $cleaned = '+82' . $cleaned;
            }
        }

        if (str_starts_with($cleaned, '+82')) {
            $cleaned = '0' . substr($cleaned, 3);
        }

        return $cleaned;
    }
}
