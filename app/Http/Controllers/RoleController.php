<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Menampilkan daftar role beserta permission yang dimilikinya.
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
     * Menyimpan Role baru.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|unique:roles,name',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', 'Role berhasil dibuat');
    }

    /**
     * Form create role.
     */
    public function create()
    {
        $permissions = Permission::all()->groupBy('group');

        return Inertia::render('roles/Form', [
            'groupedPermissions' => $permissions,
        ]);
    }

    /**
     * Form edit role.
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
     * Update role.
     */
    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id,
            'permissions' => 'array',
        ]);

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', 'Role berhasil diperbarui');
    }

    /**
     * Hapus role.
     */
    public function destroy(Role $role)
    {
        $role->delete();
        return redirect()->route('roles.index')->with('success', 'Role berhasil dihapus');
    }

    // ==========================================================
    // LOGIKA SWITCH ROLE (MODAL DASHBOARD)
    // ==========================================================

    /**
     * Mengubah role aktif user dalam sesi.
     */
    public function switchRole(Request $request)
    {
        $request->validate([
            'role' => 'required|string',
        ]);

        $user = Auth::user();
        $newRole = $request->input('role');

        // 🛡️ SECURITY CHECK: Pastikan user benar-benar punya role ini
        if (! $user->hasRole($newRole)) {
            abort(403, 'Unauthorized action: Anda tidak memiliki akses ke role ini.');
        }

        // Simpan role yang dipilih ke dalam SESSION.
        session(['active_role' => $newRole]);

        // Redirect BACK.
        // Ini akan me-refresh halaman Dashboard.
        // Karena session 'active_role' sudah terisi, Middleware tidak akan lagi mengirim sinyal popup.
        return back()->with('success', "Berhasil beralih ke peran: " . ucfirst($newRole));
    }
}
