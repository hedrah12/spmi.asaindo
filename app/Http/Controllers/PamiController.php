<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\Pami;
use App\Models\Standar;
use App\Models\PamiUpload;
use App\Models\JadwalAudit;
use App\Models\Departemen;
use App\Models\JadwalAuditDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PamiController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $activeRole = session('active_role') ?? $user->getRoleNames()->first();
        $currentRole = strtolower($activeRole);

        $idJadwal = null;
        $targetDeptId = null;
        $namaDepartemen = '-';
        $debugMessage = null;
        $myDepartments = [];

        // --- FILTER TAHUN ---
        $availableYears = JadwalAudit::select('tahun')->distinct()->orderBy('tahun', 'desc')->pluck('tahun');
        $selectedYear = $request->input('tahun', $availableYears->first() ?? date('Y'));

        // --- 1. LOGIKA ROLE & DATA ---
        if ($currentRole === 'auditor') {
            $assignments = JadwalAuditDetail::with(['departemen', 'jadwal'])
                ->where('user_id', $user->id)
                ->whereHas('jadwal', fn($q) => $q->where('tahun', $selectedYear))
                ->latest('created_at')->get();

            if ($assignments->count() > 0) {
                $myDepartments = $assignments->map(fn($a) => ['id' => $a->id_departemen, 'nama' => $a->departemen->nama_departemen ?? 'Dept Hapus', 'id_jadwal' => $a->id_jadwal]);
                $requestedDeptId = $request->input('dept_id');
                $activeTask = $requestedDeptId ? $assignments->where('id_departemen', $requestedDeptId)->first() : $assignments->first();

                if ($activeTask) {
                    $idJadwal = $activeTask->id_jadwal;
                    $targetDeptId = $activeTask->id_departemen;
                    $namaDepartemen = $activeTask->departemen->nama_departemen ?? '-';
                }
            } else {
                $debugMessage = "Anda tidak memiliki jadwal audit pada tahun {$selectedYear}.";
            }
        } elseif ($currentRole === 'auditee') {
            $allDepts = Departemen::where('user_id', $user->id)->get();
            if ($allDepts->count() > 0) {
                $myDepartments = $allDepts->map(fn($d) => ['id' => $d->id_departemen, 'nama' => $d->nama_departemen]);
                $requestedDeptId = $request->input('dept_id');
                $dept = $requestedDeptId ? $allDepts->where('id_departemen', $requestedDeptId)->first() : $allDepts->first();

                $targetDeptId = $dept->id_departemen;
                $namaDepartemen = $dept->nama_departemen;

                $jadwal = JadwalAuditDetail::where('id_departemen', $targetDeptId)
                    ->whereHas('jadwal', fn($q) => $q->where('tahun', $selectedYear))
                    ->latest('created_at')->first();

                if ($jadwal) $idJadwal = $jadwal->id_jadwal;
                else $debugMessage = "Departemen '{$namaDepartemen}' tidak memiliki jadwal audit tahun {$selectedYear}.";
            } else {
                $debugMessage = "Akun Anda tidak terdaftar sebagai pemilik Departemen manapun.";
            }
        } elseif (in_array($currentRole, ['superadmin', 'admin'])) {
            $allDepts = Departemen::orderBy('nama_departemen', 'asc')->get();
            if ($allDepts->count() > 0) {
                $myDepartments = $allDepts->map(fn($d) => ['id' => $d->id_departemen, 'nama' => $d->nama_departemen]);
                $requestedDeptId = $request->input('dept_id');
                $dept = $requestedDeptId ? $allDepts->where('id_departemen', $requestedDeptId)->first() : $allDepts->first();

                if ($dept) {
                    $targetDeptId = $dept->id_departemen;
                    $namaDepartemen = $dept->nama_departemen;
                    $jadwal = JadwalAuditDetail::where('id_departemen', $targetDeptId)
                        ->whereHas('jadwal', fn($q) => $q->where('tahun', $selectedYear))->latest('created_at')->first();
                    if ($jadwal) $idJadwal = $jadwal->id_jadwal;
                }
            }
        }

        // --- 2. QUERY DATA UTAMA ---
        $pamiData = [];
        if ($idJadwal && $targetDeptId) {

            // Logika Filter: Indikator Belum Dinilai
            $filterBelumDinilai = function ($query) use ($idJadwal) {
                $query->where(function ($q) use ($idJadwal) {
                    // KONDISI A: Belum ada record PAMI sama sekali untuk jadwal ini
                    $q->whereDoesntHave('pami', function ($subQ) use ($idJadwal) {
                        $subQ->where('id_jadwal', $idJadwal);
                    })
                        // KONDISI B: Sudah ada record PAMI (misal upload bukti), TAPI skor masih NULL
                        ->orWhereHas('pami', function ($subQ) use ($idJadwal) {
                            $subQ->where('id_jadwal', $idJadwal)
                                ->whereNull('skor');
                        });
                });
            };

            $pamiData = Standar::with(['kriteria', 'indikators' => function ($query) use ($idJadwal, $filterBelumDinilai) {
                $query->select('indikators.*')
                    // Load Relation PAMI & Uploads
                    ->with(['pami' => function ($q) use ($idJadwal) {
                        $q->where('id_jadwal', $idJadwal)->with('uploads');
                    }])
                    // Load Relation CAR
                    ->with(['car' => function ($q) use ($idJadwal) {
                        $q->where('id_jadwal', $idJadwal);
                    }])
                    // TERAPKAN FILTER KE INDIKATOR (Agar indikator yang sudah dinilai hilang dari list)
                    ->where($filterBelumDinilai);
            }])
                // FILTER PARENT (STANDAR):
                // Hanya tampilkan Standar yang MASIH punya indikator yang belum dinilai.
                // Jika semua indikator di standar tersebut sudah dinilai, standar tidak perlu muncul.
                ->whereHas('indikators', $filterBelumDinilai)
                ->where('id_departemen', $targetDeptId)
                ->get();
        }

        return Inertia::render('pami/Index', [
            'pamiData' => $pamiData,
            'meta' => [
                'role' => $currentRole,
                'is_auditor' => in_array($currentRole, ['auditor', 'superadmin', 'admin']),
                'is_auditee' => in_array($currentRole, ['auditee', 'superadmin', 'admin']),
                'id_jadwal' => $idJadwal,
                'departemen_id' => $targetDeptId,
                'nama_departemen' => $namaDepartemen,
                'has_schedule' => (bool) $idJadwal,
                'my_departments' => $myDepartments,
                'debug_message' => $debugMessage,
                'available_years' => $availableYears,
                'selected_year' => $selectedYear
            ]
        ]);
    }

    // --- STORE NILAI AUDIT ---
    public function store(Request $request)
    {
        // 1. Validasi Gabungan (Buat skor jadi nullable agar Auditee bisa upload tanpa isi skor)
        $request->validate([
            'id_jadwal' => 'required',
            'id_indikator' => 'required',

            // Validasi Auditor
            'skor' => 'nullable',
            'temuan' => 'nullable|required_if:skor,Ketidaksesuaian Minor,Ketidaksesuaian Mayor,Ketidaksesuaian Observasi',
            'tanggal_pemenuhan' => 'nullable|required_if:skor,Ketidaksesuaian Minor,Ketidaksesuaian Mayor,Ketidaksesuaian Observasi',

            // Validasi Auditee (File & Keterangan)
            'bukti' => 'nullable|file|max:20480', // 20MB
            'keterangan' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $user = Auth::user();
            $role = strtolower(session('active_role') ?? $user->getRoleNames()->first());

            // ------------------------------------------------------------------
            // A. LOGIKA AUDITEE: UPLOAD BUKTI / KETERANGAN
            // ------------------------------------------------------------------
            if (in_array($role, ['auditee', 'superadmin', 'admin']) && ($request->hasFile('bukti') || $request->filled('keterangan'))) {

                // Cari atau Buat Parent PAMI
                $pami = Pami::firstOrCreate(
                    [
                        'id_jadwal' => $request->id_jadwal,
                        'id_indikator' => $request->id_indikator
                    ],
                    ['skor' => null] // Default jika belum dinilai
                );

                $filePath = null;
                $fileName = null;

                // Handle File
                if ($request->hasFile('bukti')) {
                    $file = $request->file('bukti');
                    $filePath = $file->store('bukti_audit', 'public');
                    $fileName = $file->getClientOriginalName();
                }

                // Simpan ke PamiUploads
                PamiUpload::create([
                    'id_pami' => $pami->id,
                    'file_path' => $filePath,
                    'file_name' => $fileName,
                    'keterangan' => $request->keterangan,
                    'uploaded_by_role' => $role
                ]);
            }

            // ------------------------------------------------------------------
            // B. LOGIKA AUDITOR: SIMPAN NILAI & AUTO-CAR
            // ------------------------------------------------------------------
            // Hanya jalankan jika request membawa 'skor'
            if ($request->filled('skor')) {

                // Simpan/Update Skor
                Pami::updateOrCreate(
                    [
                        'id_jadwal' => $request->id_jadwal,
                        'id_indikator' => $request->id_indikator
                    ],
                    ['skor' => $request->skor]
                );

                // Cek Skor Negatif -> Buat CAR
                $negativeScores = ["Ketidaksesuaian Observasi", "Ketidaksesuaian Minor", "Ketidaksesuaian Mayor"];

                if (in_array($request->skor, $negativeScores)) {
                    Car::updateOrCreate(
                        [
                            'id_jadwal' => $request->id_jadwal,
                            'id_indikator' => $request->id_indikator
                        ],
                        [
                            'ketidaksesuaian' => $request->skor,
                            'temuan' => $request->temuan,
                            'tanggal_pemenuhan' => $request->tanggal_pemenuhan,
                            'status' => 'OPEN'
                        ]
                    );
                }
            }
        });

        return redirect()->back()->with('message', 'Data berhasil disimpan');
    }

    // --- RESPON AUDITEE (FIX: LINK & FILE MASUK KE RIWAYAT PAMI UPLOADS) ---
    public function respondCar(Request $request)
    {
        $request->validate([
            'car_id' => 'required|exists:cars,id',
            'akar_masalah' => 'required|string',
            'tindakan_koreksi' => 'required|string',
            'link_bukti' => 'nullable|string',
            'file_bukti' => 'nullable|file|max:20480', // 20MB
        ]);

        DB::transaction(function () use ($request) {
            $car = Car::findOrFail($request->car_id);

            // 1. Update Text Data di tabel CARS
            $car->update([
                'akar_masalah' => $request->akar_masalah,
                'tindakan_koreksi' => $request->tindakan_koreksi,
                'status' => 'Submitted'
            ]);

            // 2. Handle Bukti -> Masuk PamiUploads
            if ($request->hasFile('file_bukti') || $request->filled('link_bukti')) {

                // PERBAIKAN LOGIC: Cari Pami ID berdasarkan Jadwal & Indikator dari CAR
                // Ini lebih aman daripada $car->id_pami jika kolom itu tidak ada/kosong
                $pami = Pami::firstOrCreate([
                    'id_jadwal' => $car->id_jadwal,
                    'id_indikator' => $car->id_indikator
                ]);

                $filePath = null;
                $fileName = null;

                if ($request->hasFile('file_bukti')) {
                    $file = $request->file('file_bukti');
                    $filePath = $file->store('bukti_audit', 'public');
                    $fileName = $file->getClientOriginalName();
                }

                // Simpan ke Riwayat
                PamiUpload::create([
                    'id_pami' => $pami->id, // Gunakan ID dari query di atas
                    'file_path' => $filePath,
                    'file_name' => $fileName,
                    'keterangan' => ($request->link_bukti ? $request->link_bukti . " " : "") . "[Bukti Tindak Lanjut CAR]",
                    'uploaded_by_role' => 'auditee'
                ]);
            }
        });

        return redirect()->back()->with('success', 'Respon CAR berhasil dikirim.');
    }

    // --- VERIFIKASI AUDITOR ---
    public function verifyCar(Request $request)
    {
        $request->validate([
            'car_id' => 'required|exists:cars,id',
            'status' => 'required|in:Open,Close',
            'skor'   => 'required|string', // Validasi skor wajib ada
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            // 1. Update Status CAR
            $car = \App\Models\Car::findOrFail($request->car_id);
            $car->update(['status' => $request->status]);

            // 2. Update Skor di Tabel Pami
            // Cari data Pami berdasarkan jadwal & indikator dari CAR tersebut
            \App\Models\Pami::updateOrCreate(
                [
                    'id_jadwal'    => $car->id_jadwal,
                    'id_indikator' => $car->id_indikator
                ],
                [
                    'skor' => $request->skor
                ]
            );
        });

        return redirect()->back()->with('success', 'Status Verifikasi dan Skor berhasil diperbarui.');
    }

    // --- HAPUS FILE ---
    public function deleteFile($id)
    {
        $file = PamiUpload::find($id);
        if (!$file) return redirect()->back()->withErrors(['file' => 'File tidak ditemukan']);

        if ($file->file_path && Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }
        $file->delete();

        return redirect()->back()->with('message', 'Dokumen berhasil dihapus');
    }
    public function download($id)
    {
        $file = PamiUpload::findOrFail($id);

        // 1. Cek path di database
        if (!$file->file_path) {
            abort(404, 'Path file tidak valid.');
        }

        // 2. Cek fisik file di storage
        if (!Storage::disk('public')->exists($file->file_path)) {
            abort(404, 'File fisik tidak ditemukan di server.');
        }

        // GANTI DARI 'download' MENJADI 'response'
        // 'response' akan menampilkan file (preview) di browser jika memungkinkan (PDF/Gambar)
        return Storage::disk('public')->response($file->file_path);
    }
    public function print(Request $request)
{
    $id_indikator = $request->id_indikator;
    $jadwal_id = $request->jadwal_id;

    // Ambil data detail untuk indikator tersebut
    $indikator = \App\Models\Indikator::with(['pami' => function($q) use ($jadwal_id) {
        $q->where('id_jadwal', $jadwal_id);
    }, 'car'])->findOrFail($id_indikator);

    $jadwal = \App\Models\JadwalAudit::with('departemen')->findOrFail($jadwal_id);

    // Load view PDF (pastikan file resources/views/exports/pencatatan_ami.blade.php sudah ada)
    $pdf = Pdf::loadView('exports.pencatatan_ami', [
        'indikator' => $indikator,
        'jadwal' => $jadwal,
        'tanggal' => now()->format('d F Y')
    ]);

    return $pdf->stream("Hasil_Audit_Indikator_{$id_indikator}.pdf");
}
}
