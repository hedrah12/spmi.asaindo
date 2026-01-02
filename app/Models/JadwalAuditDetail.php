<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalAuditDetail extends Model
{
    /**
     * Nama tabel di database.
     */
    protected $table = 'jadwal_audit_details';

    /**
     * ⚠️ KONFIGURASI PRIMARY KEY
     * Karena PK bukan 'id', ini wajib didefinisikan.
     */
    protected $primaryKey = 'id_jadwal_detail';

    /**
     * 🔓 MASS ASSIGNMENT
     * Semua kolom boleh diisi secara massal (create/update).
     */
    protected $guarded = [];

    /**
     * Relasi ke Model User (Auditor).
     * Foreign Key di tabel ini: 'user_id'
     * Owner Key di tabel users: 'id' (Default Laravel)
     */
    public function auditor()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Relasi ke Model Departemen (Auditee).
     * Foreign Key di tabel ini: 'id_departemen'
     * Owner Key di tabel departemens: 'id_departemen' (BUKAN 'id')
     * * PENTING: Parameter ke-3 wajib ada jika PK tabel lawan bukan 'id'.
     */
    public function departemen()
    {
        return $this->belongsTo(Departemen::class, 'id_departemen', 'id_departemen');
    }

    /**
     * Relasi ke Model JadwalAudit (Header).
     * Foreign Key di tabel ini: 'id_jadwal'
     * Owner Key di tabel jadwal_audits: 'id_jadwal' (BUKAN 'id')
     */
    public function jadwal()
    {
        return $this->belongsTo(JadwalAudit::class, 'id_jadwal', 'id_jadwal');
    }
}
