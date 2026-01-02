<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Departemen (Master)
        Schema::create('departemens', function (Blueprint $table) {
            $table->bigIncrements('id_departemen'); // PK Custom
            $table->string('nama_departemen');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
        });

        // 2. Tabel Lingkup (Master)
        Schema::create('lingkups', function (Blueprint $table) {
            $table->bigIncrements('id_lingkup'); // PK Custom
            $table->string('nama_lingkup');
            $table->timestamps();
        });

        // 3. Tabel Kriteria (Anak dari Lingkup)
        Schema::create('kriterias', function (Blueprint $table) {
            $table->bigIncrements('id_kriteria'); // PK Custom
            $table->string('kriteria'); // Nama Kriteria

            // Relasi ke Lingkup
            $table->unsignedBigInteger('id_lingkup')->nullable();
            $table->foreign('id_lingkup')->references('id_lingkup')->on('lingkups')->onDelete('set null');

            $table->timestamps();
        });

        // 4. Tabel Standar (Anak dari Kriteria & Departemen)
        Schema::create('standars', function (Blueprint $table) {
            $table->bigIncrements('id_standar'); // PK Custom
            $table->text('pernyataan_standar');

            // Relasi ke Kriteria
            $table->unsignedBigInteger('id_kriteria')->nullable();
            $table->foreign('id_kriteria')->references('id_kriteria')->on('kriterias')->onDelete('cascade');

            // Relasi ke Departemen
            $table->unsignedBigInteger('id_departemen')->nullable();
            $table->foreign('id_departemen')->references('id_departemen')->on('departemens')->onDelete('set null');

            $table->timestamps();
        });

        // 5. Tabel Indikator (Anak dari Standar & Kriteria)
        Schema::create('indikators', function (Blueprint $table) {
            $table->bigIncrements('id_indikator'); // PK Custom
            $table->text('pernyataan_indikator');

            // Relasi ke Standar
            $table->unsignedBigInteger('id_standar')->nullable();
            $table->foreign('id_standar')->references('id_standar')->on('standars')->onDelete('cascade');

            // Relasi ke Kriteria (Redudansi opsional, tapi diminta di struktur)
            $table->unsignedBigInteger('id_kriteria')->nullable();
            $table->foreign('id_kriteria')->references('id_kriteria')->on('kriterias')->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        // Hapus urutan dari anak ke induk
        Schema::dropIfExists('indikators');
        Schema::dropIfExists('standars');
        Schema::dropIfExists('kriterias');
        Schema::dropIfExists('lingkups');
        Schema::dropIfExists('departemens');
    }
};
