<?php

namespace App\Integrations\SweetTracker;

use Illuminate\Support\Facades\Http;

class SweetTrackerClient
{
    /** @return array<int, array<string, mixed>> */
    public function companies(): array
    {
        $payload = Http::baseUrl(rtrim((string) config('services.sweettracker.info_base_url'), '/'))
            ->timeout((int) config('services.sweettracker.timeout', 15))
            ->acceptJson()
            ->get((string) config('services.sweettracker.company_list_path', '/api/v1/companylist'), [
                't_key' => config('services.sweettracker.api_key'),
            ])->throw()->json();

        $rows = $payload['companies'] ?? $payload['data'] ?? $payload;
        return is_array($rows) ? array_values(array_filter($rows, 'is_array')) : [];
    }

    /** @return array<string, mixed> */
    public function register(string $carrierCode, string $invoiceNumber, ?string $fid = null): array
    {
        $baseUrl = $this->requiredConfig('trace_base_url');
        $tier = $this->requiredConfig('tier');
        $key = $this->requiredConfig('key');

        return Http::baseUrl(rtrim($baseUrl, '/'))
            ->timeout((int) config('services.sweettracker.timeout', 15))
            ->acceptJson()
            ->asForm()
            ->post((string) config('services.sweettracker.register_path', '/add_invoice'), [
                'num' => $invoiceNumber,
                'code' => $carrierCode,
                'fid' => $fid ?: 'shipment-'.$invoiceNumber,
                'callback_url' => rtrim((string) config('app.url'), '/').config('services.sweettracker.webhook_path'),
                'callback_type' => 'json',
                'tier' => $tier,
                'key' => $key,
                'type' => 'json',
            ])->throw()->json();
    }

    /** @return array<string, mixed> */
    public function trackingInfo(string $carrierCode, string $invoiceNumber): array
    {
        $key = trim((string) config('services.sweettracker.api_key'));
        if ($key === '') {
            throw new RuntimeException('SweetTracker tracking API is not configured.');
        }

        $payload = Http::baseUrl(rtrim((string) config('services.sweettracker.info_base_url'), '/'))
            ->timeout((int) config('services.sweettracker.timeout', 15))
            ->acceptJson()
            ->get((string) config('services.sweettracker.tracking_info_path', '/api/v1/trackingInfo'), [
                't_key' => $key,
                't_code' => $carrierCode,
                't_invoice' => $invoiceNumber,
            ])->throw()->json();

        return is_array($payload) ? $payload : [];
    }

    private function requiredConfig(string $key): string
    {
        $value = trim((string) config('services.sweettracker.'.$key));

        if ($value === '') {
            throw new \RuntimeException('SweetTracker trace API is not configured.');
        }

        return $value;
    }
}
