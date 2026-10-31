<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddressBook\StoreAddressBookRequest;
use App\Http\Requests\AddressBook\UpdateAddressBookRequest;
use App\Http\Resources\AddressBookResource;
use App\Models\AddressBook;
use App\Services\KakaoGeocoderService;
use App\Services\MyPage\MyPageShippingAddressService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function __construct(
        protected KakaoGeocoderService $geocoder
    ) {}
    public function geocode(
        Request $request,

    ): JsonResponse {
        $validated = $request->validate([
            'address' => ['required', 'string', 'max:500'],
        ]);

        $latLng = $this->geocoder->geocode($validated['address']);

        if (!$latLng) {
            return response()->json([
                'message' => '주소를 찾을 수 없습니다.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'address' => $latLng,
            ]
        ]);
    }
}
