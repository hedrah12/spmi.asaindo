<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
class UserFileController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $folderId = $request->input('folder_id');

        $folders = $user->mediaFolders()->orderBy('name')->get();

        // ✅ Cek folder aktif
        $currentFolder = $folderId ? $user->mediaFolders()->find($folderId) : null;

        if ($folderId && !$currentFolder) {
            // 🛑 Jika folder tidak ada, redirect ke root
            return redirect('/files');
        }

        $files = $user
            ->media()
            ->where('collection_name', 'files')
            ->when($folderId, function ($query) use ($folderId) {
                $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(custom_properties, '$.folder_id')) = ?", [(string)$folderId]);
            }, function ($query) {
                $query->where(function ($q) {
                    $q->whereNull('custom_properties->folder_id')
                        ->orWhereRaw("JSON_EXTRACT(custom_properties, '$.folder_id') IS NULL");
                });
            })
            ->get();

        return Inertia::render('files/Index', [
            'folders' => $folders,
            'currentFolderId' => $folderId,
            'currentFolder' => $currentFolder,
            'files' => $files->map(fn($media) => [
                'id' => $media->id,
                'name' => $media->name,
                'size' => $media->humanReadableSize,
                'mime_type' => $media->mime_type,
                'url' => $media->getFullUrl(),
                'created_at' => $media->created_at->diffForHumans(),
            ]),
        ]);
    }

public function store(Request $request)
    {
        $request->validate([
            'files.*' => 'required|file|max:10240', // Max 10MB per file
            'folder_id' => 'nullable|exists:media_folders,id',
        ]);

        $user = $request->user();
        $folderId = $request->input('folder_id');

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $media = $user->addMedia($file)
                    ->toMediaCollection('files');

                // Simpan relasi folder di custom properties
                if ($folderId) {
                    $media->setCustomProperty('folder_id', $folderId);
                    $media->save();
                }
            }
        }

        return back()->with('success', 'File berhasil diupload.');
    }

    /**
     * Hapus file.
     * (Method inilah yang hilang sebelumnya)
     */
    public function destroy($id)
    {
        // Cari media berdasarkan ID
        $media = Media::findOrFail($id);

        // 🛡️ SECURITY CHECK
        // Hanya izinkan hapus jika:
        // 1. User adalah Superadmin (berdasarkan session active_role atau role asli)
        // 2. ATAU User adalah pemilik file (model_id == user_id)

        $user = Auth::user();
        $isActiveSuperAdmin = session('active_role') === 'superadmin'; // Atau logic role Anda
        $isOwner = $media->model_id === $user->id && $media->model_type === get_class($user);

        if (!$isActiveSuperAdmin && !$isOwner) {
            abort(403, 'Anda tidak berhak menghapus file ini.');
        }

        $media->delete();

        return back()->with('success', 'File berhasil dihapus.');
    }
}
