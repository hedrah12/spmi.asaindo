<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FileManagerController extends Controller
{
    public function index()
    {
        return Inertia::render('dspmi/Index', [
            'folders' => Folder::all(), // Frontend yang akan menyusun tree-nya
            'files' => File::orderBy('created_at', 'desc')->get()
        ]);
    }

    public function storeFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id'
        ]);

        Folder::create([
            'name' => $request->name,
            'parent_id' => $request->parent_id
        ]);

        return back()->with('success', 'Folder berhasil dibuat.');
    }

    public function updateFolder(Request $request, Folder $folder)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $folder->update(['name' => $request->name]);

        return back()->with('success', 'Folder berhasil diubah.');
    }

    public function destroyFolder(Folder $folder)
    {
        // Model Observer di Folder akan menangani penghapusan sub-folder/file
        $folder->delete();
        return back()->with('success', 'Folder berhasil dihapus.');
    }

    public function storeFile(Request $request)
    {
        $request->validate([
            'files.*' => 'required|file|max:20480', // Maks 20MB
            'folder_id' => 'nullable|exists:folders,id' // Nullable = boleh di root
        ]);

        if ($request->hasFile('files')) {
            DB::transaction(function () use ($request) {
                foreach ($request->file('files') as $file) {
                    // Simpan fisik
                    $path = $file->store('uploads', 'public');

                    // Simpan DB
                    File::create([
                        'name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'folder_id' => $request->folder_id // Bisa null
                    ]);
                }
            });
        }

        return back()->with('success', 'File berhasil diupload.');
    }

    public function destroyFile(File $file)
    {
        // Model Observer di File akan menghapus fisik file
        $file->delete();
        return back()->with('success', 'File berhasil dihapus.');
    }
}
