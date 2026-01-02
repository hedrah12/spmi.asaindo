<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Departemen extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     * Laravel sebenarnya otomatis mencari tabel 'departemens' (plural),
     * tapi mendefinisikan ini secara eksplisit adalah praktik yang baik.
     */
    protected $table = 'departemens';

    /**
     * ⚠️ KONFIGURASI PENTING: PRIMARY KEY
     * Secara default, Laravel menganggap Primary Key bernama 'id'.
     * Karena tabel Anda menggunakan 'id_departemen', kita WAJIB mendefinisikannya di sini.
     * Jika tidak, fungsi seperti find(), save(), atau delete() akan error.
     */
    protected $primaryKey = 'id_departemen';

    /**
     * Mass Assignment Protection.
     * Daftar kolom yang diizinkan untuk diisi secara massal via method
     * create() atau update(). Ini fitur keamanan agar user tidak bisa
     * menyisipkan data ke kolom sensitif (misal: 'is_admin') secara paksa.
     */
    protected $fillable = [
        'nama_departemen',
        'user_id',
    ];
    protected $guarded = [];
    /**
     * Relasi ke Model User (Many-to-One / Belongs To).
     * Artinya: Satu departemen "dimiliki" atau "dikepalai" oleh satu User.
     * * Parameter ke-2 ('user_id') adalah nama Foreign Key di tabel departemens.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
