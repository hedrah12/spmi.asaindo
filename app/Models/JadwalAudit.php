<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalAudit extends Model
{
    /**
     * Nama tabel di database.
     */
    protected $table = 'jadwal_audits';

    /**
     * ⚠️ KONFIGURASI PRIMARY KEY
     * Karena tabel menggunakan 'id_jadwal' (bukan default 'id'), kita wajib mendefinisikannya.
     * Ini penting agar fungsi find($id) atau route binding bekerja dengan benar.
     */
    protected $primaryKey = 'id_jadwal';

    /**
     * 🔓 MASS ASSIGNMENT: GUARDED vs FILLABLE
     * Berbeda dengan model lain yang menggunakan '$fillable' (Whitelist/Daftar Putih),
     * model ini menggunakan '$guarded' (Blacklist/Daftar Hitam).
     * * - $guarded = []; // Array kosong artinya TIDAK ADA kolom yang dilarang.
     * Semua kolom di tabel ini BOLEH diisi secara massal (create/update).
     * * Keuntungannya: Lebih praktis, tidak perlu update model setiap nambah kolom baru.
     * Risikonya: Harus hati-hati validasi di Controller agar user tidak input data sembarangan.
     */
    protected $guarded = [];

    /**
     * Relasi One-to-Many ke Detail (Header-Detail Pattern).
     * * Konsepnya:
     * - JadwalAudit (Header): Menyimpan info umum (Tahun, No SK, Tanggal Mulai/Selesai).
     * - JadwalAuditDetail (Detail): Menyimpan baris-baris isinya (Siapa Auditornya, Ke Departemen mana).
     * * Param ke-2 ('id_jadwal') adalah Foreign Key yang ada di tabel 'jadwal_audit_details'.
     */
    public function details()
    {
        return $this->hasMany(JadwalAuditDetail::class, 'id_jadwal');
    }
}
