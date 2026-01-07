<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Lingkup;
use App\Models\Standar;
use App\Models\Kriteria;
use App\Models\Indikator;
use Illuminate\Http\Request;
use App\Imports\IndikatorImport;
use Maatwebsite\Excel\Facades\Excel;

/**
 * IndikatorController
 * * Mengelola data 'Indikator' yang merupakan level terbawah dari hierarki SPMI.
 * * Hierarki: Lingkup -> Kriteria -> Standar -> Indikator.
 */
class IndikatorController extends Controller
{
    /**
     * Menampilkan daftar indikator dan data master untuk form.
     * Mengirimkan data relasi lengkap untuk keperluan tabel dan dropdown bertingkat (Cascading Select).
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // 1. Query Data Utama (Indikator)
        // Menggunakan Eager Loading ('with') untuk memanggil relasi orang tua (Standar)
        // dan kakek-neneknya (Kriteria -> Lingkup) agar bisa ditampilkan di tabel UI.
        // Mencegah masalah N+1 Query.
        $query = Indikator::with(['standar', 'kriteria.lingkup']);

        // Logika Pencarian
        if ($request->has('search')) {
            $query->where('pernyataan_indikator', 'like', '%' . $request->search . '%');
        }

        // Ambil data urut dari yang terbaru
        $indikators = $query->orderBy('id_indikator', 'desc')->get();

        // 2. Data Master untuk Dropdown (Cascading Select di Frontend)
        // Frontend membutuhkan data ini agar saat user memilih 'Lingkup',
        // dropdown 'Kriteria' bisa difilter, dan seterusnya.

        $lingkups = Lingkup::all();
        $kriterias = Kriteria::all();

        // Penting: Kita mengambil 'id_kriteria' di tabel Standar.
        // Ini digunakan oleh Frontend (React) untuk memfilter Standar mana saja
        // yang muncul ketika user memilih Kriteria tertentu.
        $standars = Standar::select('id_standar', 'pernyataan_standar', 'id_kriteria')->get();

        return Inertia::render('indikator/Index', [
            'data' => $indikators,
            'masterData' => [
                'lingkups' => $lingkups,
                'kriterias' => $kriterias,
                'standars' => $standars,
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Menyimpan indikator baru.
     * Memastikan indikator terhubung ke Kriteria dan Standar yang valid.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'namaIndikator' => 'required|string',
            // Validasi Foreign Key: Pastikan ID yang dikirim benar-benar ada di tabel induknya
            'id_kriteria' => 'required|exists:kriterias,id_kriteria',
            'id_standar' => 'required|exists:standars,id_standar',
        ]);

        Indikator::create([
            'pernyataan_indikator' => $request->namaIndikator,
            'id_kriteria' => $request->id_kriteria,
            'id_standar' => $request->id_standar,
        ]);

        return redirect()->back()->with('message', 'Indikator berhasil ditambahkan');
    }

    /**
     * Memperbarui data indikator.
     *
     * @param Request $request
     * @param int $id ID Indikator
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'namaIndikator' => 'required|string',
            'id_kriteria' => 'required|exists:kriterias,id_kriteria',
            'id_standar' => 'required|exists:standars,id_standar',
        ]);

        $indikator = Indikator::findOrFail($id);

        $indikator->update([
            'pernyataan_indikator' => $request->namaIndikator,
            'id_kriteria' => $request->id_kriteria, // Update relasi jika user mengubah parent
            'id_standar' => $request->id_standar,
        ]);

        return redirect()->back()->with('message', 'Indikator berhasil diperbarui');
    }

    /**
     * Menghapus indikator.
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $indikator = Indikator::findOrFail($id);
        $indikator->delete();

        return redirect()->back()->with('message', 'Indikator berhasil dihapus');
    }
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
        ]);

        try {
            Excel::import(new IndikatorImport, $request->file('file'));

            return redirect()->back()->with('success', 'Data berhasil diimpor!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal impor: ' . $e->getMessage());
        }
    }
}
