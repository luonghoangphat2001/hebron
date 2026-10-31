<?php

namespace App\Services\CustomerService;

use App\Enums\FileType;
use App\Models\DirectShippingRequest;
use App\Models\User;
use App\Services\FileService;
use App\Services\PaginationService;
use App\Support\FileStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class DirectShippingService
{
    public function __construct(
        protected PaginationService $paginationService,
        protected FileService $fileService
    ) {}

    /**
     * Get paginated direct shipping requests for the user.
     */
    public function getList(User $user, int $perPage = 15): array
    {
        $items = DirectShippingRequest::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return [
            'items' => $items->map(fn ($item) => $this->format($item))->values(),
            'pagination' => $this->paginationService->format($items),
        ];
    }

    /**
     * Get a single direct shipping request belonging to the user.
     */
    public function getOne(User $user, int $id): array
    {
        $item = DirectShippingRequest::where('user_id', $user->id)->findOrFail($id);

        return $this->format($item);
    }

    /**
     * Create a new direct shipping request.
     */
    public function create(User $user, array $data, ?UploadedFile $file = null): array
    {
        try {
            $filePath = null;
            $fileName = null;

            if ($file) {
                $filePath = $file->store('direct-shipping', config('filesystems.public_disk'));
                $fileName = $file->getClientOriginalName();
                $this->fileService->create($file, $filePath, FileType::DIRECT_SHIPPING, $user);
            }

            $item = DirectShippingRequest::create([
                'user_id' => $user->id,
                'shipping_name' => $data['shipping_name'],
                'recipient_name' => $data['recipient_name'],
                'phone' => $data['phone'] ?? null,
                'postcode' => $data['postcode'] ?? null,
                'address' => $data['address'] ?? null,
                'detailed_address' => $data['detailed_address'] ?? null,
                'storage_location' => $data['storage_location'] ?? null,
                'file_path' => $filePath,
                'file_name' => $fileName,
                'detail_request' => $data['detail_request'],
                'amount' => $data['amount'] ?? 0,
                'status' => 'pending',
            ]);

            return $this->format($item);
        } catch (\Exception $e) {
            Log::error('Create direct shipping request failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function format(DirectShippingRequest $item): array
    {
        return [
            'id' => $item->id,
            'shipping_name' => $item->shipping_name,
            'recipient_name' => $item->recipient_name,
            'phone' => $item->phone,
            'postcode' => $item->postcode,
            'address' => $item->address,
            'detailed_address' => $item->detailed_address,
            'storage_location' => $item->storage_location,
            'file_url' => FileStorage::publicUrl($item->file_path),
            'file_name' => $item->file_name,
            'detail_request' => $item->detail_request,
            'amount' => $item->amount,
            'status' => $item->status,
            'created_at' => $item->created_at?->toDateTimeString(),
        ];
    }
}
