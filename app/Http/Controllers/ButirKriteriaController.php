<?php

namespace App\Http\Controllers;

use App\Models\ButirKriteria;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ButirKriteriaController extends Controller
{
    public function index()
    {
        $data = ButirKriteria::orderBy('id', 'asc')->get();

        return Inertia::render('butirkriteria/Index', [
            'butirKriteria' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'element' => 'required|string|max:255',
            'indikator' => 'required|string',
            'prodi' => 'required|string|max:255',
            'lingkup' => 'nullable|string|max:255',
            'auditor' => 'nullable|string|max:255',
            'auditee' => 'nullable|string|max:255',
            'siklus' => 'nullable|string|max:255',
        ]);

        ButirKriteria::create($validated);

        return redirect()->back()->with('success', 'Data berhasil ditambahkan.');
    }

    public function destroy(ButirKriteria $butirKriterium)
    {
        $butirKriterium->delete();
        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }
}
