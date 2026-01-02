<?php

namespace App\Http\Controllers;

use App\Models\Folder; // Gunakan Model Folder Anda
use App\Models\File;   // Gunakan Model File Anda
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class MediaFolderController extends Controller
{
    /**
     * Menampilkan Explorer.
     */
    public function index(Request $request)
    {
        $folderId = $request->input('folder_id');

        // 1. Ambil Folder
        // Jika sedang di root, ambil semua folder (flattened) atau hanya root folder?
        // Biasanya untuk explorer: tampilkan folder yang parent_id-nya sesuai current folder.
        $folders = Folder::query()
            ->when($folderId, function ($q) use ($folderId) {
                $q->where('parent_id', $folderId);
            }, function ($q) {
                $q->whereNull('parent_id'); // Root folders
            })
            ->orderBy('name')
            ->get();

        // 2. Cek Folder Aktif (Breadcrumb)
        $currentFolder = null;
        $ancestors = []; // Opsional: Untuk breadcrumb
        if ($folderId) {
            $currentFolder = Folder::find($folderId);
            if (!$currentFolder) {
                return redirect()->route('media.index'); // Sesuaikan route index Anda
            }

            // Logic untuk mengambil parent ke atas (Breadcrumb) bisa ditambahkan di sini
        }

        // 3. Ambil File
        // Gunakan model File Anda yang sederhana (pakai column folder_id)
        // Tidak perlu JSON Query yang rumit seperti kode sebelumnya.
        $files = File::query()
            ->when($folderId, function ($q) use ($folderId) {
                $q->where('folder_id', $folderId);
            }, function ($q) {
                $q->whereNull('folder_id'); // Root files
            })
            ->latest()
            ->get();

        return Inertia::render('files/Index', [
            'folders' => $folders,
            'currentFolderId' => $folderId,
            'currentFolder' => $currentFolder,
            'files' => $files->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'size' => $this->formatBytes($file->size), // Helper manual
                    'mime_type' => $file->mime_type,
                    'url' => $file->url, // Menggunakan Accessor getUrlAttribute dari Model File Anda
                    'created_at' => $file->created_at->diffForHumans(),
                ];
            }),
        ]);
    }

    /**
     * Membuat Folder Baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id', // Cek ke tabel folders
        ]);

        // Simpan menggunakan Model Folder Anda
        // Perhatikan: Model Folder Anda belum ada kolom 'user_id' di $fillable.
        // Jika tabel database Anda tidak punya kolom user_id, hapus baris user_id di bawah.
        Folder::create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
            // 'user_id' => auth()->id(), // Uncomment jika di migrasi & model sudah ditambahkan
        ]);

        return back()->with('success', 'Folder berhasil dibuat.');
    }

    /**
     * Upload File Baru
     */
    public function storeFile(Request $request)
    {
        $request->validate([
            'files.*' => 'required|file|max:10240', // Max 10MB
            'folder_id' => 'nullable|exists:folders,id'
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $uploadedFile) {
                // Simpan fisik
                $path = $uploadedFile->store('uploads', 'public');

                // Simpan DB menggunakan Model File Anda
                File::create([
                    'name' => $uploadedFile->getClientOriginalName(),
                    'path' => $path,
                    'mime_type' => $uploadedFile->getMimeType(),
                    'size' => $uploadedFile->getSize(),
                    'folder_id' => $request->folder_id,
                ]);
            }
        }

        return back()->with('success', 'File berhasil diunggah.');
    }

    /**
     * Menghapus Folder (Recursive otomatis lewat Model)
     */
    public function destroy(Folder $folder) // Type hint ke model Folder
    {
        // Karena di Model Folder Anda sudah ada fungsi booted() -> deleting(),
        // maka menghapus folder ini akan OTOMATIS menghapus:
        // 1. File di dalamnya (Database & Fisik)
        // 2. Sub-folder di dalamnya (Recursive)

        $folder->delete();

        return back()->with('success', 'Folder berhasil dihapus.');
    }

    /**
     * Menghapus File
     */
    public function destroyFile(File $file)
    {
        // Model File Anda sudah punya booted() -> deleting()
        // yang menghapus fisik file via Storage::delete().
        $file->delete();

        return back()->with('success', 'File berhasil dihapus.');
    }

    // Helper sederhana untuk format size
    private function formatBytes($bytes, $precision = 2) {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
