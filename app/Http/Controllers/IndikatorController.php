<?php

namespace App\Http\Controllers;

use App\Models\Indikator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IndikatorController extends Controller
{
    public function index(Request $request)
    {
        $query = Indikator::query();

        // Fitur Search
        if ($request->has('search')) {
            $query->where('pernyataan_indikator', 'like', '%' . $request->search . '%');
        }

        // Ambil data terbaru
        $indikators = $query->latest()->get();

        return Inertia::render('indikator/Index', [
            'data' => $indikators,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'namaIndikator' => 'required|string', // Textarea/Text bisa panjang
        ]);

        Indikator::create([
            'pernyataan_indikator' => $request->namaIndikator,
            // 'id_kriteria' => ...,
            // 'id_standar' => ...,
        ]);

        return redirect()->back()->with('message', 'Indikator berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'namaIndikator' => 'required|string',
        ]);

        $indikator = Indikator::findOrFail($id);

        $indikator->update([
            'pernyataan_indikator' => $request->namaIndikator,
        ]);

        return redirect()->back()->with('message', 'Indikator berhasil diperbarui');
    }

    public function destroy($id)
    {
        $indikator = Indikator::findOrFail($id);
        $indikator->delete();

        return redirect()->back()->with('message', 'Indikator berhasil dihapus');
    }
}
