<?php

namespace App\Http\Middleware;

use App\Models\Menu;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Spatie\Permission\Models\Role;

class ShareMenus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        Inertia::share('menus', function () use ($user) {
            if (!$user) return [];

            // 1. AMBIL ROLE AKTIF DARI SESSION
            // Jika tidak ada di session, ambil role pertama user
            $activeRoleName = session('active_role', $user->roles->first()?->name);

            // 2. AMBIL SEMUA PERMISSION MILIK ROLE TERSEBUT
            // Kita butuh daftar permission name dari role yang sedang aktif
            $activeRolePermissions = [];
            if ($activeRoleName) {
                $role = Role::findByName($activeRoleName); // Pastikan use Spatie\Permission\Models\Role;
                if ($role) {
                    $activeRolePermissions = $role->permissions->pluck('name')->toArray();
                }
            }

            // 3. AMBIL SEMUA MENU (Diurutkan)
            $allMenus = Menu::orderBy('order')->get();
            $indexed = $allMenus->keyBy('id');

            // 4. FILTER MENU BERDASARKAN PERMISSION ROLE AKTIF
            $buildTree = function ($parentId = null) use (&$buildTree, $indexed, $activeRolePermissions, $activeRoleName) {
                return $indexed
                    ->filter(function ($menu) use ($parentId, $activeRolePermissions, $activeRoleName) {
                        // Cek Parent ID
                        if ($menu->parent_id !== $parentId) {
                            return false;
                        }

                        // Superadmin (opsional): selalu bisa lihat semua menu
                        if ($activeRoleName === 'superadmin') {
                            return true;
                        }

                        // Jika menu tidak butuh permission -> TAMPILKAN
                        if (!$menu->permission_name) {
                            return true;
                        }

                        // Jika menu butuh permission -> CEK APAKAH ROLE AKTIF PUNYA PERMISSION ITU
                        return in_array($menu->permission_name, $activeRolePermissions);
                    })
                    ->map(function ($menu) use (&$buildTree) {
                        $menu->children = $buildTree($menu->id)->values();
                        return $menu;
                    })
                    // Hapus menu parent yang tidak punya anak & tidak punya route (kosong)
                    ->filter(function ($menu) {
                        return $menu->route || $menu->children->isNotEmpty();
                    })
                    ->values();
            };

            return $buildTree();
        });

        return $next($request);
    }
}
