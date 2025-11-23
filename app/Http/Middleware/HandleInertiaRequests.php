<?php

namespace App\Http\Middleware;

use App\Models\SettingApp;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        // 1. DEFINISI VARIABEL DI AWAL
        // Kita ambil user dulu supaya bisa dipakai berkali-kali di bawah
        $user = $request->user();

        // Ambil quote random
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // 2. MERGE DATA (GABUNGAN KODE ANDA)
        return array_merge(parent::share($request), [

            // App Info
            'name' => config('app.name'),

            // Quote
            'quote' => ['message' => trim($message), 'author' => trim($author)],

            // --- BAGIAN AUTH YANG SUDAH DIGABUNG ---
            'auth' => [
                // Data User
                'user' => $user,

                // Role List (Mengambil semua role user)
                // Jika user login ($user ada), ambil roles. Jika tamu, array kosong.
                'roles' => $user ? $user->getRoleNames() : [],

                // Active Role (Logika Switcher)
                // Prioritas 1: Ambil dari Session
                // Prioritas 2: Ambil role pertama dari database
                // Menggunakan tanda tanya (?) agar aman jika user belum punya role
                'active_role' => session('active_role', $user?->roles->first()?->name),
            ],
            // ---------------------------------------

            // Flash Messages (Toast)
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],

            // Global Setting (Logo, dll)
            'setting' => fn() => SettingApp::first(),
        ]);
    }
}
