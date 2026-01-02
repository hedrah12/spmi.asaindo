<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SettingApp;

class SettingAppSeeder extends Seeder
{
    public function run(): void
    {
        SettingApp::updateOrCreate(
            ['id' => 1],
            [
                'nama_app' => 'Sistem Penjamin Mutu Internal',
                'deskripsi' => 'Sistem Penjaminan Mutu Internal (SPMI)...',
                'logo' => 'logo/SPMI.png',      // path dari folder public/storage
                'favicon' => 'Favicon/SPMI.ico',   // bisa pakai file berbeda jika perlu
                'warna' => '#0ea5e9',
                'seo' => json_encode([
                    'title' => 'Sistem Penjaminan Mutu Internal (SPMI) – Universitas Asa Indonesia',
                    'description' => 'Sistem Penjaminan Mutu Internal (SPMI) Universitas Asa Indonesia...',
                    'keywords' => 'SPMI, Sistem Penjaminan Mutu Internal, mutu pendidikan tinggi,...'
                ])
            ]
        );
    }
}
