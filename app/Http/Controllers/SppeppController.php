<?php

namespace App\Http\Controllers;

use App\Models\MediaFolder;
use Inertia\Inertia;
use Illuminate\Http\Request;

class SppeppController extends Controller
{
    public function index()
    {
        // Daftar tahapan yang akan menjadi "Root" accordion
        $stages = ['Penetapan', 'Pelaksanaan', 'Evaluasi', 'Pengendalian', 'Peningkatan'];

        // Ambil folder yang namanya cocok dengan tahapan di atas
        // dan muat children (subfolder) serta files (media) di dalamnya
        $ppeppData = MediaFolder::whereIn('name', $stages)
            ->with([
                'children' => fn($q) => $q->with('children'), // Muat sub-sub folder (jika perlu lebih dalam, tambah rekursif)
                // Asumsi Anda menggunakan Spatie Media Library dan relasi di model sudah benar
                // Jika belum ada relasi 'media' di MediaFolder, kita pakai logic manual di frontend atau fix relation
            ])
            ->get();

        // Karena struktur MediaFolder Anda mungkin belum punya relasi langsung ke 'media' (files)
        // Kita perlu cara mengambil file.
        // OPSI TERBAIK: Gunakan query manual untuk attach files ke setiap folder di tree
        // Namun untuk simplifikasi, saya asumsikan di frontend kita menerima raw folders.

        // NOTE: Agar fitur ini jalan sempurna, pastikan Anda membuat FOLDER di File Manager
        // dengan nama persis: "Penetapan", "Pelaksanaan", "Evaluasi", "Pengendalian", "Peningkatan".

        return Inertia::render('sppepp/Index', [
            'stages' => $stages,
            // Mengirim semua folder agar frontend bisa memfilter
            'folders' => MediaFolder::with('children')->get(),
            // Mengirim semua file (media) agar frontend bisa memapping ke folder
            'files' => \Spatie\MediaLibrary\MediaCollections\Models\Media::where('collection_name', 'files')->get()->map(fn($f) => [
                'id' => $f->id,
                'name' => $f->name,
                'url' => $f->getUrl(),
                'mime_type' => $f->mime_type,
                'folder_id' => $f->custom_properties['folder_id'] ?? null,
            ]),
        ]);
    }
}
