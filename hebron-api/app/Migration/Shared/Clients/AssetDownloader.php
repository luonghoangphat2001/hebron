<?php

namespace App\Migration\Shared\Clients;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class AssetDownloader
{
    /** @param array<string, mixed> $article */
    public function download(array $article, string $directory): array
    {
        $articleNo = (int) ($article['article_no'] ?? 0);
        $stored = [];

        $attachments = array_map(function (mixed $attachment) use ($directory, $articleNo, &$stored): mixed {
            if (! is_array($attachment) || empty($attachment['url'])) {
                return $attachment;
            }

            $source = $this->normalizeUrl((string) $attachment['url']);
            $local = $stored[$source] ??= $this->storeImage($source, $directory, $articleNo);
            $attachment['url'] = $local;

            return $attachment;
        }, $article['attach_file_urls'] ?? []);

        $content = (string) ($article['content'] ?? '');
        $content = preg_replace_callback(
            '/(<img\b[^>]*?\bsrc=)("|\')([^"\']+)(\2)/i',
            function (array $matches) use ($directory, $articleNo, &$stored): string {
                $source = $matches[3];
                $normalized = $this->normalizeUrl($source);

                if (! $this->isAllowedSource($normalized)) {
                    return $matches[0];
                }

                $local = $stored[$normalized] ??= $this->storeImage($normalized, $directory, $articleNo);

                return $matches[1] . $matches[2] . $local . $matches[4];
            },
            $content,
        );

        $article['content'] = $content;
        $article['attach_file_urls'] = $attachments;

        return $article;
    }

    private function storeImage(string $source, string $directory, int $articleNo): string
    {
        $bytes = $this->read($source);
        $extension = $this->extension($source, $bytes['content_type']);
        $path = sprintf(
            '%s/%d/%s.%s',
            trim($directory, '/'),
            $articleNo,
            sha1($source),
            $extension,
        );
        $diskName = (string) config('filesystems.public_disk', 'public');
        $disk = Storage::disk($diskName);

        if (! $disk->exists($path)) {
            $disk->put($path, $bytes['body']);
        }

        return $disk->url($path);
    }

    /** @return array{body: string, content_type: string|null} */
    private function read(string $source): array
    {
        if (str_starts_with($source, 'data:')) {
            if (! preg_match('/^data:([^;]+);base64,(.*)$/s', $source, $matches)) {
                throw new \RuntimeException('Invalid inline image data.');
            }

            $body = base64_decode($matches[2], true);

            if ($body === false) {
                throw new \RuntimeException('Invalid inline image Base64 data.');
            }

            return ['body' => $body, 'content_type' => $matches[1]];
        }

        $response = Http::timeout((int) config('migration.images.download_timeout', 30))
            ->retry(2, 250, throw: false)
            ->get($source);

        if (! $response->successful()) {
            throw new \RuntimeException(sprintf('Could not download content asset (%s): HTTP %d', $source, $response->status()));
        }

        return ['body' => $response->body(), 'content_type' => $response->header('Content-Type')];
    }

    private function normalizeUrl(string $url): string
    {
        return str_starts_with($url, '//') ? 'https:' . $url : $url;
    }

    private function isAllowedSource(string $source): bool
    {
        if (str_starts_with($source, 'data:')) {
            return true;
        }

        $host = parse_url($source, PHP_URL_HOST);

        $legacyHost = parse_url((string) config('migration.images.legacy_prefix', ''), PHP_URL_HOST);

        return is_string($host) && $host === $legacyHost;
    }

    private function extension(string $source, ?string $contentType): string
    {
        $mime = strtolower(trim(explode(';', (string) $contentType)[0]));
        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'application/pdf' => 'pdf',
        ];

        if (isset($extensions[$mime])) {
            return $extensions[$mime];
        }

        $extension = pathinfo((string) parse_url($source, PHP_URL_PATH), PATHINFO_EXTENSION);

        return preg_match('/^[a-z0-9]{1,8}$/i', $extension) ? strtolower($extension) : 'bin';
    }
}
