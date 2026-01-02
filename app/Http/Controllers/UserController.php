<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Departemen;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        // Ubah with('roles') menjadi array ['roles', 'departemens']
        $users = User::with(['roles', 'departemens'])
            ->latest()
            ->paginate(10);

        return Inertia::render('users/Index', [
            'users' => $users,
        ]);
    }
    public function create()
    {
        $roles = Role::all();
        // Ambil semua departemen untuk pilihan dropdown/checkbox
        $departemens = Departemen::select('id_departemen', 'nama_departemen')->get();

        return Inertia::render('users/Form', [
            'roles' => $roles,
            'departemens' => $departemens, // <--- Kirim ke frontend
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'roles'    => ['required', 'array', 'min:1'],
            'roles.*'  => ['required', Rule::exists('roles', 'name')],
            // Validasi input departemen (array ID)
            'departemens'   => ['nullable', 'array'],
            'departemens.*' => ['exists:departemens,id_departemen'],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['roles']);

        // Update departemen yang dipilih agar user_id-nya mengarah ke user baru ini
        if (!empty($validated['departemens'])) {
            Departemen::whereIn('id_departemen', $validated['departemens'])
                ->update(['user_id' => $user->id]);
        }

        return redirect()->route('users.index')->with('success', 'User berhasil dibuat.');
    }

    public function edit(User $user)
    {
        $roles = Role::all();
        $departemens = Departemen::select('id_departemen', 'nama_departemen')->get();

        return Inertia::render('users/Form', [
            'user'         => $user->only(['id', 'name', 'email']),
            'roles'        => $roles,
            'currentRoles' => $user->roles->pluck('name')->toArray(),
            'departemens'  => $departemens, // <--- Kirim list semua departemen
            // Kirim ID departemen yang saat ini dimiliki user ini
            'currentDepartemens' => $user->departemens()->pluck('id_departemen')->toArray(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'roles'    => ['required', 'array', 'min:1'],
            'roles.*'  => ['required', Rule::exists('roles', 'name')],
            'departemens'   => ['nullable', 'array'],
            'departemens.*' => ['exists:departemens,id_departemen'],
        ]);

        $user->update([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password']
                ? Hash::make($validated['password'])
                : $user->password,
        ]);

        $user->syncRoles($validated['roles']);

        /**
         * Logika Update Departemen:
         * 1. Lepaskan (set null) departemen lama yang dulu milik user ini tapi sekarang tidak dipilih.
         * 2. Set user_id ke user ini untuk departemen yang baru dipilih.
         */

        // Lepaskan semua departemen yang sebelumnya milik user ini
        Departemen::where('user_id', $user->id)->update(['user_id' => null]);

        // Pasang departemen baru yang dipilih
        if (!empty($validated['departemens'])) {
            Departemen::whereIn('id_departemen', $validated['departemens'])
                ->update(['user_id' => $user->id]);
        }

        return redirect()->route('users.index')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User berhasil dihapus.');
    }

    public function resetPassword(User $user)
    {
        $user->update([
            'password' => Hash::make('ResetPasswordNya'),
        ]);

        return redirect()->back()->with('success', 'Password berhasil direset ke default.');
    }
}
