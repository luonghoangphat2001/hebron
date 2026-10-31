<?php

namespace App\Services;

use App\Enums\DesignModeCode;
use App\Models\DesignGroup;
use App\Models\OrderArtwork;
use App\Models\UploadArtwork;
use App\Models\User;
use App\Support\FileStorage;
use App\Support\GuestCommerceToken;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DesignService
{
    protected function getDesignDiskName(): string
    {
        return config('filesystems.public_disk');
    }

    protected function getDesignDisk(): FilesystemAdapter
    {
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($this->getDesignDiskName());

        return $disk;
    }

    public function createDesignGroup(?User $user, array $data, ?string $guestToken = null): DesignGroup
    {
        return DesignGroup::create([
            'user_id' => $user?->id,
            'guest_token_hash' => $user ? null : GuestCommerceToken::hash($guestToken),
            'product_id' => $data['product_id'] ?? null,
            'title' => $data['title'] ?? null,
            'preview_image_path' => $data['preview_image_path'] ?? null,
            'metadata' => $data['metadata'] ?? null,
        ]);
    }

    public function createSideArtwork(string $designGroupId, array $data): OrderArtwork
    {
        $group = DesignGroup::findOrFail($designGroupId);

        $artwork = OrderArtwork::create([
            'design_group_id' => $designGroupId,
            'side' => $data['side'] ?? 'front',
            'layout_data' => $data['layout_data'] ?? null,
            'layout_s3_path' => $data['layout_s3_path'] ?? null,
            'logo_path' => $data['logo_path'] ?? null,
            'preview_image_path' => $data['preview_image_path'] ?? null,
        ]);

        return $artwork;
    }

    public function createSideArtworks(string $designGroupId, array $items): array
    {
        return collect($items)
            ->map(fn (array $data) => $this->createSideArtwork($designGroupId, $data))
            ->all();
    }

    public function createUploadArtwork(string $designGroupId, array $data): UploadArtwork
    {
        $group = DesignGroup::findOrFail($designGroupId);

        $artwork = UploadArtwork::create([
            'design_group_id' => $designGroupId,
            'url' => $data['url'] ?? null,
            'name' => $data['name'] ?? null,
            'size' => $data['size'] ?? null,
            'mime' => $data['mime'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'print_as_is' => $data['print_as_is'] ?? false,
            'print_without_proof' => $data['print_without_proof'] ?? false,
        ]);

        return $artwork;
    }

    public function createUploadArtworks(string $designGroupId, array $items): array
    {
        return collect($items)
            ->map(fn (array $data) => $this->createUploadArtwork($designGroupId, $data))
            ->all();
    }

    public function createDesign(?User $user, array $data, ?string $guestToken = null): DesignGroup
    {
        $designGroup = $this->createDesignGroup($user, $data, $guestToken);

        $this->createSideArtwork($designGroup->id, array_merge($data, ['side' => $data['side'] ?? 'front']));

        return $designGroup;
    }

    public function updateDesignGroup(DesignGroup $group, array $data): DesignGroup
    {
        $fillable = ['title', 'preview_image_path', 'metadata', 'revised_file_path', 'revised_file_name', 'rejection_reason', 'confirmation_requested_at', 'confirmed_at', 'rejected_at'];

        $updateData = [];
        foreach ($fillable as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (! empty($updateData)) {
            $group->update($updateData);
        }

        return $group->fresh();
    }

    public function updateArtwork(OrderArtwork $artwork, array $data): OrderArtwork
    {
        $updateData = [];

        if (array_key_exists('layout_data', $data)) {
            $updateData['layout_data'] = $data['layout_data'];
        }

        if (array_key_exists('layout_s3_path', $data)) {
            $updateData['layout_s3_path'] = $data['layout_s3_path'];
        }

        if (array_key_exists('logo_path', $data)) {
            $updateData['logo_path'] = $data['logo_path'];
        }

        if (array_key_exists('preview_image_path', $data)) {
            $updateData['preview_image_path'] = $data['preview_image_path'];
        }

        $artwork->update($updateData);

        return $artwork->fresh();
    }

    public function uploadLogo(OrderArtwork $artwork, UploadedFile $file): string
    {
        if ($artwork->logo_path) {
            $this->deleteFile($artwork->logo_path);
        }

        $path = $this->uploadToStorage($file, 'designs/logos', $artwork->id);
        $artwork->update(['logo_path' => $path]);

        return $path;
    }

    public function uploadPreview(OrderArtwork $artwork, UploadedFile $file): string
    {
        $side = $artwork->side === 'back' ? 'back' : 'front';
        if ($artwork->preview_image_path) {
            $this->deleteFile($artwork->preview_image_path);
        }

        $path = $this->uploadToStorage($file, 'designs/previews', $artwork->id, $side);
        $artwork->update(['preview_image_path' => $path]);

        return $path;
    }

    public function getArtworkForSide(OrderArtwork $artwork, string $side): ?OrderArtwork
    {
        $side = $side === 'back' ? 'back' : 'front';
        if ($artwork->side === $side) {
            return $artwork;
        }

        return $artwork->getSibling()?->side === $side ? $artwork->getSibling() : null;
    }

    public function getPreviewUrlForSide(OrderArtwork $artwork, string $side, int $expirationMinutes = 60): ?string
    {
        $target = $this->getArtworkForSide($artwork, $side);

        return $target ? $this->getPreviewUrl($target, $expirationMinutes) : null;
    }

    public function getPreviewPathForSide(OrderArtwork $artwork, string $side): ?string
    {
        $target = $this->getArtworkForSide($artwork, $side);

        return $target?->preview_image_path;
    }

    public function saveLayoutData(OrderArtwork $artwork, array $layoutData): string
    {
        if ($artwork->layout_s3_path) {
            $this->deleteFile($artwork->layout_s3_path);
        }

        $jsonContent = json_encode($layoutData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        $filename = sprintf('design-%d-layout-%s.json', $artwork->id, now()->format('YmdHis'));
        $s3Path = sprintf('designs/layouts/%d/%s', $artwork->id, $filename);

        $disk = $this->getDesignDisk();
        $disk->put($s3Path, $jsonContent);

        $artwork->update([
            'layout_s3_path' => $s3Path,
            'layout_data' => $layoutData,
        ]);

        return $s3Path;
    }

    public function loadLayoutData(OrderArtwork $artwork): ?array
    {
        if (! $artwork->layout_s3_path) {
            return $artwork->layout_data;
        }

        try {
            $disk = $this->getDesignDisk();
            if (! $disk->exists($artwork->layout_s3_path)) {
                return $artwork->layout_data;
            }

            $content = $disk->get($artwork->layout_s3_path);

            return json_decode($content, true);
        } catch (\Exception $e) {
            return $artwork->layout_data;
        }
    }

    public function saveSvgData(OrderArtwork $artwork, string $svgContent): string
    {
        if ($artwork->layout_s3_path) {
            $this->deleteFile($artwork->layout_s3_path);
        }

        $filename = sprintf('design-%d-svg-%s.svg', $artwork->id, now()->format('YmdHis'));
        $s3Path = sprintf('designs/svgs/%d/%s', $artwork->id, $filename);

        $disk = $this->getDesignDisk();
        $disk->put($s3Path, $svgContent);

        $artwork->update(['layout_s3_path' => $s3Path]);

        return $s3Path;
    }

    public function generatePreview(OrderArtwork $artwork, string $format = 'png'): string
    {
        if ($artwork->preview_image_path) {
            $this->deleteFile($artwork->preview_image_path);
        }

        $filename = sprintf('design-%d-preview-%s.%s', $artwork->id, now()->format('YmdHis'), $format);
        $s3Path = sprintf('designs/previews/%d/%s', $artwork->id, $filename);

        $artwork->update(['preview_image_path' => $s3Path]);

        return $s3Path;
    }

    public function getLogoUrl(OrderArtwork $artwork, int $expirationMinutes = 60): ?string
    {
        if (! $artwork->logo_path) {
            return null;
        }

        return FileStorage::publicUrl($artwork->logo_path);
    }

    public function getLogoPathForSide(OrderArtwork $artwork, string $side): ?string
    {
        $target = $this->getArtworkForSide($artwork, $side);

        return $target?->logo_path;
    }

    public function getLogoUrlForSide(OrderArtwork $artwork, string $side, int $expirationMinutes = 60): ?string
    {
        $target = $this->getArtworkForSide($artwork, $side);

        return $target ? $this->getLogoUrl($target, $expirationMinutes) : null;
    }

    public function getPreviewUrl(OrderArtwork $artwork, int $expirationMinutes = 60): ?string
    {
        if (! $artwork->preview_image_path) {
            return null;
        }

        return FileStorage::publicUrl($artwork->preview_image_path);
    }

    public function getPreviewContent(DesignGroup $designGroup): ?string
    {
        if (! $designGroup->preview_image_path) {
            return null;
        }

        try {
            $disk = $this->getDesignDisk();

            if (! $disk->exists($designGroup->preview_image_path)) {
                return null;
            }

            return $disk->get($designGroup->preview_image_path);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getLayoutDataUrl(OrderArtwork $artwork, int $expirationMinutes = 60): ?string
    {
        if (! $artwork->layout_s3_path) {
            return null;
        }

        return FileStorage::publicUrl($artwork->layout_s3_path);
    }

    protected function uploadToStorage(UploadedFile $file, string $directory, ?int $artworkId = null, ?string $pathPrefix = null): string
    {
        $disk = $this->getDesignDisk();

        $extension = $file->getClientOriginalExtension();
        $prefix = $artworkId ? "design-{$artworkId}" : 'temp';
        $filename = sprintf(
            '%s-%s.%s',
            $prefix,
            Str::random(16),
            $extension
        );

        if ($pathPrefix !== null && $pathPrefix !== '') {
            $filename = $pathPrefix.'-'.$filename;
        }

        $relativePath = $artworkId
            ? sprintf('%s/%d/%s', $directory, $artworkId, $filename)
            : sprintf('%s/%s', $directory, $filename);

        $disk->putFileAs(dirname($relativePath), $file, basename($relativePath));

        return $relativePath;
    }

    protected function deleteFile(string $path): bool
    {
        try {
            $disk = $this->getDesignDisk();

            return $disk->delete($path);
        } catch (\Exception $e) {
            return false;
        }
    }

    public function deleteArtwork(OrderArtwork $artwork): bool
    {
        if ($artwork->logo_path) {
            $this->deleteFile($artwork->logo_path);
        }

        if ($artwork->layout_s3_path) {
            $this->deleteFile($artwork->layout_s3_path);
        }

        if ($artwork->preview_image_path) {
            $this->deleteFile($artwork->preview_image_path);
        }

        return $artwork->delete();
    }

    public function getUserDesignGroupSearch(User $user, array $filters = [], int $perPage = 15)
    {
        $query = DesignGroup::with(['order', 'orderItem.product', 'orderArtworks'])
            ->where('user_id', $user->id);

        if (! empty($filters['side'])) {
            $query->whereHas('orderArtworks', fn ($q) => $q->where('side', $filters['side']));
        }

        if (! empty($filters['size_id'])) {
            $query->where('size_option_id', $filters['size_id']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $allowedSortFields = ['created_at', 'updated_at', 'title'];

        if (in_array($sortField, $allowedSortFields, true)) {
            $query->orderBy($sortField, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        return $query->paginate($perPage);
    }

    public function getAvailableSizes(User $user): array
    {
        return DesignGroup::query()
            ->where('user_id', $user->id)
            ->where('source_type', DesignModeCode::WEB_EDITOR)
            ->whereNotNull('size_option_id')
            ->join('erp_size_options', 'design_groups.size_option_id', '=', 'erp_size_options.id')
            ->select('erp_size_options.id', 'erp_size_options.name')
            ->distinct()
            ->get()
            ->map(fn ($option) => [
                'label' => $option->name,
                'value' => (string) $option->id,
            ])
            ->values()
            ->toArray();
    }

    public function getUserDesignGroup(User $user, int $designId): ?DesignGroup
    {
        return DesignGroup::with(['order', 'orderItem.product', 'orderArtworks'])
            ->where('user_id', $user->id)
            ->where('id', $designId)
            ->first();
    }

    /**
     * Delete design and all associated files.
     */
    public function deleteDesign(OrderArtwork $artwork): bool
    {
        // Delete files from S3
        if ($artwork->logo_path) {
            $this->deleteFile($artwork->logo_path);
        }

        if ($artwork->layout_s3_path) {
            $this->deleteFile($artwork->layout_s3_path);
        }

        if ($artwork->preview_image_path) {
            $this->deleteFile($artwork->preview_image_path);
        }

        // Delete database record
        return $artwork->delete();
    }
}
