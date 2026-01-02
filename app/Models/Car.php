<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    protected $table = 'cars';
    protected $primaryKey = 'id';
    protected $guarded = [];

    /**
     * Relasi ke Jadwal Audit (PENTING untuk fitur RTL)
     * Agar kita tahu temuan ini milik audit tahun berapa.
     */
    public function jadwal()
    {
        return $this->belongsTo(JadwalAudit::class, 'id_jadwal', 'id_jadwal');
    }

    /**
     * Relasi ke Indikator (Opsional, tapi bagus untuk dimiliki)
     */
    public function indikator()
    {
        return $this->belongsTo(Indikator::class, 'id_indikator', 'id_indikator');
    }
}
