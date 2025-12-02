<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indikators', function (Blueprint $table) {
            $table->id(); // PK (id auto increment)

            // Kolom sesuai permintaan Anda
            $table->text('pernyataan_indikator');

            // Foreign Keys (Nullable dulu)
            $table->unsignedBigInteger('id_kriteria')->nullable();
            $table->unsignedBigInteger('id_standar')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('indikators');
    }
};
