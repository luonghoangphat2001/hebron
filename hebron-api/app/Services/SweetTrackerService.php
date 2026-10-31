<?php

namespace App\Services;

use App\Enums\OrderShipmentStatus;
use App\Enums\OrderStatus;
use App\Integrations\SweetTracker\SweetTrackerClient;
use App\Models\OrderShipment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SweetTrackerService
{
    public function __construct(private SweetTrackerClient $client) {}

    /** @return array<string, mixed> */
    public function register(OrderShipment $shipment): array
    {
        if (! $shipment->invoice_number || ! $shipment->carrier_code
            || ! config('services.sweettracker.trace_base_url')
            || ! config('services.sweettracker.tier')
            || ! config('services.sweettracker.key')) {
            return [];
        }

        $response = $this->client->register($shipment->carrier_code, $shipment->invoice_number, 'shipment-'.$shipment->id);
        if (($response['status'] ?? true) === false) {
            throw new \RuntimeException('SweetTracker rejected the shipment registration.', 422);
        }

        return $response;
    }

    /** @return array<string, mixed> */
    public function trackingInfo(string $carrierCode, string $invoiceNumber): array
    {
        return $this->client->trackingInfo($carrierCode, $invoiceNumber);
    }

    /** @param array<string, mixed> $payload @return array<int, array<string, mixed>> */
    public function normalizeTrackingResponse(array $payload): array
    {
        $rows = $payload['trackingDetails'] ?? $payload['tracking_details'] ?? [];
        if (! is_array($rows)) {
            return [];
        }

        $rootLevel = $this->parseLevel($payload['level'] ?? null);

        return array_values(array_filter(array_map(
            fn ($row) => is_array($row)
                ? array_merge($this->normalizeEvent($row, $rootLevel), ['payload' => $row, 'response' => $payload])
                : null,
            $rows
        )));
    }

    /** @param array<string, mixed> $payload */
    public function trackingLevel(array $payload): ?int
    {
        return $this->parseLevel($payload['level'] ?? null);
    }

    /** @param array<string, mixed> $payload */
    public function normalize(array $payload): array
    {
        return array_merge($this->normalizeEvent($payload), [
            'invoice_number' => (string) ($payload['invoiceNo'] ?? $payload['invoice_number'] ?? $payload['invoice'] ?? ''),
            'carrier_code' => $payload['companyCode'] ?? $payload['carrier_code'] ?? $payload['t_code'] ?? null,
        ]);
    }

    /** @param array<int, array<string, mixed>> $events */
    public function persist(OrderShipment $shipment, array $events, ?int $trackingLevel = null): int
    {
        return DB::transaction(function () use ($shipment, $events, $trackingLevel): int {
            $shipment = OrderShipment::query()->lockForUpdate()->findOrFail($shipment->id);
            $count = 0;
            foreach ($events as $event) {
                $key = hash('sha256', implode('|', [
                    $event['provider_event_id'] ?? '',
                    ($event['event_at'] ?? null)?->toIso8601String() ?? '',
                    $event['level'] ?? '', $event['provider_code'] ?? '',
                    $event['status'] ?? '', $event['location'] ?? '',
                    $event['description'] ?? '', $event['remark'] ?? '',
                ]));
                $existing = $shipment->trackingEvents()->where('provider_event_key', $key)->exists();
                $trackingEvent = $shipment->trackingEvents()->firstOrCreate(['provider_event_key' => $key], [
                    'status' => $event['status'] ?? 'in_transit',
                    'provider_level' => $event['level'] ?? null,
                    'provider_code' => $event['provider_code'] ?? null,
                    'description' => $event['description'] ?? null,
                    'remark' => $event['remark'] ?? null,
                    'location' => $event['location'] ?? null,
                    'event_at' => $event['event_at'] ?? null,
                    'payload' => $event['payload'] ?? null,
                    'response' => $event['response'] ?? null,
                ]);
                if ($existing && ($event['payload'] ?? null) !== null) {
                    $trackingEvent->update([
                        'payload' => $event['payload'],
                        'response' => $event['response'] ?? $trackingEvent->response,
                    ]);
                }
                $count += $existing ? 0 : 1;
            }

            $latest = collect($events)->filter(fn ($event) => ($event['event_at'] ?? null) !== null)
                ->sortByDesc(fn ($event) => $event['event_at'])->first() ?? ($events ? end($events) : null);
            if (! $latest && $trackingLevel !== null) {
                $latest = ['status' => 'unknown', 'event_at' => now(), 'description' => null];
            }
            if ($latest && ($trackingLevel !== null || in_array($latest['status'] ?? null, ['pending', 'in_transit', 'delivered'], true))) {
                $newAt = $latest['event_at'] ?? now();
                $knownAt = $shipment->trackingEvents()->whereNotNull('event_at')->max('event_at');
                $newAt = $newAt instanceof \DateTimeInterface ? Carbon::instance($newAt) : Carbon::parse($newAt);
                if (! $knownAt || $newAt->greaterThanOrEqualTo($knownAt)) {
                    $level = $trackingLevel ?? ($latest['level'] ?? null);
                    $status = match ($level) {
                        6 => OrderShipmentStatus::DELIVERED,
                        default => match ($latest['status'] ?? null) {
                            'delivered' => OrderShipmentStatus::DELIVERED,
                            'in_transit' => OrderShipmentStatus::IN_TRANSIT,
                            default => OrderShipmentStatus::PENDING,
                        },
                    };
                    $delivered = $status === OrderShipmentStatus::DELIVERED;
                    if ($shipment->status !== OrderShipmentStatus::DELIVERED || $delivered) {
                        $shipment->status = $status;
                        $shipment->tracking_level = $level;
                        if ($delivered) {
                            $shipment->delivered_at ??= $latest['event_at'] ?? now();
                        }
                        $shipment->memo = ($latest['description'] ?? null) ?: $shipment->memo;
                        $shipment->save();
                    }
                    if ($delivered && $shipment->order && ! in_array($shipment->order->status, [OrderStatus::Cancelled->value, OrderStatus::RefundRequested->value, OrderStatus::RefundCompleted->value], true)) {
                        $shipment->order->update(['status' => OrderStatus::Completed->value]);
                    }
                }
            }

            return $count;
        });
    }

    /** @param array<string, mixed> $payload */
    public function handleWebhook(array $payload): bool
    {
        $data = $this->normalize($payload);
        if ($data['invoice_number'] === '') {
            return false;
        }

        return DB::transaction(function () use ($data, $payload): ?OrderShipment {
            $shipment = OrderShipment::query()->where('invoice_number', $data['invoice_number'])->first();
            if (! $shipment) {
                return null;
            }

            $shipment->update(['carrier_code' => $data['carrier_code'] ?: $shipment->carrier_code]);
            $this->persist($shipment, [[
                'provider_event_id' => $data['provider_event_id'] ?? null,
                'status' => $data['status'],
                'event_at' => $data['event_at'],
                'location' => $data['location'],
                'description' => $data['description'],
                'level' => $data['level'] ?? null,
                'provider_code' => $data['provider_code'] ?? null,
                'remark' => $data['remark'] ?? null,
                'payload' => $payload,
                'response' => ['processed' => true],
            ]]);

            return $shipment;
        }) !== null;
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function normalizeEvent(array $row, ?int $fallbackLevel = null): array
    {
        $level = $this->parseLevel($row['level'] ?? null) ?? $fallbackLevel;
        $kind = (string) ($row['kind'] ?? $row['description'] ?? '');
        $remark = (string) ($row['remark'] ?? '');
        $legacyStatus = mb_strtolower((string) ($row['status'] ?? $row['delivery_status'] ?? ''));
        $status = match ($level) {
            0 => 'pending',
            1, 2, 3, 4, 5 => 'in_transit',
            6 => 'delivered',
            default => str_contains($legacyStatus, 'deliver') || str_contains($legacyStatus, '배송완료')
                ? 'delivered'
                : ($legacyStatus !== '' ? 'in_transit' : 'unknown'),
        };
        $time = $row['timeString'] ?? $row['time'] ?? $row['event_at'] ?? null;
        try {
            $eventAt = $time ? Carbon::parse((string) $time, 'Asia/Seoul')->utc() : null;
        } catch (\Throwable) {
            $eventAt = null;
        }

        return [
            'status' => $status,
            'level' => $level,
            'provider_code' => isset($row['code']) ? (string) $row['code'] : null,
            'event_at' => $eventAt,
            'location' => $row['where'] ?? $row['location'] ?? null,
            'description' => $kind !== '' ? $kind : ($remark !== '' ? $remark : null),
            'remark' => $remark !== '' ? $remark : null,
            'provider_event_id' => $row['id'] ?? $row['eventId'] ?? null,
        ];
    }

    private function parseLevel(mixed $value): ?int
    {
        if (! is_numeric($value)) {
            return null;
        }
        $level = (int) $value;

        return $level >= 0 && $level <= 6 ? $level : null;
    }
}
