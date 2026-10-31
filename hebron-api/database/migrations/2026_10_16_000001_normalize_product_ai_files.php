<?php

use App\Enums\FileType;
use App\Support\FileStorage;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('products') || ! Schema::hasTable('files')) {
            return;
        }

        DB::table('products')
            ->whereNotNull('file_ai')
            ->orderBy('id')
            ->chunkById(100, function ($products): void {
                foreach ($products as $product) {
                    $references = json_decode((string) $product->file_ai, true);

                    if (! is_array($references)) {
                        $references = [$product->file_ai];
                    }

                    $fileIds = [];

                    foreach ($references as $reference) {
                        if ($reference === null || $reference === '') {
                            continue;
                        }

                        if (is_numeric($reference) && DB::table('files')->where('id', (int) $reference)->exists()) {
                            $fileIds[] = (int) $reference;
                            continue;
                        }

                        $path = (string) $reference;
                        $file = DB::table('files')->where('path', $path)->first();

                        if (! $file) {
                            $now = now();
                            $fileId = DB::table('files')->insertGetId([
                                'name' => basename(parse_url($path, PHP_URL_PATH) ?: $path),
                                'path' => $path,
                                'url' => FileStorage::publicUrl($path),
                                'type' => FileType::PRODUCT_AI->value,
                                'mime_type' => null,
                                'size' => null,
                                'created_by' => null,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);
                        } else {
                            $fileId = $file->id;
                        }

                        $fileIds[] = (int) $fileId;
                    }

                    DB::table('products')
                        ->where('id', $product->id)
                        ->update(['file_ai' => json_encode(array_values($fileIds))]);
                }
            });
    }

    public function down(): void
    {
        // Product file_ai values cannot be safely converted back to legacy paths
        // after shared File records have been created.
    }
};
