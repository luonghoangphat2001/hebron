<?php

namespace App\Services;

use App\Models\Product;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProductPdfService
{
    public function getProduct(string $slug): Product
    {
        $product = Product::query()
            ->active()
            ->with('specification')
            ->where('slug', $slug)
            ->first();

        if (! $product) {
            throw new ModelNotFoundException('제품을 찾을 수 없습니다.');
        }

        return $product;
    }

    public function render(Product $product): string
    {
        $images = collect($product->images ?? [])
            ->filter(fn ($path) => is_string($path) && $path !== '')
            ->take(4)
            ->map(fn (string $path) => $this->imageDataUri($path))
            ->filter()
            ->values()
            ->all();

        $html = view('pdf.product-specification', [
            'product' => $product,
            'images' => $images,
            'fontPath' => storage_path('fonts/NanumGothic.ttf'),
            'fontPathBold' => storage_path('fonts/NanumGothic-Bold.ttf'),
        ])->render();

        $options = new Options;
        $options->set('defaultFont', 'NanumGothic');
        $options->set('fontDir', storage_path('fonts'));
        $options->set('fontCache', storage_path('fonts'));
        $options->setChroot('/');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return (string) $dompdf->output();
    }

    private function imageDataUri(string $path): ?string
    {
        try {
            if (str_starts_with($path, 'data:image/')) {
                return $path;
            }

            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                $response = Http::timeout(5)->retry(1, 100)->get($path);

                if (! $response->successful()) {
                    return null;
                }

                $mime = strtolower(trim(explode(';', $response->header('Content-Type', ''))[0]));

                return $this->toDataUri($response->body(), $mime);
            }

            $disk = Storage::disk(config('filesystems.public_disk'));
            $normalizedPath = ltrim($path, '/');

            if (! $disk->exists($normalizedPath)) {
                return null;
            }

            return $this->toDataUri($disk->get($normalizedPath), $disk->mimeType($normalizedPath) ?: '');
        } catch (Throwable) {
            // A missing/broken product image should not prevent downloading the specification PDF.
            return null;
        }
    }

    private function toDataUri(string $content, string $mime): ?string
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

        if ($content === '' || ! in_array($mime, $allowedMimes, true)) {
            return null;
        }

        return 'data:'.$mime.';base64,'.base64_encode($content);
    }
}
