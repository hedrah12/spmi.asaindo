<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('butir_kriteria', function (Blueprint $table) {
            $table->id();
            $table->string('element');
            $table->text('indikator');
            $table->string('prodi');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('butir_kriteria');
    }
};
