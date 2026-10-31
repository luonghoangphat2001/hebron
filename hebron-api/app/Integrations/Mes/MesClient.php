<?php

namespace App\Integrations\Mes;

use App\Enums\MesIntegrationDirection;
use App\Enums\MesIntegrationStatus;
use App\Enums\MesReferenceType;
use App\Enums\MesTriggerType;
use App\Services\MesIntegrationLogService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MesClient
{
    protected string $baseUrl;
    protected ?MesIntegrationLogService $logService = null;

    public function __construct()
    {
        $this->baseUrl = config('services.mes.base_url') ?: 'http://test-hebron.happyai.co.kr';
    }

    protected function getLogService(): MesIntegrationLogService
    {
        if ($this->logService === null) {
            $this->logService = new MesIntegrationLogService();
        }
        return $this->logService;
    }

    protected function post(
        string $endpoint,
        array $payload,
        ?int $referenceId,
        string $logContext,
        MesTriggerType $triggerType,
        MesReferenceType $referenceType = MesReferenceType::Order,
        MesIntegrationDirection $direction = MesIntegrationDirection::MallToMes,
    ): array {
        $startTime = microtime(true);

        $logData = [
            'direction' => $direction,
            'trigger_type' => $triggerType,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'http_method' => 'POST',
            'endpoint' => $endpoint,
            'request_headers' => [],
            'request_body' => $payload,
            'requested_at' => now(),
        ];

        try {
            $url = "{$this->baseUrl}/mes/project/api/{$endpoint}";
            $response = Http::timeout(30)->post($url, $payload);

            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            Log::info("MES {$logContext} request", [
                'reference_id' => $referenceId,
                'url' => $url,
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                $businessSucceeded = ($responseData['code'] ?? null) === 'success';

                $logData['response_status'] = $response->status();
                $responseHeaders = $response->headers();
                unset($responseHeaders['Content-Length']);
                $logData['response_headers'] = $responseHeaders;
                $logData['response_body'] = $responseData;
                $logData['status'] = $businessSucceeded
                    ? MesIntegrationStatus::Success
                    : MesIntegrationStatus::Failed;
                $logData['duration_ms'] = $durationMs;
                $logData['responded_at'] = now();
                if (! $businessSucceeded) {
                    $logData['error_message'] = $responseData['message'] ?? 'MES business response reported failure.';
                }

                $this->getLogService()->create($logData);

                return $responseData;
            }

            Log::warning("MES {$logContext} failed", [
                'reference_id' => $referenceId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $logData['response_status'] = $response->status();
            $logData['response_body'] = ['error' => $response->body()];
            $logData['status'] = MesIntegrationStatus::Failed;
            $logData['duration_ms'] = $durationMs;
            $logData['responded_at'] = now();

            $this->getLogService()->create($logData);

            return ['code' => $response->status(), 'message' => $response->body()];
        } catch (\Exception $e) {
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            Log::error("MES {$logContext} exception", [
                'reference_id' => $referenceId,
                'error' => $e->getMessage(),
            ]);

            $logData['response_status'] = 0;
            $logData['status'] = MesIntegrationStatus::Failed;
            $logData['duration_ms'] = $durationMs;
            $logData['error_message'] = $e->getMessage();
            $logData['responded_at'] = now();

            $this->getLogService()->create($logData);

            return ['code' => '500', 'message' => $e->getMessage()];
        }
    }
}
