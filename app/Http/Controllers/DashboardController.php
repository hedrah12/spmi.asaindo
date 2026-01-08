<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\JadwalAudit;
use App\Models\JadwalAuditDetail;
use App\Models\Car;
use App\Models\Pami;
use App\Models\Departemen;
use App\Models\User;
use App\Models\Standar;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $activeRole = session('active_role') ?? $user->getRoleNames()->first();
        $currentRole = strtolower($activeRole);

        // 1. Ambil Jadwal Aktif
        $jadwalAktif = JadwalAudit::orderBy('tahun', 'desc')->first();
        $idJadwal = $jadwalAktif ? $jadwalAktif->id_jadwal : null;
        $tahun = $jadwalAktif ? $jadwalAktif->tahun : date('Y');

        // Struktur Data Default
        $data = [
            'stats' => ['score_avg' => 0, 'rtl_open' => 0, 'auditor_active' => 0, 'progress' => 0],
            'charts' => ['ami_trend' => [], 'findings' => [], 'radar' => [], 'heatmap_data' => [], 'heatmap_columns' => []],
            'tables' => [],
            'meta' => [
                'role' => $currentRole,
                'tahun' => $tahun,
                'jadwal_status' => $jadwalAktif ? 'Aktif' : 'Tidak Ada Jadwal',
                'user_name' => $user->name
            ]
        ];

        // 2. Logic Berdasarkan Role
        if (in_array($currentRole, ['superadmin', 'admin'])) {
            $data = $this->getAdminData($idJadwal, $data);
        } elseif ($currentRole === 'auditor') {
            $data = $this->getAuditorData($idJadwal, $user->id, $data);
        } elseif ($currentRole === 'auditee') {
            $data = $this->getAuditeeData($idJadwal, $user->id, $data);
        }

        return Inertia::render('dashboard', [
            'dashboardData' => $data
        ]);
    }

    // --- LOGIC ADMIN ---
    private function getAdminData($idJadwal, $data)
    {
        if (!$idJadwal) return $data;

        // A. Stats Utama
        $avgScore = Pami::where('id_jadwal', $idJadwal)->avg('skor') ?? 0;
        $rtlOpen = Car::where('id_jadwal', $idJadwal)->where('status', '!=', 'Close')->count();
        $auditorCount = JadwalAuditDetail::where('id_jadwal', $idJadwal)->distinct('user_id')->count();

        $totalDept = JadwalAuditDetail::where('id_jadwal', $idJadwal)->distinct('id_departemen')->count();
        $deptDinilai = DB::table('pamis')
            ->join('indikators', 'pamis.id_indikator', '=', 'indikators.id_indikator')
            ->join('standars', 'indikators.id_standar', '=', 'standars.id_standar')
            ->where('pamis.id_jadwal', $idJadwal)
            ->whereNotNull('pamis.skor')
            ->distinct('standars.id_departemen')
            ->count('standars.id_departemen');

        $data['stats'] = [
            'score_avg' => round($avgScore, 2),
            'rtl_open' => $rtlOpen,
            'auditor_active' => $auditorCount,
            'progress' => $totalDept > 0 ? round(($deptDinilai / $totalDept) * 100) : 0
        ];

        // B. Chart Findings (Pie)
        $data['charts']['findings'] = Car::where('id_jadwal', $idJadwal)
            ->select('ketidaksesuaian', DB::raw('count(*) as value'))
            ->groupBy('ketidaksesuaian')
            ->get()
            ->map(function($item) {
                $color = match($item->ketidaksesuaian) { 'Mayor' => '#ef4444', 'Minor' => '#f59e0b', default => '#3b82f6' };
                return ['name' => $item->ketidaksesuaian ?? 'Observasi', 'value' => $item->value, 'color' => $color];
            });

        // C. Chart RADAR (Kekuatan antar Standar)
        $radarData = DB::table('pamis')
            ->join('indikators', 'pamis.id_indikator', '=', 'indikators.id_indikator')
            ->join('standars', 'indikators.id_standar', '=', 'standars.id_standar')
            ->where('pamis.id_jadwal', $idJadwal)
            ->select('standars.pernyataan_standar', DB::raw('AVG(pamis.skor) as score'))
            ->groupBy('standars.id_standar', 'standars.pernyataan_standar')
            ->get()
            ->map(function($item) {
                $words = explode(' ', $item->pernyataan_standar);
                $label = implode(' ', array_slice($words, 0, 3)); // Ambil 3 kata pertama
                return [
                    'subject' => $label,
                    'A' => round($item->score, 2),
                    'fullMark' => 4
                ];
            });
        $data['charts']['radar'] = $radarData;

        // D. Chart HEATMAP (Dept vs Standar)
        $standars = Standar::orderBy('id_standar')->get();
        $deptIds = JadwalAuditDetail::where('id_jadwal', $idJadwal)->pluck('id_departemen')->unique();
        $depts = Departemen::whereIn('id_departemen', $deptIds)->get();

        $heatmapData = [];
        foreach($depts as $dept) {
            $row = ['name' => $dept->nama_departemen];
            foreach($standars as $std) {
                $avg = DB::table('pamis')
                    ->join('indikators', 'pamis.id_indikator', '=', 'indikators.id_indikator')
                    ->join('standars', 'indikators.id_standar', '=', 'standars.id_standar')
                    ->where('pamis.id_jadwal', $idJadwal)
                    ->where('standars.id_departemen', $dept->id_departemen)
                    ->where('indikators.id_standar', $std->id_standar)
                    ->avg('pamis.skor');

                $row['std_' . $std->id_standar] = $avg ? round($avg, 2) : 0;
            }
            $heatmapData[] = $row;
        }

        $heatmapColumns = $standars->map(function($s) {
            $words = explode(' ', $s->pernyataan_standar);
            return ['key' => 'std_' . $s->id_standar, 'label' => implode(' ', array_slice($words, 0, 2))];
        });

        $data['charts']['heatmap_data'] = $heatmapData;
        $data['charts']['heatmap_columns'] = $heatmapColumns;

        return $data;
    }

    // --- LOGIC AUDITOR ---
    private function getAuditorData($idJadwal, $userId, $data)
    {
        if (!$idJadwal) return $data;

        $tasks = JadwalAuditDetail::where('id_jadwal', $idJadwal)
            ->where('user_id', $userId)
            ->with('departemen')
            ->get()
            ->map(function($detail) use ($idJadwal) {
                $hasScore = Pami::where('id_jadwal', $idJadwal)
                    ->whereHas('indikator.standar', function($q) use ($detail) {
                        $q->where('id_departemen', $detail->id_departemen);
                    })
                    ->exists();

                return [
                    'prodi' => $detail->departemen->nama_departemen ?? '-',
                    'role' => $detail->peran,
                    'deadline' => 'Des ' . date('Y'),
                    'completed' => $hasScore,
                    'link_score' => route('pami.index', ['dept_id' => $detail->id_departemen])
                ];
            });

        $data['tasks'] = $tasks;
        $data['stats'] = [
            'assigned' => $tasks->count(),
            'completed' => $tasks->where('completed', true)->count(),
            'rating' => 5.0,
            'on_time' => '100%'
        ];
        return $data;
    }

    // --- LOGIC AUDITEE ---
    private function getAuditeeData($idJadwal, $userId, $data)
    {
        if (!$idJadwal) return $data;

        $deptIds = Departemen::where('user_id', $userId)->pluck('id_departemen');

        $findings = Car::where('id_jadwal', $idJadwal)
            ->whereHas('indikator.standar', function($q) use ($deptIds) {
                $q->whereIn('id_departemen', $deptIds);
            })
            ->with('indikator')
            ->limit(10)
            ->get()
            ->map(function($c) {
                return [
                    'type' => $c->ketidaksesuaian,
                    'desc' => $c->temuan,
                    'section' => 'Indikator ' . ($c->indikator->no_indikator ?? '-'),
                    'status' => $c->status,
                    'link_rtl' => route('rtl.index')
                ];
            });

        $data['findings'] = $findings;
        $openCount = $findings->where('status', '!=', 'Close')->count();

        $data['stats'] = [
            'stage' => $openCount > 0 ? 'Tindak Lanjut (RTL)' : 'Audit Selesai',
            'completeness' => $openCount > 0 ? 80 : 100
        ];

        $data['documents'] = [['name' => 'Laporan Evaluasi Diri', 'status' => 'Wajib']];

        return $data;
    }
}
