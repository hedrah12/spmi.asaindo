<?php

namespace App\Http\Controllers;

use App\Models\MediaFolder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Spatie\MediaLibrary\MediaCollections\Models\Media; // Import Model Media Spatie

class MediaFolderController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $folderId = $request->input('folder_id');

        // 🔄 UBAH KE GLOBAL: Ambil semua folder (bukan cuma milik user login)
        $folders = MediaFolder::orderBy('name')->get();

        // Pastikan folder valid
        $currentFolder = null;
        if ($folderId) {
            // 🔄 UBAH KE GLOBAL: Cari di semua folder
            $currentFolder = MediaFolder::find($folderId);
            if (!$currentFolder) {
                return redirect('/files');
            }
        }

        // 🔄 UBAH KE GLOBAL: Ambil semua file (media)
        // Kita tidak lagi menggunakan $user->media()
        $files = Media::where('collection_name', 'files')
            ->when($folderId, function ($query) use ($folderId) {
                $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(custom_properties, '$.folder_id')) = ?", [(string)$folderId]);
            }, function ($query) {
                // File di root (tanpa folder)
                $query->where(function ($q) {
                    $q->whereNull('custom_properties->folder_id')
                        ->orWhereRaw("JSON_EXTRACT(custom_properties, '$.folder_id') IS NULL");
                });
            })
            ->latest() // Urutkan file terbaru
            ->get();

        return Inertia::render('files/Index', [
            'folders' => $folders,
            'currentFolderId' => $folderId,
            'currentFolder' => $currentFolder,
            'files' => $files->map(fn($media) => [
                'id' => $media->id,
                'name' => $media->name,
                'size' => $media->human_readable_size, // Property bawaan Spatie
                'mime_type' => $media->mime_type,
                'url' => $media->getUrl(), // Gunakan getUrl()
                'created_at' => $media->created_at->diffForHumans(),
                // Opsional: Tambahkan info uploader jika ingin ditampilkan
                'uploader' => $media->model ? $media->model->name : 'Unknown',
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:media_folders,id',
        ]);

        // Buat folder baru dengan user_id yang login (sebagai pemilik/pembuat)
        MediaFolder::create([
            'user_id' => $request->user()->id, // Tetap simpan siapa pembuatnya
            'name' => $request->name,
            'parent_id' => $request->parent_id,
        ]);

        return back()->with('success', 'Folder berhasil dibuat.');
    }

    public function destroy(MediaFolder $medium) // Parameter binding
    {
        $folder = $medium;

        // Cek Permission: Hanya Superadmin atau Pembuat Folder yang bisa hapus
        // (Opsional, sesuaikan dengan kebutuhan bisnis Anda)
        // if (auth()->id() !== $folder->user_id && !auth()->user()->hasRole('superadmin')) {
        //    abort(403, 'Unauthorized');
        // }

        // 🔁 Hapus semua file dalam folder ini
        $files = Media::where('collection_name', 'files')
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(custom_properties, '$.folder_id')) = ?", [(string)$folder->id])
            ->get();

        foreach ($files as $file) {
            $file->delete();
        }

        // 🔁 Hapus subfolder
        $childFolders = MediaFolder::where('parent_id', $folder->id)->get();
        foreach ($childFolders as $child) {
            $child->delete();
        }

        // 🗑️ Hapus folder utama
        $folder->delete();

        return back()->with('success', 'Folder berhasil dihapus.');
    }
}
