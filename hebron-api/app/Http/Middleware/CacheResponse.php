<?php

namespace App\Http\Middleware;

use App\Services\Cache;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheResponse
{
    public function __construct(
        protected Cache $cache
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  int  $ttl  Time to live in seconds (default 3600)
     * @param  string  $tag  Namespace tag for cache invalidation (default 'api_response')
     */
    public function handle(Request $request, Closure $next, int $ttl = 3600, string $tag = 'api_response'): Response
    {
        // Only cache GET requests
        if (! $request->isMethod('GET')) {
            return $next($request);
        }

        // Allow bypassing cache via header or query parameter (e.g. for debugging)
        if ($request->header('Cache-Control') === 'no-cache' || $request->has('no_cache')) {
            return $next($request);
        }

        $user = $request->user();
        $userId = $user ? 'u:'.$user->id : 'guest';
        $authority = $user?->authority ?? 'guest';
        $cacheKey = sha1($request->fullUrl().':'.$authority.':'.$userId);
        $resolvedTag = str_replace('{user}', $userId, $tag);

        // Check if response is already cached in Redis
        $cached = $this->cache->get($resolvedTag, $cacheKey);
        if ($cached !== null && is_array($cached) && isset($cached['content'])) {
            return response(
                $cached['content'],
                200,
                $cached['headers'] ?? ['Content-Type' => 'application/json']
            )->header('X-Cache', 'HIT');
        }

        // Cache miss: execute the request
        $response = $next($request);

        // Only cache successful 200 JSON responses
        $contentType = $response->headers->get('Content-Type', '');
        if ($response->getStatusCode() === 200 && str_contains($contentType, 'application/json')) {
            $this->cache->put($resolvedTag, $cacheKey, [
                'content' => $response->getContent(),
                'headers' => [
                    'Content-Type' => $contentType,
                ],
            ], $ttl);

            $response->headers->set('X-Cache', 'MISS');
        }

        return $response;
    }
}

