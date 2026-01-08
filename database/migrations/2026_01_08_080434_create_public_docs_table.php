<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_docs', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama Dokumen (Judul)
            $table->text('url');    // Link URL (misal: GDrive, Dropbox, website luar)
            $table->boolean('is_active')->default(true); // Opsi untuk menyembunyikan tanpa menghapus
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('public_docs');
    }
};
