<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Models\User;

class SetActiveRoleMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        /** @var ?User $user */
        $user = Auth::user();

        if ($user && ! Session::has('active_role')) {
            // dapatkan nama role pertama jika ada
            $firstRole = $user->roles()->first(); // trait HasRoles menyediakan roles()
            if ($firstRole) {
                Session::put('active_role', $firstRole->name);
            }
        }

        // buat singleton agar bisa diakses via app('activeRole')
        if ($user && Session::has('active_role')) {
            app()->instance('activeRole', Session::get('active_role'));
        }

        return $next($request);
    }
}
