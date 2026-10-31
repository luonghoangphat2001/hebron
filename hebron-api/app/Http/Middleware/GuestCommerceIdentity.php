<?php

namespace App\Http\Middleware;

use App\Support\GuestCommerceToken;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class GuestCommerceIdentity
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->isActive()) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Account is not active.',
            ], 403);
        }

        if ($request->user()) {
            return $next($request);
        }

        $token = $request->header(GuestCommerceToken::HEADER);

        if (is_string($token)) {
            $token = trim($token);
        }

        if ($token !== null && ! preg_match('/^[A-Za-z0-9_-]{32,255}$/', $token)) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Invalid guest token.',
            ], 422);
        }

        $token ??= Str::random(64);
        $request->attributes->set(GuestCommerceToken::ATTRIBUTE, $token);

        Log::channel('daily')->info('Commerce guest identity resolved', [
            'event' => 'commerce_identity.guest_resolved',
            'method' => $request->method(),
            'path' => $request->path(),
            'route_name' => $request->route()?->getName(),
            'request_ip' => $request->ip(),
            'guest_token_fingerprint' => GuestCommerceToken::fingerprint($token),
            'token_source' => $request->hasHeader(GuestCommerceToken::HEADER) ? 'request_header' : 'generated',
        ]);

        $response = $next($request);
        $response->headers->set(GuestCommerceToken::HEADER, $token);

        return $response;
    }
}
