<?php

namespace App\Imports;

use App\Models\Lingkup;
use App\Models\Kriteria;
use App\Models\Departemen;
use App\Models\Standar;
use App\Models\Indikator;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\DB;

class IndikatorImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Pastikan baris tidak kosong
        if (!isset($row['indikator']) || $row['indikator'] == null) {
            return null;
        }

        // 1. Cek/Buat LINGKUP
        $lingkup = Lingkup::firstOrCreate(
            ['nama_lingkup' => $row['lingkup']]
        );

        // 2. Cek/Buat KRITERIA (Di Excel header-nya "STANDAR")
        // Diasumsikan kolom "STANDAR" di Excel masuk ke tabel 'kriterias'
        $kriteria = Kriteria::firstOrCreate(
            [
                'kriteria' => $row['standar'],
                'id_lingkup' => $lingkup->id_lingkup // Menggunakan PK custom
            ]
        );

        // 3. Cek/Buat DEPARTEMEN
        // Jika departemen kosong di excel, biarkan null (karena di DB nullable)
        $departemenId = null;
        if (!empty($row['departemen'])) {
            $departemen = Departemen::firstOrCreate(
                ['nama_departemen' => $row['departemen']]
            );
            $departemenId = $departemen->id_departemen;
        }

        // 4. Cek/Buat STANDAR (Pernyataan Standar)
        $standar = Standar::firstOrCreate(
            [
                'pernyataan_standar' => $row['pernyataan_standar'],
                'id_kriteria' => $kriteria->id_kriteria,
                'id_departemen' => $departemenId
            ]
        );

        // 5. Buat INDIKATOR
        return new Indikator([
            'pernyataan_indikator' => $row['indikator'],
            'id_standar'  => $standar->id_standar,
            'id_kriteria' => $kriteria->id_kriteria // Sesuai struktur DB Anda yang meminta id_kriteria di tabel indikator
        ]);
    }
}
