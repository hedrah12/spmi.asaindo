<?php

namespace App\Http\Controllers;

use App\Models\Standar;
use App\Models\Lingkup;
use App\Models\Kriteria;
use App\Models\Departemen;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StandarController extends Controller
{
    /**
     * Menampilkan daftar Standar Audit beserta relasinya.
     */
    public function index(Request $request)
    {
        // 1. Eager Loading & Nested Relationship
        // 'with()' digunakan untuk mengatasi masalah N+1 Query.
        // - 'kriteria.lingkup': Kita meload 'kriteria', lalu dari kriteria itu kita load 'lingkup'.
        //   Ini penting agar di tabel frontend kita bisa menampilkan hierarki: Standar -> Kriteria -> Lingkup.
        // - 'departemen': Meload data departemen terkait.
        $query = Standar::with(['kriteria.lingkup', 'departemen']);

        // 2. Fitur Pencarian
        // Jika ada parameter 'search' dari frontend, filter berdasarkan pernyataan standar.
        if ($request->has('search')) {
            $query->where('pernyataan_standar', 'like', '%' . $request->search . '%');
        }

        // Ambil data dan urutkan berdasarkan Primary Key custom (id_standar)
        $standars = $query->orderBy('id_standar', 'desc')->get();

        // 3. Data Master untuk Dropdown Frontend
        // Frontend membutuhkan list Kriteria, Lingkup, dan Departemen untuk mengisi pilihan pada form (Select/Option).
        $kriterias = Kriteria::with('lingkup')->get(); // Load lingkup agar dropdown kriteria bisa dikelompokkan
        $lingkups = Lingkup::all();
        $departemens = Departemen::all();

        return Inertia::render('standar/Index', [
            'data' => $standars,
            'masterData' => [
                'lingkups' => $lingkups,
                'kriterias' => $kriterias,
                'departemens' => $departemens,
            ],
            // Mengembalikan filter search agar input search di frontend tidak hilang setelah reload
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Menyimpan Standar Audit baru.
     */
    public function store(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'namaStandar' => 'required|string',
            // 'exists' memastikan ID yang dikirim benar-benar ada di tabel referensinya
            'id_kriteria' => 'required|exists:kriterias,id_kriteria',
            'id_departemen' => 'nullable|exists:departemens,id_departemen',
        ]);

        // 2. Simpan ke Database
        // Perhatikan mapping: Input 'namaStandar' (dari React) disimpan ke kolom 'pernyataan_standar' (Database).
        Standar::create([
            'pernyataan_standar' => $request->namaStandar,
            'id_kriteria' => $request->id_kriteria,
            'id_departemen' => $request->id_departemen,
        ]);

        return redirect()->back()->with('message', 'Standar berhasil ditambahkan');
    }

    /**
     * Memperbarui data Standar Audit yang sudah ada.
     */
    public function update(Request $request, $id)
    {
        // 1. Validasi ulang input saat edit
        $request->validate([
            'namaStandar' => 'required|string',
            'id_kriteria' => 'required|exists:kriterias,id_kriteria',
            'id_departemen' => 'nullable|exists:departemens,id_departemen',
        ]);

        // 2. Cari Data
        // Menggunakan findOrFail agar otomatis return 404 jika ID tidak ditemukan
        $standar = Standar::findOrFail($id);

        // 3. Update Data
        $standar->update([
            'pernyataan_standar' => $request->namaStandar,
            'id_kriteria' => $request->id_kriteria,
            'id_departemen' => $request->id_departemen,
        ]);

        return redirect()->back()->with('message', 'Standar berhasil diperbarui');
    }

    /**
     * Menghapus Standar Audit.
     */
    public function destroy($id)
    {
        $standar = Standar::findOrFail($id);
        $standar->delete();

        return redirect()->back()->with('message', 'Standar berhasil dihapus');
    }
}
