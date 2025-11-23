<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PtkController;
use App\Http\Controllers\RtlController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\PamiController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DspmiController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\SppeppController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\UserFileController;
use App\Http\Controllers\KkriteriaController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\SettingAppController;
use App\Http\Controllers\MediaFolderController;
use App\Http\Controllers\ButirKriteriaController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Group Middleware Utama
Route::middleware(['auth', 'menu.permission'])->group(function () {

    Route::get('dashboard', function () {
        //dd('Role di Session adalah: ' . session('active_role'));
        return Inertia::render('dashboard');
    })->name('dashboard');

    // --- ROLE SWITCHER ---
    // Definisikan route ini sebelum route resource agar tidak tertimpa
    Route::post('/switch-role', [RoleController::class, 'switchRole'])->name('role.switch');

    // --- MANAJEMEN ROLE (CRUD) ---
    Route::resource('roles', RoleController::class);

    // --- MANAJEMEN MENU ---
    Route::resource('menus', MenuController::class);
    Route::post('menus/reorder', [MenuController::class, 'reorder'])->name('menus.reorder');

    // --- MANAJEMEN USER & PERMISSION ---
    Route::resource('permissions', PermissionController::class);
    Route::resource('users', UserController::class);
    Route::put('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');

    // --- SETTINGS & TOOLS ---
    Route::get('/settingsapp', [SettingAppController::class, 'edit'])->name('setting.edit');
    Route::post('/settingsapp', [SettingAppController::class, 'update'])->name('setting.update');
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // --- BACKUP ---
    Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
    Route::post('/backup/run', [BackupController::class, 'run'])->name('backup.run');
    Route::get('/backup/download/{file}', [BackupController::class, 'download'])->name('backup.download');
    Route::delete('/backup/delete/{file}', [BackupController::class, 'delete'])->name('backup.delete');

    // --- FILES & MEDIA ---
    Route::get('/files', [UserFileController::class, 'index'])->name('files.index');
    Route::post('/files', [UserFileController::class, 'store'])->name('files.store');
    Route::delete('/files/{id}', [UserFileController::class, 'destroy'])->name('files.destroy');
    Route::resource('media', MediaFolderController::class);

    // --- MODULE LAINNYA ---
    Route::get('/butirkriteria', [ButirKriteriaController::class, 'index'])->name('butirkriteria.index');
    Route::get('/pami', [PamiController::class, 'index'])->name('pami.index');
    Route::get('/ptk', [PtkController::class, 'index'])->name('ptk.index');
    Route::get('/rtl', [RtlController::class, 'index'])->name('rtl.index');
    Route::get('/dspmi', [DspmiController::class, 'index'])->name('dspmi.index');
    Route::get('/sppepp', [SppeppController::class, 'index'])->name('sppepp.index');
    Route::get('/kkriteria', [KkriteriaController::class, 'index'])->name('kkriteria.index');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
