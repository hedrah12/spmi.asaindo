<?php

namespace App\Http\Controllers;

use App\Models\Standar;
use App\Models\JadwalAudit;
use App\Models\Departemen;
use App\Models\JadwalAuditDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PtkController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $activeRole = session('active_role') ?? $user->getRoleNames()->first();
        $currentRole = strtolower($activeRole);

        // 1. FILTER TAHUN & JADWAL
        $availableYears = JadwalAudit::select('tahun')->distinct()->orderBy('tahun', 'desc')->pluck('tahun')->toArray();
        $selectedYear = $request->input('tahun', $availableYears[0] ?? date('Y'));

        $jadwal = JadwalAudit::where('tahun', $selectedYear)->orderBy('id_jadwal', 'desc')->first();
        $jadwalId = $jadwal ? $jadwal->id_jadwal : null;

        // 2. LOGIC DEPARTEMEN
        $myDepartments = [];
        if ($jadwalId) {
            if (in_array($currentRole, ['superadmin', 'admin'])) {
                $myDepartments = Departemen::select('id_departemen as id', 'nama_departemen as nama')
                    ->orderBy('nama_departemen', 'asc')->get()->toArray();
            } else {
                $deptAsAuditor = JadwalAuditDetail::where('id_jadwal', $jadwalId)->where('user_id', $user->id)->pluck('id_departemen')->toArray();
                $deptAsAuditee = Departemen::where('user_id', $user->id)->pluck('id_departemen')->toArray();

                $allowedIds = array_unique(array_merge($deptAsAuditor, $deptAsAuditee));

                if (!empty($allowedIds)) {
                    $myDepartments = Departemen::whereIn('id_departemen', $allowedIds)
                        ->select('id_departemen as id', 'nama_departemen as nama')->orderBy('nama_departemen', 'asc')->get()->toArray();
                }
            }
        }

        // 3. SELEKSI DEPARTEMEN AKTIF
        $selectedDeptId = $request->input('dept_id');
        $isValidDept = collect($myDepartments)->contains('id', $selectedDeptId);

        if (!$selectedDeptId || (empty($myDepartments) && !$isValidDept)) {
            $selectedDeptId = $myDepartments[0]['id'] ?? null;
        }

        // 4. QUERY DATA (HANYA YANG PUNYA CAR / SUDAH DINILAI)
        $data = [];
        if ($jadwalId && $selectedDeptId) {

            // Definisikan closure filter agar bisa dipakai ulang
            // Logika: Ambil Indikator yang punya CAR di jadwal ini
            $indikatorFilter = function($query) use ($jadwalId) {
                $query->whereHas('car', function($q) use ($jadwalId) {
                    $q->where('id_jadwal', $jadwalId);
                })
                ->with([
                    'pami' => fn($q) => $q->where('id_jadwal', $jadwalId)->with('uploads'),
                    'car' => fn($q) => $q->where('id_jadwal', $jadwalId)
                ]);
            };

            $standars = Standar::query()
                // Filter Standar milik Dept terpilih (atau umum)
                ->where(function($q) use ($selectedDeptId) {
                    $q->where('id_departemen', $selectedDeptId)->orWhereNull('id_departemen');
                })
                // Filter Standar: Hanya ambil standar yang PUNYA indikator bermasalah (CAR)
                ->whereHas('indikators', function($q) use ($jadwalId) {
                     $q->whereHas('car', fn($sub) => $sub->where('id_jadwal', $jadwalId));
                })
                // Eager Load Indikator: TAPI HANYA indikator yang punya CAR
                ->with(['indikators' => $indikatorFilter])
                ->get();

            // Mapping Data (Cukup sederhana karena query sudah terfilter)
            $data = $standars->map(function($standar) {
                return [
                    'id' => $standar->id_standar,
                    'pernyataan_standar' => $standar->pernyataan_standar,
                    'indikators' => $standar->indikators // Indikator di sini sudah otomatis terfilter oleh query 'with' di atas
                ];
            });
        }

        return Inertia::render('ptk/Index', [
            'data' => $data,
            'meta' => [
                'role' => $currentRole,
                'nama_departemen' => collect($myDepartments)->firstWhere('id', $selectedDeptId)['nama'] ?? '-',
                'available_years' => $availableYears,
                'selected_year' => (string)$selectedYear,
                'departemen_id' => (int)$selectedDeptId,
                'my_departments' => $myDepartments,
                'has_schedule' => !is_null($jadwalId),
                'debug_message' => is_null($jadwalId) ? "Jadwal belum tersedia." : null
            ],
        ]);
    }
}
