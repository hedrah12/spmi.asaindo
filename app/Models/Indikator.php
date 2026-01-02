<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Indikator extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     * Didefinisikan secara eksplisit untuk menghindari kesalahan konvensi penamaan jamak (plural).
     */
    protected $table = 'indikators';

    /**
     * ⚠️ KONFIGURASI PRIMARY KEY (PK)
     * Karena tabel database Anda menggunakan 'id_indikator' (bukan default 'id'),
     * baris ini SANGAT WAJIB.
     * Tanpa baris ini, Eloquent akan mencari kolom 'id' dan menyebabkan error saat update/delete.
     */
    protected $primaryKey = 'id_indikator';

    /**
     * Daftar kolom yang aman untuk diisi secara massal (Mass Assignment).
     * Pastikan semua input dari form ada di sini.
     */
    protected $fillable = [
        'pernyataan_indikator',
        'id_kriteria', // Foreign Key ke tabel Kriteria
        'id_standar',  // Foreign Key ke tabel Standar
    ];

    /**
     * Relasi ke Model Kriteria (Many-to-One).
     * Membaca: "Indikator ini milik sebuah Kriteria".
     * Parameter ke-2 ('id_kriteria') adalah nama kolom Foreign Key di tabel indikators ini.
     */
    public function kriteria()
    {
        return $this->belongsTo(Kriteria::class, 'id_kriteria');
    }

    /**
     * Relasi ke Model Standar (Many-to-One).
     * Membaca: "Indikator ini mengacu pada sebuah Standar".
     */
    public function standar()
    {
        return $this->belongsTo(Standar::class, 'id_standar');
    }
    /**
     * Relasi ke Model pami
     */
    public function pami()
    {
        return $this->hasOne(Pami::class, 'id_indikator', 'id_indikator');
    }

    public function car()
    {
        return $this->hasOne(Car::class, 'id_indikator', 'id_indikator');
    }
}
