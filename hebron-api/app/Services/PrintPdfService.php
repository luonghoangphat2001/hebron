<?php

namespace App\Services;

use App\Models\DesignGroup;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\StreamReader;
use Symfony\Component\HttpKernel\Exception\HttpException;

/** Stores only server-managed, revision-bound PDFs; never dereferences client URLs. */
class PrintPdfService
{
    public static function revision(DesignGroup $group): string
    {
        $canonicalize = function (mixed $value) use (&$canonicalize): mixed {
            if (! is_array($value)) {
                return $value;
            }
            if (! array_is_list($value)) {
                ksort($value);
            }

            return array_map($canonicalize, $value);
        };

        return hash('sha256', json_encode($canonicalize([
            'product_id' => $group->product_id,
            'layout_data' => $group->layout_data,
            'layout_s3_path' => $group->layout_s3_path,
            'logo_path' => $group->logo_path,
            'preview_image_path' => $group->preview_image_path,
            'metadata' => $group->metadata,
        ]), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE));
    }

    public static function status(DesignGroup $group): array
    {
        return [
            'available' => $group->print_pdf_path === self::path($group)
                && hash_equals(self::revision($group), (string) $group->print_pdf_revision),
            'revision' => $group->print_pdf_revision,
        ];
    }

    private static function path(DesignGroup $group): string
    {
        return 'designs/print-pdfs/'.$group->id.'/print.pdf';
    }

    public function store(DesignGroup $group, UploadedFile $file, string $revision): DesignGroup
    {
        // Rebuild imported pages to discard document actions, attachments and scripts.
        $bytes = $this->sanitize($file->getContent());

        return DB::transaction(function () use ($group, $revision, $bytes) {
            $locked = DesignGroup::query()->lockForUpdate()->findOrFail($group->id);
            if (! hash_equals(self::revision($locked), $revision)) {
                throw new HttpException(409, 'Design changed. Save and regenerate the print PDF.');
            }
            $path = self::path($locked);
            $disk = Storage::disk(config('filesystems.print_pdf_disk', 'local'));
            $previous = $disk->exists($path) ? $disk->get($path) : null;
            try {
                if (! $disk->put($path, $bytes, ['visibility' => 'private', 'ContentType' => 'application/pdf'])) {
                    throw new HttpException(503, 'Unable to store print PDF.');
                }
                $locked->forceFill([
                    'print_pdf_path' => $path,
                    'print_pdf_revision' => $revision,
                    'print_pdf_digest' => hash('sha256', $bytes),
                ])->save();
            } catch (\Throwable $e) {
                // A failed DB write must not leave newer bytes bound to an old revision.
                if ($previous === null) {
                    $disk->delete($path);
                } else {
                    $disk->put($path, $previous, ['visibility' => 'private', 'ContentType' => 'application/pdf']);
                }
                throw $e;
            }

            return $locked;
        });
    }

    public function content(DesignGroup $group): ?string
    {
        return DB::transaction(function () use ($group) {
            $locked = DesignGroup::query()->lockForUpdate()->findOrFail($group->id);
            if (! self::status($locked)['available']) {
                if ($locked->print_pdf_revision !== null || ($locked->metadata['schema'] ?? null) === 'hebron-product-design-v1') {
                    throw new HttpException(409, 'Print PDF is missing or stale. Regenerate it in the editor.');
                }

                return null;
            }
            $disk = Storage::disk(config('filesystems.print_pdf_disk', 'local'));
            if (! $disk->exists(self::path($locked))) {
                throw new HttpException(409, 'Print PDF is missing. Regenerate it in the editor.');
            }

            $bytes = $disk->get(self::path($locked));
            if (strlen($bytes) > 25 * 1024 * 1024 || ! hash_equals((string) $locked->print_pdf_digest, hash('sha256', $bytes))) {
                throw new HttpException(409, 'Print PDF integrity check failed. Regenerate it in the editor.');
            }

            return $bytes;
        });
    }

    public function delete(DesignGroup $group): void
    {
        Storage::disk(config('filesystems.print_pdf_disk', 'local'))->delete(self::path($group));
    }

    private function sanitize(string $bytes): string
    {
        if (strlen($bytes) > 25 * 1024 * 1024 || ! str_starts_with($bytes, '%PDF-') || ! str_contains(substr($bytes, -1024), '%%EOF')) {
            throw new HttpException(422, 'Invalid print PDF (maximum 25 MiB).');
        }
        try {
            $pdf = new Fpdi;
            $count = $pdf->setSourceFile(StreamReader::createByString($bytes));
            if ($count < 1 || $count > 20) {
                throw new \RuntimeException('Page count');
            }
            for ($page = 1; $page <= $count; $page++) {
                $id = $pdf->importPage($page);
                $size = $pdf->getTemplateSize($id);
                if ($size['width'] <= 0 || $size['height'] <= 0 || $size['width'] > 3000 || $size['height'] > 3000) {
                    throw new \RuntimeException('Page size');
                }
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($id);
            }
            $sanitized = $pdf->Output('S');
            if (strlen($sanitized) > 25 * 1024 * 1024) {
                throw new \RuntimeException('Output size');
            }

            return $sanitized;
        } catch (\Throwable $e) {
            throw new HttpException(422, 'Unsupported or malformed print PDF (1–20 pages, at most 3000 mm per side).', $e);
        }
    }

    /** Import pages without rasterization, retaining original page geometry. */
    public function merge(array $documents): string
    {
        if (count($documents) > 200 || array_sum(array_map('strlen', $documents)) > 100 * 1024 * 1024) {
            throw new HttpException(422, 'Order print PDF exceeds the document limit (200 documents / 100 MiB).');
        }
        if (count($documents) === 1) {
            return $documents[0];
        }
        $pdf = new Fpdi;
        $total = 0;
        foreach ($documents as $bytes) {
            $count = $pdf->setSourceFile(StreamReader::createByString($bytes));
            $total += $count;
            if ($total > 200) {
                throw new HttpException(422, 'Order print PDF exceeds 200 pages.');
            }
            for ($page = 1; $page <= $count; $page++) {
                $id = $pdf->importPage($page);
                $size = $pdf->getTemplateSize($id);
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($id);
            }
        }

        return $pdf->Output('S');
    }
}
