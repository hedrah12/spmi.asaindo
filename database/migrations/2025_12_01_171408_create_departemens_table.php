<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departemens', function (Blueprint $table) {
            $table->id(); // id autoincrement (default laravel)
            $table->string('nama_departemen');

            // user_id sebagai foreign key (opsional, jika ingin mencatat siapa pembuatnya)
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departemens');
    }
};
