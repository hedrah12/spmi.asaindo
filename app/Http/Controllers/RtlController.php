<?php

namespace App\Http\Controllers;

use App\Models\Standar;
use App\Models\Departemen;
use App\Models\JadwalAuditDetail;
use App\Models\Car;
use App\Models\Pami;
use App\Models\PamiUpload;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RtlController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $activeRole = session('active_role') ?? $user->getRoleNames()->first();
        $currentRole = strtolower($activeRole);

        // 1. LOGIC DEPARTEMEN (Sama dengan PTK/PAMI)
        // Admin/Superadmin lihat semua, User lihat sesuai hak
        $myDepartments = [];

        if (in_array($currentRole, ['superadmin', 'admin'])) {
            $myDepartments = Departemen::select('id_departemen as id', 'nama_departemen as nama')
                ->orderBy('nama_departemen', 'asc')
                ->get()
                ->toArray();
        } else {
            // Gabungan departemen dimana user sebagai Auditor ATAU Auditee (Lintas Tahun)
            $deptAsAuditor = JadwalAuditDetail::where('user_id', $user->id)->pluck('id_departemen')->toArray();
            $deptAsAuditee = Departemen::where('user_id', $user->id)->pluck('id_departemen')->toArray(); // Pemilik

            $allowedIds = array_unique(array_merge($deptAsAuditor, $deptAsAuditee));

            if (!empty($allowedIds)) {
                $myDepartments = Departemen::whereIn('id_departemen', $allowedIds)
                    ->select('id_departemen as id', 'nama_departemen as nama')
                    ->orderBy('nama_departemen', 'asc')
                    ->get()->toArray();
            }
        }

        // 2. VALIDASI DEPARTEMEN YANG DIPILIH
        $selectedDeptId = $request->input('dept_id');

        // Default ke dept pertama jika tidak ada pilihan/akses salah
        if (empty($selectedDeptId) && count($myDepartments) > 0) {
            $selectedDeptId = $myDepartments[0]['id'];
        }

        // Cek Validitas Akses (Kecuali admin bebas pilih ID valid)
        if (!in_array($currentRole, ['superadmin', 'admin'])) {
            $isAllowed = collect($myDepartments)->contains('id', $selectedDeptId);
            if (!$isAllowed && count($myDepartments) > 0) $selectedDeptId = $myDepartments[0]['id'];
        }

        // 3. QUERY DATA RTL (LINTAS TAHUN, STATUS != CLOSE)
        $data = [];
        if ($selectedDeptId) {

            // Cari semua Jadwal ID yang terkait dengan Departemen ini
            // Agar kita tidak salah ambil CAR milik departemen lain (untuk Standar Umum)
            $relatedJadwalIds = JadwalAuditDetail::where('id_departemen', $selectedDeptId)
                ->pluck('id_jadwal')
                ->toArray();

            $standars = Standar::query()
                ->where(function($q) use ($selectedDeptId) {
                    $q->where('id_departemen', $selectedDeptId)->orWhereNull('id_departemen');
                })
                // Filter: Hanya standar yang punya CAR belum Close di departemen ini
                ->whereHas('indikators.car', function($q) use ($relatedJadwalIds) {
                    $q->whereIn('id_jadwal', $relatedJadwalIds)
                      ->where('status', '!=', 'Close'); // INTI LOGIC RTL
                })
                ->with([
                    'indikators' => function($query) use ($relatedJadwalIds) {
                        $query->with(['pami' => function($q) use ($relatedJadwalIds) {
                            $q->whereIn('id_jadwal', $relatedJadwalIds)->with('uploads');
                        }]);
                        $query->with(['car' => function($q) use ($relatedJadwalIds) {
                            $q->whereIn('id_jadwal', $relatedJadwalIds)
                              ->where('status', '!=', 'Close'); // Load hanya yang belum close
                        }]);
                        // Tambahan: Load Jadwal untuk info Tahun
                        $query->with(['car.jadwal']);
                    }
                ])
                ->get();

            // MAPPING DATA
            $data = $standars->map(function($standar) {
                $filteredIndikators = $standar->indikators->map(function($ind) {
                    if (!$ind->car) return null; // Skip jika null (atau sudah close)

                    return [
                        'id' => $ind->id_indikator,
                        'pernyataan_indikator' => $ind->pernyataan_indikator,
                        'pami' => [
                            'id' => $ind->pami->id ?? null,
                            'skor' => $ind->pami->skor ?? '-',
                            'uploads' => $ind->pami->uploads ? $ind->pami->uploads->map(fn($u) => [
                                'id' => $u->id,
                                'file_path' => $u->file_path,
                                'file_name' => $u->file_name,
                                'keterangan' => $u->keterangan,
                                'created_at' => $u->created_at,
                            ]) : [],
                        ],
                        'car' => [
                            'id' => $ind->car->id,
                            'id_jadwal' => $ind->car->id_jadwal,
                            'id_indikator' => $ind->car->id_indikator,
                            'status' => $ind->car->status,
                            'temuan' => $ind->car->temuan,
                            'akar_masalah' => $ind->car->akar_masalah,
                            'tindakan_koreksi' => $ind->car->tindakan_koreksi,
                            'tanggal_pemenuhan' => $ind->car->tanggal_pemenuhan,
                            'tahun_audit' => $ind->car->jadwal->tahun ?? '-', // Info tambahan tahun
                            'link_bukti' => null,
                        ],
                    ];
                })->filter();

                if ($filteredIndikators->isEmpty()) return null;

                return [
                    'id' => $standar->id_standar,
                    'pernyataan_standar' => $standar->pernyataan_standar,
                    'indikators' => $filteredIndikators->values(),
                ];
            })->filter()->values();
        }

        return Inertia::render('rtl/Index', [
            'data' => $data,
            'meta' => [
                'role' => $currentRole,
                'nama_departemen' => collect($myDepartments)->firstWhere('id', $selectedDeptId)['nama'] ?? '-',
                'departemen_id' => (int)$selectedDeptId,
                'my_departments' => $myDepartments,
                'debug_message' => empty($data) && $selectedDeptId ? "Tidak ada tunggakan RTL untuk departemen ini." : null,
            ],
        ]);
    }

    // UPDATE MENGGUNAKAN LOGIC YANG SAMA DENGAN PTK/PAMI
    // Kita arahkan modal frontend ke route 'ptk.update' saja agar tidak duplikasi code,
    // atau buat route baru 'rtl.update' yang memanggil method ini.
    public function update(Request $request, $id)
    {
        // Re-use logic dari PtkController
        return app(PtkController::class)->update($request, $id);
    }
}
