<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kriterias', function (Blueprint $table) {
            $table->id(); // id autoincrement
            $table->string('kriteria'); // namaKriteria
            $table->integer('id_lingkup')->nullable(); // id_lingkup (opsional, sesuaikan kebutuhan)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kriterias');
    }
};
