<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kriteria extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     * Kita mendefinisikannya secara eksplisit untuk memastikan Eloquent
     * menarget tabel yang benar, meskipun nama modelnya singular.
     */
    protected $table = 'kriterias';

    /**
     * ⚠️ WAJIB: KONFIGURASI PRIMARY KEY (PK)
     * Laravel secara default menganggap PK adalah kolom bernama 'id'.
     * Karena database Anda menggunakan 'id_kriteria', baris ini WAJIB ada.
     * * Tanpa ini:
     * - Kriteria::find(1) -> Error atau return null
     * - $kriteria->save() -> Error saat update
     * - $kriteria->delete() -> Error "Unknown column id"
     */
    protected $primaryKey = 'id_kriteria';

    /**
     * Mass Assignment Protection.
     * Kolom-kolom yang diizinkan untuk diisi lewat method create() atau update().
     */
    protected $fillable = [
        'kriteria',   // Nama/Deskripsi Kriteria
        'id_lingkup', // Foreign Key
    ];

    /**
     * Relasi ke Model Lingkup (Many-to-One).
     * Membaca: "Satu Kriteria dimiliki oleh satu Lingkup".
     * * Contoh penggunaan:
     * $kriteria->lingkup->nama_lingkup; // Mengambil nama lingkup terkait
     */
    public function lingkup()
    {
        return $this->belongsTo(Lingkup::class, 'id_lingkup');
    }
}
