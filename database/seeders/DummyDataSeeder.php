<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DummyDataSeeder extends Seeder
{
    public function run()
    {
        /* ============================
         * 1. DEPARTEMEN / BIRO / UNIT
         * ============================ */
        DB::table('departemens')->insert([
            ['nama_departemen' => 'Biro Administrasi Akademik (BAA)', 'created_at' => now()],
            ['nama_departemen' => 'Biro Administrasi Umum & Keuangan (BAUK)', 'created_at' => now()],
            ['nama_departemen' => 'Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM)', 'created_at' => now()],
            ['nama_departemen' => 'Pusat Karier & Alumni', 'created_at' => now()],
            ['nama_departemen' => 'Pusat Sistem Informasi', 'created_at' => now()],
        ]);

        /* ============================
         * 2. LINGKUP (PRODI / FAKULTAS)
         * ============================ */
        DB::table('lingkups')->insert([
            ['nama_lingkup' => 'Program Studi S1 Teknik Informatika', 'created_at' => now()],
            ['nama_lingkup' => 'Program Studi S1 Sistem Informasi', 'created_at' => now()],
            ['nama_lingkup' => 'Program Studi S1 Manajemen', 'created_at' => now()],
            ['nama_lingkup' => 'Program Studi D3 Perhotelan', 'created_at' => now()],
            ['nama_lingkup' => 'Fakultas Ekonomi & Bisnis', 'created_at' => now()],
            ['nama_lingkup' => 'Fakultas Ilmu Komputer', 'created_at' => now()],
        ]);

        /* ============================
         * 3. STANDAR (IKK BAN-PT / Internal)
         * ============================ */
        DB::table('standars')->insert([
            ['pernyataan_standar' => 'Standar Kompetensi Lulusan (SKL)', 'created_at' => now()],
            ['pernyataan_standar' => 'Standar Isi Pembelajaran', 'created_at' => now()],
            ['pernyataan_standar' => 'Standar Proses Pembelajaran', 'created_at' => now()],
            ['pernyataan_standar' => 'Standar Penilaian Pembelajaran', 'created_at' => now()],
            ['pernyataan_standar' => 'Standar Dosen dan Tenaga Kependidikan', 'created_at' => now()],
        ]);

        /* ============================
         * 4. KRITERIA BAN-PT
         * ============================ */
        DB::table('kriterias')->insert([
            ['kriteria' => 'C1. Visi, Misi, Tujuan, dan Strategi', 'created_at' => now()],
            ['kriteria' => 'C2. Tata Pamong, Tata Kelola, dan Kerjasama', 'created_at' => now()],
            ['kriteria' => 'C3. Mahasiswa', 'created_at' => now()],
            ['kriteria' => 'C4. Sumber Daya Manusia (Dosen & Tendik)', 'created_at' => now()],
            ['kriteria' => 'C5. Keuangan, Sarana dan Prasarana', 'created_at' => now()],
            ['kriteria' => 'C6. Pendidikan', 'created_at' => now()],
            ['kriteria' => 'C7. Penelitian', 'created_at' => now()],
            ['kriteria' => 'C8. Pengabdian kepada Masyarakat', 'created_at' => now()],
            ['kriteria' => 'C9. Luaran dan Capaian Tridharma', 'created_at' => now()],
        ]);

        /* ============================
         * 5. INDIKATOR (REALISTIS)
         * ============================ */
        DB::table('indikators')->insert([
            [
                'pernyataan_indikator' => 'Dokumen visi dan misi universitas telah disahkan oleh senat dan disosialisasikan ke seluruh pemangku kepentingan.',
                'id_kriteria' => 1, // C1
                'id_standar' => null,
                'created_at' => now()
            ],
            [
                'pernyataan_indikator' => 'Universitas memiliki 10+ kerjasama aktif dengan industri dan institusi pendidikan.',
                'id_kriteria' => 2, // C2
                'id_standar' => null,
                'created_at' => now()
            ],
            [
                'pernyataan_indikator' => 'Rasio dosen tetap terhadap mahasiswa memenuhi standar minimum BAN-PT (1:30).',
                'id_kriteria' => 4, // C4
                'id_standar' => 5, // Standar Dosen
                'created_at' => now()
            ],
            [
                'pernyataan_indikator' => 'Seluruh mata kuliah telah memiliki RPS yang sesuai standar nasional pendidikan tinggi (SN-Dikti).',
                'id_kriteria' => 6, // C6
                'id_standar' => 3, // Standar Proses Pembelajaran
                'created_at' => now()
            ],
            [
                'pernyataan_indikator' => 'Setiap dosen menghasilkan minimal 1 publikasi per tahun di jurnal nasional/ internasional.',
                'id_kriteria' => 7, // C7 Penelitian
                'id_standar' => null,
                'created_at' => now()
            ],
            [
                'pernyataan_indikator' => 'Seluruh prodi melaksanakan minimal 2 kegiatan pengabdian masyarakat setiap tahun.',
                'id_kriteria' => 8, // C8 PKM
                'id_standar' => null,
                'created_at' => now()
            ],
            [
                'pernyataan_indikator' => 'Tingkat kelulusan tepat waktu mahasiswa mencapai lebih dari 70%.',
                'id_kriteria' => 9, // C9 Capaian
                'id_standar' => 1,
                'created_at' => now()
            ],
        ]);
    }
}
