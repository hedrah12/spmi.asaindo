<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Folder extends Model
{
    /**
     * Atribut yang bisa diisi massal.
     * 'parent_id' digunakan untuk menampung ID folder induk (jika ada).
     * Jika null, berarti ini adalah Root Folder.
     */
    protected $fillable = ['name', 'parent_id'];

    /**
     * Relasi One-to-Many ke model File.
     * Satu folder bisa memiliki banyak file.
     */
    public function files() {
        return $this->hasMany(File::class);
    }

    /**
     * 🔄 RELASI SELF-JOIN (REKURSIF)
     * Relasi ini menghubungkan model Folder ke dirinya sendiri.
     * Digunakan untuk mengambil daftar "Sub-folder" (anak).
     */
    public function children() {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    /**
     * 🛡️ MODEL BOOT / CASCADING DELETE
     * Logika ini sangat penting untuk menjaga kebersihan data dan file fisik.
     */
    protected static function booted()
    {
        static::deleting(function ($folder) {

            // 1. Hapus Semua File di Dalamnya
            // ⚠️ PENTING: Kita menggunakan 'each->delete()' (looping model),
            // BUKAN '$folder->files()->delete()' (query SQL raw).
            //
            // Alasannya: Agar event 'deleting' di Model 'File' (yang menghapus fisik file di storage)
            // tetap terpanggil untuk setiap file. Jika pakai query raw, file fisik tidak akan terhapus.
            $folder->files->each->delete();

            // 2. Hapus Semua Sub-folder (Rekursif)
            // Ini akan memicu event 'deleting' ini lagi pada setiap anak folder (Sub-folder).
            // Jadi jika kita menghapus folder induk, semua anak, cucu, dan file di dalamnya
            // akan ikut terhapus secara otomatis dan bersih.
            $folder->children->each->delete();
        });
    }
}
