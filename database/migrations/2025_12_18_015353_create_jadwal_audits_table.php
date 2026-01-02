<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ==========================================================
        // 1. TABEL JADWAL AUDIT
        // ==========================================================
        if (!Schema::hasTable('jadwal_audits')) {
            Schema::create('jadwal_audits', function (Blueprint $table) {
                $table->bigIncrements('id_jadwal');
                $table->string('tahun', 4);
                $table->date('tgl_mulai');
                $table->date('tgl_selesai');
                $table->string('no_sk')->nullable();
                $table->timestamps();
            });
        }

        // ==========================================================
        // 2. TABEL JADWAL DETAIL (Penugasan)
        // ==========================================================
        if (!Schema::hasTable('jadwal_audit_details')) {
            Schema::create('jadwal_audit_details', function (Blueprint $table) {
                $table->bigIncrements('id_jadwal_detail');
                $table->unsignedBigInteger('id_jadwal');
                $table->unsignedBigInteger('user_id'); // Auditor
                $table->unsignedBigInteger('id_departemen'); // Auditee

                // Foreign Keys
                $table->foreign('id_jadwal')->references('id_jadwal')->on('jadwal_audits')->onDelete('cascade');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('id_departemen')->references('id_departemen')->on('departemens')->onDelete('cascade');

                $table->timestamps();
            });
        }

        // ==========================================================
        // 3. TABEL PAMI (Skor & Catatan)
        // ==========================================================
        if (!Schema::hasTable('pamis')) {
            // A. Jika tabel belum ada, buat baru dengan struktur FINAL
            Schema::create('pamis', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('id_jadwal');
                $table->unsignedBigInteger('id_indikator');

                // Struktur Final: Skor String & Ada Catatan
                $table->string('skor')->nullable();
                $table->text('catatan_auditor')->nullable();

                $table->timestamps();

                $table->foreign('id_jadwal')->references('id_jadwal')->on('jadwal_audits')->onDelete('cascade');
                $table->foreign('id_indikator')->references('id_indikator')->on('indikators')->onDelete('cascade');
                $table->unique(['id_jadwal', 'id_indikator']);
            });
        } else {
            // B. Jika tabel SUDAH ADA, update strukturnya (Safe Update)
            Schema::table('pamis', function (Blueprint $table) {
                // 1. Ubah tipe skor jadi string (atasi error Incorrect Integer)
                // Note: Pastikan package 'doctrine/dbal' terinstall jika pakai Laravel versi lama. Laravel 10+ native.
                $table->string('skor')->nullable()->change();

                // 2. Tambah kolom catatan jika belum ada
                if (!Schema::hasColumn('pamis', 'catatan_auditor')) {
                    $table->text('catatan_auditor')->nullable();
                }
            });
        }

        // ==========================================================
        // 4. TABEL PAMI UPLOADS (Bukti)
        // ==========================================================
        if (!Schema::hasTable('pami_uploads')) {
            Schema::create('pami_uploads', function (Blueprint $table) {
                $table->id();
                $table->foreignId('id_pami')->constrained('pamis')->onDelete('cascade');
                $table->string('file_path');
                $table->string('file_name');
                $table->string('uploaded_by_role')->default('auditee');
                $table->timestamps();
            });
        }

        // ==========================================================
        // 5. TABEL CAR (Corrective Action Request)
        // ==========================================================
        if (!Schema::hasTable('cars')) {
            // A. Buat Baru
            Schema::create('cars', function (Blueprint $table) {
                $table->id();
                $table->foreignId('id_jadwal')->constrained('jadwal_audits', 'id_jadwal')->onDelete('cascade');
                $table->foreignId('id_indikator')->constrained('indikators', 'id_indikator')->onDelete('cascade');

                $table->string('ketidaksesuaian'); // Observasi/Minor/Mayor
                $table->text('temuan')->nullable();
                $table->text('akar_masalah')->nullable();
                $table->text('tindakan_koreksi')->nullable();
                $table->date('tanggal_pemenuhan')->nullable();

                $table->string('status')->default('OPEN'); // OPEN, SUBMITTED, REVISI, CLOSED

                $table->timestamps();
            });
        } else {
            // B. Update jika tabel ada tapi kolom status belum ada
            if (!Schema::hasColumn('cars', 'status')) {
                Schema::table('cars', function (Blueprint $table) {
                    $table->string('status')->default('OPEN');
                });
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('cars');
        Schema::dropIfExists('pami_uploads');
        Schema::dropIfExists('pamis');
        Schema::dropIfExists('jadwal_audit_details');
        Schema::dropIfExists('jadwal_audits');
    }
};
