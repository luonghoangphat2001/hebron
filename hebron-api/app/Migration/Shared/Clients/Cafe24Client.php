<?php

namespace App\Migration\Shared\Clients;

use App\Migration\Shared\Exceptions\Cafe24ApiException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class Cafe24Client
{
    protected string $token;

    protected string $baseUrl;

    protected int $timeout;

    protected int $retryTimes;

    protected int $retrySleepMs;

    public function __construct()
    {
        $this->token = (string) config('migration.cafe24.token', '');
        $this->baseUrl = rtrim((string) config('migration.cafe24.base_url'), '/');
        $this->timeout = (int) config('migration.cafe24.timeout', 30);
        $this->retryTimes = (int) config('migration.cafe24.retry_times', 3);
        $this->retrySleepMs = (int) config('migration.cafe24.retry_sleep_ms', 500);

        if ($this->token === '' || $this->baseUrl === '') {
            throw new Cafe24ApiException(
                'Cafe24 client is not configured. Set HEBRON21_TOKEN and HEBRON21_BASE_URL.'
            );
        }
    }

    protected function client(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl)
            ->withToken($this->token)
            ->acceptJson()
            ->contentType('application/json')
            ->timeout($this->timeout)
            ->retry(
                $this->retryTimes,
                $this->retrySleepMs,
                throw: false,
            );
    }

    public function get(string $endpoint, array $query = []): array
    {
        $response = $this->client()->get($endpoint, $query);

        return $this->handle($endpoint, $response);
    }

    public function getBoardCategories(int $boardNo): array
    {
        $categories = $this->get("/admin/boards/{$boardNo}")['board']['categories'] ?? [];

        return collect($categories)->map(function (mixed $category, int|string $index): ?array {
            if (is_string($category)) {
                return [
                    'board_category_no' => is_numeric($index) ? (int) $index + 1 : 0,
                    'name' => $category,
                ];
            }

            if (! is_array($category)) {
                return null;
            }

            return [
                'board_category_no' => (int) ($category['board_category_no'] ?? $category['category_no'] ?? $category['id'] ?? $category['no'] ?? 0),
                'name' => (string) ($category['category_name'] ?? $category['name'] ?? ''),
            ];
        })->filter(fn (?array $category): bool => $category
            && $category['board_category_no'] > 0
            && $category['name'] !== '')
            ->values()->all();
    }

    protected function handle(string $endpoint, Response $response): array
    {
        if ($response->failed()) {
            Log::error('Cafe24 API request failed', [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            throw Cafe24ApiException::fromResponse(
                $endpoint,
                $response->status(),
                $response->json(),
            );
        }

        $json = $response->json();

        if (! is_array($json)) {
            throw new Cafe24ApiException(
                sprintf('Cafe24 API returned non-array body on %s', $endpoint),
                $response->status(),
                $endpoint,
            );
        }

        try {
            return $json;
        } catch (Throwable $e) {
            throw new Cafe24ApiException(
                sprintf('Failed to decode Cafe24 API response on %s: %s', $endpoint, $e->getMessage()),
                $response->status(),
                $endpoint,
                null,
                $e,
            );
        }
    }
}
