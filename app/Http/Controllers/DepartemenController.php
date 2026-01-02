<?php

namespace App\Http\Controllers;

use App\Models\Departemen;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

/**
 * DepartemenController
 * * Mengelola CRUD (Create, Read, Update, Delete) untuk Master Data Departemen.
 * Controller ini berinteraksi dengan tabel 'departemens'.
 */
class DepartemenController extends Controller
{
    /**
     * Menampilkan halaman daftar departemen.
     * Mendukung fitur pencarian dan sorting berdasarkan data terbaru.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Inisialisasi query builder
        $query = Departemen::query();

        // Logika Pencarian: Filter berdasarkan nama_departemen jika ada parameter 'search'
        if ($request->has('search')) {
            $query->where('nama_departemen', 'like', '%' . $request->search . '%');
        }

        // Mengambil data urut dari yang paling baru (LIFO) berdasarkan primary key custom 'id_departemen'
        $departemens = $query->orderBy('id_departemen', 'desc')->get();

        // Render view React/Vue via Inertia dengan mengirimkan data prop
        return Inertia::render('departemen/Index', [
            'data' => $departemens,
            // Mengembalikan state filter agar input search di frontend tidak reset
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Menyimpan data departemen baru ke database.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Validasi input dari frontend
        $request->validate([
            'namaDepartemen' => 'required|string|max:255',
        ]);

        // Simpan ke database
        Departemen::create([
            // Mapping input camelCase (dari React) ke snake_case (Database)
            'nama_departemen' => $request->namaDepartemen,

            // Mengisi 'user_id' (Penanggung Jawab) dengan user yang sedang login
            'user_id' => Auth::id(),
        ]);

        // Redirect kembali ke halaman index dengan pesan flash message
        return redirect()->back()->with('message', 'Departemen berhasil ditambahkan');
    }

    /**
     * Memperbarui data departemen yang sudah ada.
     *
     * @param Request $request
     * @param int $id ID Departemen (id_departemen)
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'namaDepartemen' => 'required|string|max:255',
        ]);

        // Cari data berdasarkan Primary Key custom ($primaryKey = 'id_departemen' di Model)
        // Jika tidak ketemu, otomatis return 404
        $departemen = Departemen::findOrFail($id);

        $departemen->update([
            'nama_departemen' => $request->namaDepartemen,
        ]);

        return redirect()->back()->with('message', 'Departemen berhasil diperbarui');
    }

    /**
     * Menghapus data departemen.
     *
     * @param int $id ID Departemen
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $departemen = Departemen::findOrFail($id);

        // Melakukan soft delete atau hard delete tergantung konfigurasi Model
        $departemen->delete();

        return redirect()->back()->with('message', 'Departemen berhasil dihapus');
    }
}
