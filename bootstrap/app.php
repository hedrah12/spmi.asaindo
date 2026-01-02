<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ShareMenus;
use App\Http\Middleware\CheckMenuPermission;
// Import Middleware baru kita
use App\Http\Middleware\SetActiveRoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Daftarkan middleware di grup 'web' agar berjalan di setiap request halaman
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,

            // --- TAMBAHKAN INI ---
            // Middleware ini harus jalan sebelum menu dishare,
            // supaya menu yang tampil sesuai dengan role yang dipilih.
            SetActiveRoleMiddleware::class,

            ShareMenus::class,
        ]);

        $middleware->alias([
            'menu.permission' => CheckMenuPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
