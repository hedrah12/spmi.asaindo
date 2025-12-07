<?php

namespace App\Http\Controllers;

use App\Models\Standar;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StandarController extends Controller
{
    public function index(Request $request)
    {
        $query = Standar::query();

        // Fitur Search
        if ($request->has('search')) {
            $query->where('pernyataan_standar', 'like', '%' . $request->search . '%');
        }

        $standars = $query->latest()->get();

        return Inertia::render('standar/Index', [
            'data' => $standars,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'namaStandar' => 'required|string|max:255',
        ]);

        Standar::create([
            'pernyataan_standar' => $request->namaStandar,
            // 'id_kriteria' => ..., // Tambahkan jika ada input select di form
            // 'id_departemen' => ...,
        ]);

        return redirect()->back()->with('message', 'Standar berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'namaStandar' => 'required|string|max:255',
        ]);

        $standar = Standar::findOrFail($id);

        $standar->update([
            'pernyataan_standar' => $request->namaStandar,
        ]);

        return redirect()->back()->with('message', 'Standar berhasil diperbarui');
    }

    public function destroy($id)
    {
        $standar = Standar::findOrFail($id);
        $standar->delete();

        return redirect()->back()->with('message', 'Standar berhasil dihapus');
    }
}
