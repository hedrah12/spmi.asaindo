<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('butir_kriteria', function (Blueprint $table) {
            $table->string('lingkup')->nullable();
            $table->string('auditor')->nullable();
            $table->string('auditee')->nullable();
            $table->string('siklus')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('butir_kriteria', function (Blueprint $table) {
            $table->dropColumn(['lingkup', 'auditor', 'auditee', 'siklus']);
        });
    }
};
