<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('standars', function (Blueprint $table) {
            $table->id(); // PK (id auto increment)

            // Kolom sesuai permintaan Anda
            $table->string('pernyataan_standar');

            // Foreign Keys (Nullable dulu agar tidak error jika data master belum ada)
            $table->unsignedBigInteger('id_kriteria')->nullable();
            $table->unsignedBigInteger('id_departemen')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('standars');
    }
};
