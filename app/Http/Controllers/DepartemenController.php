<?php

namespace App\Http\Controllers;

use App\Models\Departemen;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DepartemenController extends Controller
{
    public function index(Request $request)
    {
        $query = Departemen::query();

        // Fitur Search
        if ($request->has('search')) {
            $query->where('nama_departemen', 'like', '%' . $request->search . '%');
        }

        // Ambil data terbaru
        $departemens = $query->latest()->get();

        return Inertia::render('departemen/Index', [
            'data' => $departemens,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'namaDepartemen' => 'required|string|max:255',
        ]);

        Departemen::create([
            'nama_departemen' => $request->namaDepartemen,
            'user_id' => Auth::id(), // Simpan ID user yang login
        ]);

        return redirect()->back()->with('message', 'Departemen berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'namaDepartemen' => 'required|string|max:255',
        ]);

        $departemen = Departemen::findOrFail($id);

        $departemen->update([
            'nama_departemen' => $request->namaDepartemen,
        ]);

        return redirect()->back()->with('message', 'Departemen berhasil diperbarui');
    }

    public function destroy($id)
    {
        $departemen = Departemen::findOrFail($id);
        $departemen->delete();

        return redirect()->back()->with('message', 'Departemen berhasil dihapus');
    }
}
