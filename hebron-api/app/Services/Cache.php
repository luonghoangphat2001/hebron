<?php

namespace App\Services;

use Closure;
use Illuminate\Support\Facades\Cache as LaravelCache;
use Illuminate\Support\Str;

class Cache
{
    private const VERSION_PREFIX = 'cache:version:';

    public function remember(string $namespace, string $key, int $ttl, Closure $callback): mixed
    {
        $cacheKey = $this->key($namespace, $key);

        if (LaravelCache::supportsTags()) {
            return LaravelCache::tags([$namespace])->remember($cacheKey, $ttl, $callback);
        }

        return LaravelCache::remember($cacheKey.':v'.$this->version($namespace), $ttl, $callback);
    }

    public function get(string $namespace, string $key): mixed
    {
        $cacheKey = $this->key($namespace, $key);

        if (LaravelCache::supportsTags()) {
            return LaravelCache::tags([$namespace])->get($cacheKey);
        }

        return LaravelCache::get($cacheKey.':v'.$this->version($namespace));
    }

    public function put(string $namespace, string $key, mixed $value, int $ttl): void
    {
        $cacheKey = $this->key($namespace, $key);

        if (LaravelCache::supportsTags()) {
            LaravelCache::tags([$namespace])->put($cacheKey, $value, $ttl);

            return;
        }

        LaravelCache::put($cacheKey.':v'.$this->version($namespace), $value, $ttl);
    }

    public function invalidate(string|array $namespaces): void
    {
        foreach ((array) $namespaces as $namespace) {
            if (LaravelCache::supportsTags()) {
                LaravelCache::tags([$namespace])->flush();
            } else {
                LaravelCache::forever($this->versionKey($namespace), (string) Str::uuid());
            }
        }
    }

    public function keyFromParams(string $prefix, array $params = []): string
    {
        $filtered = array_filter(
            $params,
            static fn ($value) => $value !== null && $value !== ''
        );
        ksort($filtered);

        return $prefix.':'.sha1(json_encode($filtered, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    private function key(string $namespace, string $key): string
    {
        return $namespace.':'.$key;
    }

    private function version(string $namespace): string
    {
        return (string) LaravelCache::get($this->versionKey($namespace), '1');
    }

    private function versionKey(string $namespace): string
    {
        return self::VERSION_PREFIX.$namespace;
    }
}
