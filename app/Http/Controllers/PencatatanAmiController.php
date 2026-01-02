<?php

namespace App\Http\Controllers;

use App\Models\Standar;
use App\Models\JadwalAudit;
use App\Models\Departemen;
use App\Models\JadwalAuditDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Indikator;

class PencatatanAmiController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // --- 1. DETEKSI ROLE (Sesuai Logic PamiController) ---
        // Menggunakan session active_role agar fitur switch role berfungsi
        $activeRole = session('active_role') ?? $user->getRoleNames()->first();
        $currentRole = strtolower($activeRole); // Pastikan lowercase untuk validasi

        // --- 2. AMBIL TAHUN & JADWAL TERBARU ---
        $availableYears = JadwalAudit::select('tahun')->distinct()->orderBy('tahun', 'desc')->pluck('tahun')->toArray();
        $selectedYear = $request->input('tahun', $availableYears[0] ?? date('Y'));

        $jadwal = JadwalAudit::where('tahun', $selectedYear)
            ->orderBy('id_jadwal', 'desc')
            ->first();
        $jadwalId = $jadwal ? $jadwal->id_jadwal : null;

        // --- 3. LOGIC DEPARTEMEN BERDASARKAN ROLE ---
        $myDepartments = [];

        if ($jadwalId) {
            // A. SUPERADMIN & ADMIN: LIHAT SEMUA DEPARTEMEN
            if (in_array($currentRole, ['superadmin', 'admin'])) {
                $myDepartments = Departemen::select('id_departemen as id', 'nama_departemen as nama')
                    ->orderBy('nama_departemen', 'asc')
                    ->get()
                    ->toArray();
            }
            // B. ROLE LAIN (Auditor / Auditee)
            else {
                // 1. Cari Dept dimana User ini bertugas sebagai AUDITOR pada jadwal ini
                $deptAsAuditor = JadwalAuditDetail::where('id_jadwal', $jadwalId)
                    ->where('user_id', $user->id)
                    ->pluck('id_departemen')
                    ->toArray();

                // 2. Cari Dept dimana User ini adalah pemilik/kepala (AUDITEE)
                // Logic: User pemilik dept AND dept tersebut ada di jadwal audit tahun ini
                $deptAsAuditee = Departemen::where('user_id', $user->id)
                    ->whereIn('id_departemen', function ($q) use ($jadwalId) {
                        $q->select('id_departemen')->from('jadwal_audit_details')->where('id_jadwal', $jadwalId);
                    })
                    ->pluck('id_departemen')
                    ->toArray();

                // Gabungkan (Unique)
                $allowedDeptIds = array_unique(array_merge($deptAsAuditor, $deptAsAuditee));

                if (!empty($allowedDeptIds)) {
                    $myDepartments = Departemen::whereIn('id_departemen', $allowedDeptIds)
                        ->select('id_departemen as id', 'nama_departemen as nama')
                        ->orderBy('nama_departemen', 'asc')
                        ->get()
                        ->toArray();
                }
            }
        }

        // --- 4. VALIDASI DEPARTEMEN YANG DIPILIH ---
        $selectedDeptId = $request->input('dept_id');

        // Cek apakah dept yang dipilih via URL valid untuk user ini
        $isAllowed = collect($myDepartments)->contains('id', $selectedDeptId);

        // Jika tidak ada akses atau belum pilih, ambil yang pertama dari daftar izin
        if ((!$selectedDeptId || !$isAllowed) && count($myDepartments) > 0) {
            $selectedDeptId = $myDepartments[0]['id'];
        }

        // --- 5. QUERY DATA STANDAR & PAMI ---
        $data = [];

        // Hanya jalankan query jika jadwal ada, departemen terpilih, dan user punya akses
        if ($jadwalId && $selectedDeptId && count($myDepartments) > 0) {

            $standars = Standar::query()
                ->where(function ($q) use ($selectedDeptId) {
                    $q->where('id_departemen', $selectedDeptId) // Standar khusus dept
                        ->orWhereNull('id_departemen');           // Standar umum
                })
                ->with([
                    'indikators' => function ($query) use ($jadwalId) {
                        // Ambil PAMI sesuai jadwal
                        $query->with(['pami' => function ($q) use ($jadwalId) {
                            $q->where('id_jadwal', $jadwalId);
                        }]);
                        // Ambil CAR sesuai jadwal
                        $query->with(['car' => function ($q) use ($jadwalId) {
                            $q->where('id_jadwal', $jadwalId);
                        }]);
                    }
                ])
                ->get();

            // Mapping Data untuk Frontend
            $data = $standars->map(function ($standar) {
                // Filter Indikator: Hanya tampilkan jika sudah ada record PAMI (Sudah dinilai)
                // Jika ingin menampilkan form kosong juga, hapus pengecekan `if (!$pamiData)`
                $filteredIndikators = $standar->indikators->map(function ($ind) {
                    $pamiData = $ind->pami;

                    if (!$pamiData) return null; // Skip jika belum dinilai (sesuai logic asli Anda)

                    return [
                        'id' => $ind->id_indikator,
                        'pernyataan_indikator' => $ind->pernyataan_indikator,
                        'pami' => [
                            'id' => $pamiData->id,
                            'skor' => (string) $pamiData->skor,
                        ],
                        'car' => $ind->car ? [
                            'status' => $ind->car->status,
                            'ketidaksesuaian' => $ind->car->ketidaksesuaian,
                            'temuan' => $ind->car->temuan,
                            'akar_masalah' => $ind->car->akar_masalah,
                            'tindakan_koreksi' => $ind->car->tindakan_koreksi,
                            'tanggal_pemenuhan' => $ind->car->tanggal_pemenuhan,
                        ] : null,
                    ];
                })->filter(); // Hapus nilai null

                if ($filteredIndikators->isEmpty()) return null; // Skip standar jika tidak ada indikator yang dinilai

                return [
                    'id' => $standar->id_standar,
                    'pernyataan_standar' => $standar->pernyataan_standar,
                    'indikators' => $filteredIndikators->values(),
                ];
            })->filter()->values();
        }

        // --- 6. RETURN INERTIA ---
        // Cari nama departemen yang sedang dipilih untuk UI
        $currentDeptName = collect($myDepartments)->firstWhere('id', $selectedDeptId)['nama'] ?? '-';

        return Inertia::render('PencatatanAmi/Index', [
            'data' => $data,
            'meta' => [
                'role' => $currentRole, // Kirim role yang sudah dinormalisasi
                'nama_departemen' => $currentDeptName,
                'available_years' => $availableYears,
                'selected_year' => (string)$selectedYear,
                'departemen_id' => $selectedDeptId ? (int)$selectedDeptId : null,
                'jadwal_id' => $jadwalId,
                'my_departments' => $myDepartments,
                'has_schedule' => !is_null($jadwalId),
                'debug_message' => is_null($jadwalId)
                    ? "Jadwal Audit tahun {$selectedYear} belum dibuat."
                    : (empty($myDepartments) ? "Anda tidak memiliki akses ke departemen manapun pada jadwal ini." : null),
            ],
        ]);
    }
    public function print(Request $request)
{
    $id_indikator = $request->id_indikator;
    $jadwal_id = $request->jadwal_id;

    // 1. Ambil data lengkap dengan relasi
    // Pastikan 'details.departemen.user' dimuat agar nama auditee muncul
    $indikator = Indikator::with(['standar', 'pami', 'car'])->findOrFail($id_indikator);
    $jadwal = JadwalAudit::with(['details.auditor', 'details.departemen.user'])->findOrFail($jadwal_id);

    // Ambil detail pertama
    $detail = $jadwal->details->first(); // <--- PERBAIKAN: SEBELUMNYA KURANG TITIK KOMA (;) DI SINI

    // Ambil data nama
    // Sesuai migration: departemens punya user_id
    $nama_auditee = $detail->departemen->user->name ?? '-';
    $nama_departemen = $detail->departemen->nama_departemen ?? '-';
    $nama_auditor = $detail->auditor->name ?? '-';

    // 2. Logika Auto-Numbering PTK (Hanya jika ada data CAR/Temuan)
    $no_ptk = '-';
    if ($indikator->car) {
        if (empty($indikator->car->nomor_ptk)) {
            // Generate nomor baru: Format 001/ASA/PTK/2026
            $tahun = date('Y');
            $count = \App\Models\Car::whereYear('created_at', $tahun)->count() + 1;
            $no_urut = str_pad($count, 3, '0', STR_PAD_LEFT);

            $no_ptk = "{$no_urut}/ASA/PTK/{$tahun}";

            // Simpan ke database agar permanen
            $indikator->car->update(['nomor_ptk' => $no_ptk]);
        } else {
            // Ambil nomor yang sudah ada di database
            $no_ptk = $indikator->car->nomor_ptk;
        }
    }

    // 3. Siapkan data untuk Blade
    $data = [
        'nama_auditee'    => $nama_auditee,     // Dikirim ke Blade
        'nama_departemen' => $nama_departemen,  // Dikirim ke Blade
        'nama_auditor'    => $nama_auditor,     // Dikirim ke Blade
        'indikator'       => $indikator,
        'jadwal'          => $jadwal,
        'ptk'             => (object)[],        // Dummy object
        'no_ptk'          => $no_ptk,
        'tanggal'         => now()->translatedFormat('d F Y'),
    ];

    $pdf = Pdf::loadView('exports.pencatatan_ami', $data);
    $pdf->setPaper('a4', 'portrait');

    // Ganti tanda '/' menjadi '_' agar nama file valid saat didownload
    $nama_file_aman = str_replace(['/', '\\'], '_', $no_ptk);

    return $pdf->stream("PTK_{$nama_file_aman}.pdf");
}
}
