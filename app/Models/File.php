<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    /**
     * Mass Assignment Protection.
     * Kolom yang diizinkan untuk diisi secara massal (create/update).
     */
    protected $fillable = ['name', 'path', 'mime_type', 'size', 'folder_id'];

    /**
     * ✨ JSON APPENDS
     * Menambahkan atribut virtual 'url' ke dalam output JSON model ini.
     * Berguna agar saat data dikirim ke Frontend (React/Inertia),
     * field 'url' sudah tersedia otomatis, meskipun tidak ada kolom 'url' di database.
     */
    protected $appends = ['url'];

    /**
     * 🔗 ACCESSOR: getUrlAttribute
     * Logika untuk menghasilkan nilai atribut 'url' di atas.
     * Mengubah path relatif (misal: 'uploads/file.jpg') menjadi URL lengkap
     * (misal: 'http://localhost:8000/storage/uploads/file.jpg').
     */
    public function getUrlAttribute()
    {
        return Storage::url($this->path);
    }

    /**
     * 🧹 MODEL BOOT / EVENT HOOK
     * Method ini dijalankan otomatis saat model di-booting.
     * Digunakan untuk mendaftarkan event listener Eloquent.
     */
    protected static function booted()
    {
        // Event 'deleting': Dijalankan SESAAT SEBELUM record database dihapus.
        static::deleting(function ($file) {
            // Cek apakah file fisik ada di storage disk 'public'
            if ($file->path && Storage::disk('public')->exists($file->path)) {
                // Hapus file fisik agar tidak menjadi sampah (orphan file) di server
                Storage::disk('public')->delete($file->path);
            }
        });
    }
}
