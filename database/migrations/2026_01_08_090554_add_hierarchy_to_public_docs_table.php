<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('public_docs', function (Blueprint $table) {
        $table->string('type')->default('file'); // 'folder' atau 'file'
        $table->foreignId('parent_id')->nullable()->constrained('public_docs')->onDelete('cascade');
        $table->string('url')->nullable()->change(); // URL boleh kosong jika tipe = folder
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('public_docs', function (Blueprint $table) {
            //
        });
    }
};
