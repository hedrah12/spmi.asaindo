<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('pami_uploads', function (Blueprint $table) {
            // Menambahkan kolom keterangan yang boleh kosong (nullable)
            $table->text('keterangan')->nullable()->after('file_name');

            // Ubah kolom file_path dan file_name jadi nullable
            // (karena user bisa saja cuma kirim teks tanpa file)
            $table->string('file_path')->nullable()->change();
            $table->string('file_name')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('pami_uploads', function (Blueprint $table) {
            $table->dropColumn('keterangan');
            // Kembalikan ke tidak nullable (opsional, tergantung kebutuhan rollback)
            //$table->string('file_path')->nullable(false)->change();
        });
    }
};
