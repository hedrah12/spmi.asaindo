<?php

namespace App\Http\Controllers;

use App\Models\Lingkup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LingkupController extends Controller
{
    public function index(Request $request)
    {
        $query = Lingkup::query();

        // Fitur Search
        if ($request->has('search')) {
            $query->where('nama_lingkup', 'like', '%' . $request->search . '%');
        }

        // Ambil data terbaru
        $lingkups = $query->latest()->get();

        return Inertia::render('lingkup/Index', [
            'data' => $lingkups,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'namaLingkup' => 'required|string|max:255',
        ]);

        Lingkup::create([
            'nama_lingkup' => $request->namaLingkup,
        ]);

        return redirect()->back()->with('message', 'Lingkup berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'namaLingkup' => 'required|string|max:255',
        ]);

        $lingkup = Lingkup::findOrFail($id);

        $lingkup->update([
            'nama_lingkup' => $request->namaLingkup,
        ]);

        return redirect()->back()->with('message', 'Lingkup berhasil diperbarui');
    }

    public function destroy($id)
    {
        $lingkup = Lingkup::findOrFail($id);
        $lingkup->delete();

        return redirect()->back()->with('message', 'Lingkup berhasil dihapus');
    }
}
