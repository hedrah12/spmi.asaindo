<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lingkup extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     * Mengikat model ini secara eksplisit ke tabel 'lingkups'.
     */
    protected $table = 'lingkups';

    /**
     * KONFIGURASI PRIMARY KEY (CRITICAL)
     * Sama seperti model lainnya di project ini, karena database menggunakan
     * penamaan 'id_lingkup' (bukan 'id'), baris ini WAJIB ada.
     * Jika dihapus, fitur edit/hapus akan error.
     */
    protected $primaryKey = 'id_lingkup';

    /**
     * Mass Assignment Protection.
     * Mencegah input field tak dikenal masuk ke query database.
     */
    protected $fillable = [
        'nama_lingkup',
    ];

    /* * 💡 CATATAN RELASI (OPSIONAL):
     * Karena di model 'Kriteria' ada "belongsTo(Lingkup::class)",
     * biasanya di sini ada relasi kebalikannya (One-to-Many).
     * * Jika nanti Anda butuh menampilkan: "Lingkup A punya kriteria apa saja?",
     * Anda bisa tambahkan kode ini:
     * * public function kriteria()
     * {
     * return $this->hasMany(Kriteria::class, 'id_lingkup');
     * }
     */
}
