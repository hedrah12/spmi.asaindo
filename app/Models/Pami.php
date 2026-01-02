<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pami extends Model
{
    protected $table = 'pamis';
    protected $guarded = [];

    // --- TAMBAHKAN INI ---

    // Relasi balik ke Indikator (Penting)
    public function indikator()
    {
        return $this->belongsTo(Indikator::class, 'id_indikator', 'id_indikator');
    }

    // Relasi balik ke Jadwal (Penting untuk filter tahun)
    public function jadwal()
    {
        return $this->belongsTo(JadwalAudit::class, 'id_jadwal', 'id_jadwal');
    }

    // ---------------------

    public function uploads()
    {
        return $this->hasMany(PamiUpload::class, 'id_pami')->latest();
    }
}
