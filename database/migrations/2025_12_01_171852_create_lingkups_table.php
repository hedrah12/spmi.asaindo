<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lingkups', function (Blueprint $table) {
            $table->id(); // PK (id autoincrement)
            $table->string('nama_lingkup'); // Sesuai permintaan
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lingkups');
    }
};
