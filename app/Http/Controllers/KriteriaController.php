<?php

namespace App\Http\Controllers;

use App\Models\Kriteria;
use App\Models\Lingkup;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * KriteriaController
 * * Mengelola data 'Kriteria' (Level 2 dalam hierarki SPMI).
 * * Relasi: Lingkup (Parent) -> Kriteria (Child).
 */
class KriteriaController extends Controller
{
    /**
     * Menampilkan daftar kriteria.
     * Menggunakan teknik JOIN untuk melakukan sorting berdasarkan nama tabel induk (Lingkup).
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // 1. Setup Query
        // 'with': Eager Loading standar agar data lingkup tersedia di frontend (property kriteria.lingkup)
        // 'join': Dibutuhkan agar kita bisa melakukan ORDER BY 'lingkups.nama_lingkup'
        $query = Kriteria::with('lingkup')
            ->join('lingkups', 'lingkups.id_lingkup', '=', 'kriterias.id_lingkup');

        // 2. Filter Pencarian
        if ($request->has('search')) {
            // Kita harus spesifik menyebut 'kriterias.kriteria' karena kita melakukan join,
            // untuk menghindari ambiguitas jika ada nama kolom yang sama.
            $query->where('kriterias.kriteria', 'like', '%' . $request->search . '%');
        }

        // 3. Eksekusi Query
        $kriterias = $query
            // Sorting Logic:
            // Urutkan dulu berdasarkan Nama Lingkup (Grouping effect secara visual)
            ->orderBy('lingkups.nama_lingkup', 'asc')
            // Lalu urutkan berdasarkan Nama Kriteria itu sendiri
            ->orderBy('kriterias.kriteria', 'asc')

            // PENTING: Karena kita melakukan Join, kolom 'id', 'created_at', dll bisa bentrok.
            // Kita paksa hanya mengambil kolom dari tabel 'kriterias'.
            // Data 'lingkup' tetap terambil lewat mekanisme 'with' (Eager Loading) di atas.
            ->select('kriterias.*')
            ->get();

        // 4. Data Master untuk Dropdown
        $lingkups = Lingkup::orderBy('nama_lingkup', 'asc')->get();

        return Inertia::render('kriteria/Index', [
            'data' => $kriterias,
            'lingkups' => $lingkups,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Menyimpan Kriteria baru.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'namaKriteria' => 'required|string|max:255',
            // Validasi Foreign Key: Pastikan id_lingkup benar-benar ada
            'id_lingkup'   => 'required|exists:lingkups,id_lingkup',
        ]);

        Kriteria::create([
            'kriteria'   => $request->namaKriteria,
            'id_lingkup' => $request->id_lingkup,
        ]);

        return redirect()->back()->with('message', 'Kriteria berhasil ditambahkan');
    }

    /**
     * Memperbarui Kriteria.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'namaKriteria' => 'required|string|max:255',
            'id_lingkup'   => 'required|exists:lingkups,id_lingkup',
        ]);

        // Menggunakan findOrFail agar return 404 jika ID tidak valid
        $kriteria = Kriteria::findOrFail($id);

        $kriteria->update([
            'kriteria'   => $request->namaKriteria,
            'id_lingkup' => $request->id_lingkup,
        ]);

        return redirect()->back()->with('message', 'Kriteria berhasil diperbarui');
    }

    /**
     * Menghapus Kriteria.
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $kriteria = Kriteria::findOrFail($id);
        $kriteria->delete();

        return redirect()->back()->with('message', 'Kriteria berhasil dihapus');
    }
}
