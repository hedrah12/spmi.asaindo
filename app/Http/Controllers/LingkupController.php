<?php

namespace App\Http\Controllers;

use App\Models\Lingkup;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * LingkupController
 * * Mengelola data 'Lingkup' (Scope).
 * * Ini adalah Level 1 (Root) dalam hierarki SPMI.
 * * Data ini menjadi induk bagi data 'Kriteria'.
 */
class LingkupController extends Controller
{
    /**
     * Menampilkan daftar Lingkup.
     * Karena ini data master level teratas, query-nya sederhana (Single Table).
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = Lingkup::query();

        // Fitur Pencarian Sederhana
        if ($request->has('search')) {
            $query->where('nama_lingkup', 'like', '%' . $request->search . '%');
        }

        // Mengambil data terbaru berdasarkan Custom Primary Key 'id_lingkup'
        // Disusun Descending agar data yang baru diinput muncul paling atas.
        $lingkups = $query->orderBy('id_lingkup', 'desc')->get();

        return Inertia::render('lingkup/Index', [
            'data' => $lingkups,
            // Mengembalikan state filter ke frontend agar input search tidak kosong setelah reload
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Menyimpan data Lingkup baru.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Validasi input dari form Frontend
        $request->validate([
            'namaLingkup' => 'required|string|max:255',
        ]);

        // Mapping Data:
        // 'namaLingkup' (camelCase dari React) -> disimpan ke 'nama_lingkup' (snake_case di DB)
        Lingkup::create([
            'nama_lingkup' => $request->namaLingkup,
        ]);

        return redirect()->back()->with('message', 'Lingkup berhasil ditambahkan');
    }

    /**
     * Memperbarui data Lingkup.
     *
     * @param Request $request
     * @param int $id ID Lingkup
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'namaLingkup' => 'required|string|max:255',
        ]);

        // Menggunakan findOrFail untuk keamanan (otomatis 404 jika ID tidak ketemu)
        $lingkup = Lingkup::findOrFail($id);

        $lingkup->update([
            'nama_lingkup' => $request->namaLingkup,
        ]);

        return redirect()->back()->with('message', 'Lingkup berhasil diperbarui');
    }

    /**
     * Menghapus data Lingkup.
     * PERHATIAN: Menghapus Lingkup biasanya akan memicu penghapusan berantai (Cascade)
     * ke data anak-anaknya (Kriteria -> Standar -> Indikator) jika di-set di Migration.
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $lingkup = Lingkup::findOrFail($id);
        $lingkup->delete();

        return redirect()->back()->with('message', 'Lingkup berhasil dihapus');
    }
}
