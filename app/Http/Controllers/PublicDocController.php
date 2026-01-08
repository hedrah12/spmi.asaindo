<?php

namespace App\Http\Controllers;

use App\Models\PublicDoc;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Imports\PublicDocsImport;
use Maatwebsite\Excel\Facades\Excel;

class PublicDocController extends Controller
{
    /**
     * Helper privat untuk mengambil data hierarki
     */
    private function getData($folderId, $isAdmin = false)
    {
        $currentFolder = $folderId ? PublicDoc::findOrFail($folderId) : null;
        $ancestors = $currentFolder ? $currentFolder->getAncestors() : collect([]);
        $query = PublicDoc::where('parent_id', $folderId)->orderBy('type', 'desc')->orderBy('name', 'asc');

        if (!$isAdmin) $query->where('is_active', true);

        return [
            'currentFolder' => $currentFolder,
            'ancestors' => $ancestors,
            'items' => $query->get()
        ];
    }

    /**
     * Halaman ADMIN (CRUD)
     */
    public function index(Request $request)
    {
        $folderId = $request->query('folder');
        $data = $this->getData($folderId, true);

        // [FIX] Ubah 'docs/Index' menjadi 'Docs/Index' (Huruf D Besar)
        return Inertia::render('Docs/Index', $data);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:folder,file',
            'url'  => 'nullable|required_if:type,file|url', // URL wajib jika type=file
            'parent_id' => 'nullable|exists:public_docs,id'
        ]);

        PublicDoc::create([
            'name' => $request->name,
            'type' => $request->type,
            'url'  => $request->type === 'file' ? $request->url : null,
            'parent_id' => $request->parent_id,
            'is_active' => true
        ]);

        return back()->with('success', 'Item berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $doc = PublicDoc::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'url'  => 'nullable|required_if:type,file|url',
            'is_active' => 'boolean'
        ]);

        $doc->update([
            'name' => $request->name,
            'url'  => $doc->type === 'file' ? $request->url : null,
            'is_active' => $request->is_active
        ]);

        return back()->with('success', 'Berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $doc = PublicDoc::findOrFail($id);
        // Hapus folder akan menghapus isinya juga (cascade di database)
        $doc->delete();
        return back()->with('success', 'Berhasil dihapus.');
    }


    public function import(Request $request)
    {
        $request->validate([
            // [PERBAIKAN] Tambahkan 'txt' agar CSV yang terdeteksi sebagai text biasa bisa masuk
            // ATAU hapus mimes sementara untuk memastikan fungsi berjalan
            'file' => 'required|file|mimes:xlsx,xls,csv,txt|max:2048',
            'parent_id' => 'nullable|exists:public_docs,id'
        ]);

        try {
            Excel::import(new PublicDocsImport($request->parent_id), $request->file('file'));

            return back()->with('success', 'Data berhasil diimport.');
        } catch (\Exception $e) {
            // Tampilkan error spesifik dari Excel import
            return back()->withErrors(['file' => 'Gagal import: ' . $e->getMessage()]);
        }
    }
}
