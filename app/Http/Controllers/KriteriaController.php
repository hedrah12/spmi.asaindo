<?php

namespace App\Http\Controllers;

use App\Models\Kriteria;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KriteriaController extends Controller
{
    // Menampilkan halaman utama
    public function index(Request $request)
    {
        $query = Kriteria::query();

        // Fitur Pencarian Backend
        if ($request->has('search')) {
            $query->where('kriteria', 'like', '%' . $request->search . '%');
        }

        // Ambil data terbaru
        $kriterias = $query->latest()->get();

        return Inertia::render('kriteria/Index', [
            'data' => $kriterias,
            // Kirim filter search agar input search tetap terisi setelah reload
            'filters' => $request->only(['search']),
        ]);
    }

    // Menyimpan data baru
    public function store(Request $request)
    {
        $request->validate([
            'namaKriteria' => 'required|string|max:255',
        ]);

        Kriteria::create([
            'kriteria' => $request->namaKriteria,
            // 'id_lingkup' => $request->id_lingkup // Tambahkan jika ada input lingkup
        ]);

        return redirect()->back()->with('message', 'Data berhasil disimpan');
    }

    // Mengupdate data
    public function update(Request $request, $id)
    {
        $request->validate([
            'namaKriteria' => 'required|string|max:255',
        ]);

        $kriteria = Kriteria::findOrFail($id);

        $kriteria->update([
            'kriteria' => $request->namaKriteria,
        ]);

        return redirect()->back()->with('message', 'Data berhasil diupdate');
    }

    // Menghapus data
    public function destroy($id)
    {
        $kriteria = Kriteria::findOrFail($id);
        $kriteria->delete();

        return redirect()->back()->with('message', 'Data berhasil dihapus');
    }
}
