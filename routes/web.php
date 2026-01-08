<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    PtkController,
    RtlController,
    MenuController,
    NewsController,
    PamiController,
    RoleController,
    UserController,
    BackupController,
    LingkupController,
    StandarController,
    AuditLogController,
    KriteriaController,
    IndikatorController,
    DepartemenController,
    PermissionController,
    SettingAppController,
    FileManagerController,
    JadwalAuditController,
    CarController,
    PencatatanAmiController,
    PublicDocController,
    PublicController,
    DashboardController
};

/*
|--------------------------------------------------------------------------
| Public Routes (Tanpa Login)
|--------------------------------------------------------------------------
| Dihandle oleh PublicController untuk tampilan pengunjung
*/

Route::controller(PublicController::class)->group(function () {
    Route::get('/', 'home')->name('home');
    Route::get('/berita', 'berita')->name('public.news.index');
    Route::get('/berita/{slug}', 'beritaShow')->name('public.news.show');
    Route::get('/dokumen', 'dokumen')->name('public.dokumen');
    Route::get('/kontak', 'kontak')->name('public.contact');
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Basic)
|--------------------------------------------------------------------------
| Route di sini BISA diakses user login WALAPUN belum punya izin menu.
| Cocok untuk fungsi utilitas seperti Download, Switch Role, Profile, dll.
*/
Route::middleware(['auth'])->group(function () {

    // 1. Switch Role
    Route::post('/switch-role', [RoleController::class, 'switchRole'])->name('role.switch');

    // 2. Download Routes (Dipindahkan kesini agar tidak kena blokir Permission Menu 403)
    Route::get('/pami/download/{id}', [PamiController::class, 'download'])->name('pami.download');
    Route::get('/backup/download/{file}', [BackupController::class, 'download'])->name('backup.download');
});

/*
|--------------------------------------------------------------------------
| Authenticated & Permission Checked Routes
|--------------------------------------------------------------------------
| Route di sini memerlukan Role Aktif dan Izin Akses Menu (Database Permissions)
| Prefix: /admin (opsional, tapi biasanya admin ada di root dashboard)
*/
Route::middleware(['auth', 'menu.permission'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
    /*
    |--------------------------------------------------------------------------
    | System Management (User, Role, Menu, Permission)
    |--------------------------------------------------------------------------
    */
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);

    Route::resource('users', UserController::class);
    Route::put('/users/{user}/reset-password', [UserController::class, 'resetPassword'])
        ->name('users.reset-password');

    Route::resource('menus', MenuController::class);
    Route::post('menus/reorder', [MenuController::class, 'reorder'])->name('menus.reorder');

    /*
    |--------------------------------------------------------------------------
    | Settings & Logs
    |--------------------------------------------------------------------------
    */
    Route::get('/settingsapp', [SettingAppController::class, 'edit'])->name('setting.edit');
    Route::post('/settingsapp', [SettingAppController::class, 'update'])->name('setting.update');
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    /*
    |--------------------------------------------------------------------------
    | Backup Management
    |--------------------------------------------------------------------------
    */
    Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
    Route::post('/backup/run', [BackupController::class, 'run'])->name('backup.run');
    Route::delete('/backup/delete/{file}', [BackupController::class, 'delete'])->name('backup.delete');

    /*
    |--------------------------------------------------------------------------
    | SPMI Master Data
    |--------------------------------------------------------------------------
    */
    Route::resource('indikator', IndikatorController::class);
    Route::resource('lingkup', LingkupController::class);
    Route::resource('departemen', DepartemenController::class);
    Route::resource('standar', StandarController::class);
    Route::resource('kriteria', KriteriaController::class);

    Route::post('/indikator/import', [IndikatorController::class, 'import'])->name('indikator.import');

    /*
    |--------------------------------------------------------------------------
    | SPMI - PAMI (Pencatatan Audit) & CAR
    |--------------------------------------------------------------------------
    */
    // Halaman Index & Store Nilai
    Route::get('/pami', [PamiController::class, 'index'])->name('pami.index');
    Route::post('/pami/store', [PamiController::class, 'store'])->name('pami.store');

    // File Action
    Route::delete('/pami/file/{id}', [PamiController::class, 'deleteFile'])->name('pami.file.delete');

    // CAR Actions
    Route::post('/pami/car/store', [CarController::class, 'store'])->name('pami.car.store'); // Create
    Route::post('/pami/car/respond', [PamiController::class, 'respondCar'])->name('pami.car.respond'); // Auditee Respond
    Route::post('/pami/car/verify', [PamiController::class, 'verifyCar'])->name('pami.car.verify'); // Auditor Verify
    Route::get('/pami/print', [PamiController::class, 'print'])->name('pami.print');

    // Pencatatan AMI Print/View
    Route::get('/pencatatanami', [PencatatanAmiController::class, 'index'])->name('pencatatan.index');
    Route::get('/pencatatanami/print/{id_indikator}', [PencatatanAmiController::class, 'print'])->name('pencatatan.print');

    /*
    |--------------------------------------------------------------------------
    | SPMI - Tindakan Koreksi (PTK) & RTL
    |--------------------------------------------------------------------------
    */
    Route::get('/ptk', [PtkController::class, 'index'])->name('ptk.index');
    Route::patch('/ptk/{id}', [PtkController::class, 'update'])->name('ptk.update');

    Route::get('/rtl', [RtlController::class, 'index'])->name('rtl.index');
    Route::patch('/rtl/{id}', [RtlController::class, 'update'])->name('rtl.update');

    /*
    |--------------------------------------------------------------------------
    | Jadwal Audit Management
    |--------------------------------------------------------------------------
    */
    Route::get('/jadwal', [JadwalAuditController::class, 'index'])->name('jadwal.index');
    Route::post('/jadwal', [JadwalAuditController::class, 'store'])->name('jadwal.store');
    Route::put('/jadwal/{id}', [JadwalAuditController::class, 'update'])->name('jadwal.update');
    Route::delete('/jadwal/{id}', [JadwalAuditController::class, 'destroy'])->name('jadwal.destroy');
    Route::get('/jadwal/{id}/export', [JadwalAuditController::class, 'exportChecklist'])->name('jadwal.export');

    /*
    |--------------------------------------------------------------------------
    | File Manager (DSPMI)
    |--------------------------------------------------------------------------
    */
    Route::get('/dspmi', [FileManagerController::class, 'index'])->name('dspmi.index');

    // Folder Actions
    Route::post('/folder', [FileManagerController::class, 'storeFolder'])->name('folder.store');
    Route::put('/folder/{folder}', [FileManagerController::class, 'updateFolder'])->name('folder.update');
    Route::delete('/folder/{folder}', [FileManagerController::class, 'destroyFolder'])->name('folder.destroy');

    // File Actions
    Route::post('/file', [FileManagerController::class, 'storeFile'])->name('file.store');
    Route::delete('/file/{file}', [FileManagerController::class, 'destroyFile'])->name('file.destroy');

    /*
    |--------------------------------------------------------------------------
    | CMS Management (Berita & Dokumen Publik)
    |--------------------------------------------------------------------------
    */
    Route::post('/docs/import', [PublicDocController::class, 'import'])->name('docs.import');
    Route::resource('docs', PublicDocController::class);
    Route::resource('news', NewsController::class);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
