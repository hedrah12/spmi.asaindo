<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class SetActiveRoleMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user) {
            $rolesCount = $user->roles->count();

            // 1. Safety: Jika User tidak punya role sama sekali
            if ($rolesCount === 0) {
                Auth::logout();
                return redirect()->route('login')->with('error', 'Akun Anda tidak memiliki role.');
            }

            // 2. Jika User HANYA punya 1 Role -> Set Otomatis
            if ($rolesCount === 1 && !Session::has('active_role')) {
                Session::put('active_role', $user->roles->first()->name);
            }

            // 3. Register singleton agar mudah diakses di controller lain
            if (Session::has('active_role')) {
                app()->instance('activeRole', Session::get('active_role'));
            }

            // CATATAN: Kita MENGHAPUS logika redirect di sini.
            // Biarkan request lanjut ke Controller/Inertia.
        }

        return $next($request);
    }
}
