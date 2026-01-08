<?php

namespace App\Imports;

use App\Models\PublicDoc;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
// Hapus use WithCustomCsvSettings;

class PublicDocsImport implements ToModel, WithHeadingRow // Hapus interface WithCustomCsvSettings
{
    private $parentId;

    public function __construct($parentId)
    {
        $this->parentId = $parentId;
    }

    public function model(array $row)
    {
        // [DEBUGGING]
        // Jika import gagal, buka storage/logs/laravel.log untuk melihat apa isi $row sebenarnya
        // \Illuminate\Support\Facades\Log::info('Row Data:', $row);

        // Validasi Key: Pastikan header excel tertulis 'name' dan 'url' (huruf kecil)
        if (!isset($row['name']) || !isset($row['url'])) {
            return null;
        }

        return new PublicDoc([
            'name'      => $row['name'],
            'url'       => $row['url'],
            'type'      => 'file',
            'parent_id' => $this->parentId,
            'is_active' => true,
        ]);
    }

    // HAPUS function getCsvSettings() agar kembali ke pengaturan default (Auto-detect)
}
