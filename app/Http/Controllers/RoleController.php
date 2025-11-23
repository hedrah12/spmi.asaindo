<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Penting untuk Auth::user()
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Menampilkan halaman list role (CRUD).
     */
    public function index()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all()->groupBy('group');

        return Inertia::render('roles/Index', [
            'roles' => $roles,
            'groupedPermissions' => $permissions,
        ]);
    }

    /**
     * Menyimpan role baru (CRUD).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|unique:roles,name',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', 'Role created');
    }

    /**
     * Form create role (CRUD).
     */
    public function create()
    {
        $permissions = Permission::all()->groupBy('group');
        return Inertia::render('roles/Form', [
            'groupedPermissions' => $permissions,
        ]);
    }

    /**
     * Form edit role (CRUD).
     */
    public function edit(Role $role)
    {
        $permissions = Permission::all()->groupBy('group');
        $role->load('permissions');
        return Inertia::render('roles/Form', [
            'role' => $role,
            'groupedPermissions' => $permissions,
        ]);
    }

    /**
     * Update role (CRUD).
     */
    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id,
            'permissions' => 'array',
        ]);

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', 'Role updated');
    }

    /**
     * Hapus role (CRUD).
     */
    public function destroy(Role $role)
    {
        $role->delete();
        return redirect()->route('roles.index')->with('success', 'Role deleted');
    }

    // ==========================================================
    // LOGIKA SWITCH ROLE (DITAMBAHKAN DI SINI)
    // ==========================================================

    /**
     * Handle switch role request.
     */
    public function switchRole(Request $request)
    {
        $request->validate([
            'role' => 'required|string',
        ]);

        $user = Auth::user();
        $newRole = $request->input('role');

        // 🛡️ SECURITY CHECK:
        // Pastikan user benar-benar punya role yang diminta.
        if (! $user->hasRole($newRole)) {
            abort(403, 'Unauthorized action: Anda tidak memiliki role ini.');
        }

        // Simpan role yang dipilih ke dalam session
        session(['active_role' => $newRole]);

        return back()->with('success', "Beralih ke peran: " . ucfirst($newRole));
    }
}
