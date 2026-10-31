<?php

namespace App\Services;

use App\DTOs\LatLng;
use Illuminate\Support\Facades\Http;

class KakaoGeocoderService
{
    public function geocode(string $address): ?array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'KakaoAK ' . config('services.kakao.rest_api_key'),
            ])->get('https://dapi.kakao.com/v2/local/search/address.json', [
                'query' => $address,
            ]);

            if (!$response->successful()) {
                return null;
            }

            $document = $response->json('documents.0');

            if (!$document) {
                return null;
            }

            return [
                'lat' => (float) $document['y'],
                'lng' =>  (float) $document['x'],
            ];
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }
}
