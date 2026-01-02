<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Standar extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     * Mendefinisikan secara eksplisit bahwa model ini terikat ke tabel 'standars'.
     */
    protected $table = 'standars';

    /**
     * ⚠️ WAJIB: KONFIGURASI PRIMARY KEY (PK)
     * Laravel default-nya mencari kolom 'id'.
     * Karena tabel ini menggunakan 'id_standar', baris ini SANGAT PENTING.
     * Jika terlewat, fungsi delete() atau find($id) akan gagal.
     */
    protected $primaryKey = 'id_standar';

    /**
     * Mass Assignment Protection.
     * Daftar kolom yang aman untuk diisi via input form (create/update).
     */
    protected $fillable = [
        'pernyataan_standar', // Isi/Teks standar auditnya
        'id_kriteria',        // FK ke tabel Kriteria
        'id_departemen',      // FK ke tabel Departemen (Siapa penanggung jawab standar ini)
    ];

    /**
     * Relasi ke Model Kriteria (Many-to-One).
     * Membaca: "Standar ini merupakan bagian dari Kriteria X".
     * Parameter ke-2 ('id_kriteria') adalah nama kolom Foreign Key di tabel ini.
     */
    public function kriteria()
    {
        return $this->belongsTo(Kriteria::class, 'id_kriteria');
    }

    /**
     * Relasi ke Model Departemen (Many-to-One).
     * Membaca: "Standar ini dibebankan/dimiliki oleh Departemen Y".
     * Ini berguna untuk memfilter standar berdasarkan departemen auditee.
     */
    public function departemen()
    {
        return $this->belongsTo(Departemen::class, 'id_departemen');
    }

    public function indikators()
    {
        // Relasi ke tabel Indikator
        return $this->hasMany(Indikator::class, 'id_standar');
    }
}
