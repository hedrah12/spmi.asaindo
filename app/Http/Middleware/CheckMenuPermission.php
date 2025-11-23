<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Menu;
use Spatie\Permission\Models\Role;

class CheckMenuPermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $currentRoute = '/' . ltrim($request->route()->uri(), '/');

        // Cari menu yang sesuai dengan route ini
        // Menggunakan 'like' agar bisa handle route dinamis jika perlu, tapi exact match lebih aman
        $menu = Menu::where('route', $currentRoute)->first();

        // Jika menu ada dan butuh permission
        if ($menu && $menu->permission_name) {

            // 1. AMBIL ROLE AKTIF
            $activeRoleName = session('active_role', $user->roles->first()?->name);

            // Bypass untuk Superadmin
            if ($activeRoleName === 'superadmin') {
                return $next($request);
            }

            // 2. CEK APAKAH ROLE AKTIF PUNYA PERMISSION INI
            // Kita tidak pakai $user->can() karena itu mengecek SEMUA role user
            $hasPermission = false;
            if ($activeRoleName) {
                $role = Role::where('name', $activeRoleName)->first();
                if ($role && $role->hasPermissionTo($menu->permission_name)) {
                    $hasPermission = true;
                }
            }

            if (!$hasPermission) {
                abort(403, 'Akses Ditolak: Role "' . ucfirst($activeRoleName) . '" tidak memiliki izin untuk halaman ini.');
            }
        }

        return $next($request);
    }
}
