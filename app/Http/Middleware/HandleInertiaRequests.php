<?php

namespace App\Http\Middleware;

use App\Models\SettingApp;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // LOGIKA BARU: Cek apakah user wajib memilih role
        // Syarat: User login + Punya >1 Role + Belum ada session 'active_role'
        $mustSelectRole = $user && $user->roles->count() > 1 && !session('active_role');

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],

            'auth' => [
                'user' => $user,
                'roles' => $user ? $user->getRoleNames() : [],
                'active_role' => session('active_role', $user?->roles->first()?->name),

                // TAMBAHKAN INI KE FRONTEND
                'must_select_role' => $mustSelectRole,
            ],

            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],

            'setting' => fn() => SettingApp::first(),
        ]);
    }
}
