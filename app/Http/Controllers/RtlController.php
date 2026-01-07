<?php

namespace App\Http\Controllers;

use App\Models\Standar;
use App\Models\Departemen;
use App\Models\JadwalAuditDetail;
use App\Models\Car;
use App\Models\Pami;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class RtlController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $activeRole = session('active_role') ?? $user->getRoleNames()->first();
        $currentRole = strtolower($activeRole);

        // 1. LOGIC DEPARTEMEN
        $myDepartments = [];

        if (in_array($currentRole, ['superadmin', 'admin'])) {
            $myDepartments = Departemen::select('id_departemen as id', 'nama_departemen as nama')
                ->orderBy('nama_departemen', 'asc')
                ->get()->toArray();
        } else {
            $deptAsAuditor = JadwalAuditDetail::where('user_id', $user->id)->pluck('id_departemen')->toArray();
            $deptAsAuditee = Departemen::where('user_id', $user->id)->pluck('id_departemen')->toArray();
            $allowedIds = array_unique(array_merge($deptAsAuditor, $deptAsAuditee));

            if (!empty($allowedIds)) {
                $myDepartments = Departemen::whereIn('id_departemen', $allowedIds)
                    ->select('id_departemen as id', 'nama_departemen as nama')
                    ->orderBy('nama_departemen', 'asc')
                    ->get()->toArray();
            }
        }

        // 2. VALIDASI DEPARTEMEN
        $selectedDeptId = $request->input('dept_id');
        if (empty($selectedDeptId) && count($myDepartments) > 0) {
            $selectedDeptId = $myDepartments[0]['id'];
        }
        if (!in_array($currentRole, ['superadmin', 'admin'])) {
            $isAllowed = collect($myDepartments)->contains('id', $selectedDeptId);
            if (!$isAllowed && count($myDepartments) > 0) $selectedDeptId = $myDepartments[0]['id'];
        }

        // 3. QUERY DATA RTL (LINTAS TAHUN)
        $data = [];
        if ($selectedDeptId) {
            $relatedJadwalIds = JadwalAuditDetail::where('id_departemen', $selectedDeptId)
                ->pluck('id_jadwal')
                ->toArray();

            $standars = Standar::query()
                ->whereHas('indikators.car', function ($q) use ($relatedJadwalIds) {
                    $q->whereIn('id_jadwal', $relatedJadwalIds)
                        ->where('status', '!=', 'Close');
                })
                ->get();

            // MAPPING DATA (Stacked Row Logic)
            $data = $standars->map(function ($standar) use ($relatedJadwalIds) {

                $mappedIndikators = $standar->indikators->map(function ($ind) use ($relatedJadwalIds) {

                    // CARI SEMUA CAR ACTIVE (LINTAS TAHUN)
                    $activeCars = Car::where('id_indikator', $ind->id_indikator)
                        ->whereIn('id_jadwal', $relatedJadwalIds)
                        ->where('status', '!=', 'Close')
                        ->with('jadwal')
                        ->orderBy('id_jadwal', 'desc')
                        ->get();

                    if ($activeCars->isEmpty()) return null;

                    return [
                        'id_indikator' => $ind->id_indikator,
                        'pernyataan_indikator' => $ind->pernyataan_indikator,

                        // KIRIM SEBAGAI ARRAY 'cars'
                        'cars' => $activeCars->map(function($car) use ($ind) {

                            $pamiTepat = Pami::where('id_indikator', $ind->id_indikator)
                                ->where('id_jadwal', $car->id_jadwal)
                                ->with('uploads')
                                ->first();

                            return [
                                'id' => $car->id,
                                'id_jadwal' => $car->id_jadwal,
                                'id_indikator' => $car->id_indikator,
                                'status' => $car->status,
                                'temuan' => $car->temuan,
                                'akar_masalah' => $car->akar_masalah,
                                'tindakan_koreksi' => $car->tindakan_koreksi,
                                'tanggal_pemenuhan' => $car->tanggal_pemenuhan,
                                'tahun_audit' => $car->jadwal->tahun ?? '-',
                                'link_bukti' => null,

                                'pami_data' => $pamiTepat ? [
                                    'skor' => $pamiTepat->skor ?? '-',
                                    'uploads' => $pamiTepat->uploads ? $pamiTepat->uploads->map(fn($u) => [
                                        'id' => $u->id,
                                        'file_path' => $u->file_path,
                                        'file_name' => $u->file_name,
                                        'keterangan' => $u->keterangan,
                                        'created_at' => $u->created_at,
                                    ]) : [],
                                ] : null,
                            ];
                        })
                    ];
                })->filter()->values();

                if ($mappedIndikators->isEmpty()) return null;

                return [
                    'id_standar' => $standar->id_standar,
                    'pernyataan_standar' => $standar->pernyataan_standar,
                    'indikators' => $mappedIndikators,
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
                // FIX ERROR FRONTEND
                'available_years' => JadwalAuditDetail::join('jadwal_audits', 'jadwal_audit_details.id_jadwal', '=', 'jadwal_audits.id_jadwal')->distinct()->pluck('tahun'),
                'selected_year' => '',
            ],
        ]);
    }
}
