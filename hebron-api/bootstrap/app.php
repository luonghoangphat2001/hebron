<?php

use App\Http\Middleware\CacheResponse;
use App\Http\Middleware\CheckIsAdmin;
use App\Http\Middleware\CheckIsStoreAdmin;
use App\Http\Middleware\CheckUserStatus;
use App\Http\Middleware\GuestCommerceIdentity;
use App\Http\Middleware\OptionalAuth;
use App\Http\Middleware\VerifyWebhookSignature;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withEvents(discover: false)
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');
        // API clients must receive a JSON 401 instead of being redirected to a web login route.
        $middleware->redirectGuestsTo(fn (Request $request) => $request->is('api/*') ? null : route('login')
        );

        // Allow CORS for API routes (for Swagger UI and other frontend apps)
        $middleware->api(prepend: [
            HandleCors::class,
        ]);
        $middleware->alias([
            'user.active' => CheckUserStatus::class,
            'user.admin' => CheckIsAdmin::class,
            'user.store.admin' => CheckIsStoreAdmin::class,
            'verify.webhook' => VerifyWebhookSignature::class,
            'optional.auth' => OptionalAuth::class,
            'guest.commerce' => GuestCommerceIdentity::class,
            'cache.response' => CacheResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Treat every API request as JSON, even when clients send Accept: */*.
        $exceptions->shouldRenderJsonWhen(fn (Request $request, Throwable $e) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();
