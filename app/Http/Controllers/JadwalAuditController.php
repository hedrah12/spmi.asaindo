<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Lingkup;
use App\Models\Standar;
// IMPORT MODEL HIERARKI (Wajib ada agar modal detail berjalan)
use App\Models\Kriteria;
use App\Models\Departemen;
use App\Models\JadwalAudit;

use Illuminate\Http\Request;
use App\Models\JadwalAuditDetail;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf as DomPdf;

class JadwalAuditController extends Controller
{
    /**
     * Menampilkan daftar jadwal audit & Data Master untuk Modal.
     */
    public function index(Request $request)
    {
        // 1. Ambil Data Jadwal (Header + Detail + Auditor + Departemen)
        $query = JadwalAudit::with(['details.auditor', 'details.departemen']);

        // Filter Pencarian
        if ($request->has('search')) {
            $query->where('tahun', 'like', '%' . $request->search . '%')
                ->orWhere('no_sk', 'like', '%' . $request->search . '%');
        }

        // 2. Ambil Data Master Hierarki (Khusus untuk Modal Detail)
        // Kita gunakan 'with' agar relasi indikator juga terambil (Eager Loading)
        // Tanpa ini, data indikator di frontend akan undefined
        $standars = Standar::with('indikators')->get();

        return Inertia::render('jadwal/Index', [
            'data' => $query->latest('id_jadwal')->get(),

            // Paket Master Data Lengkap untuk Frontend
            'masterData' => [
                // Untuk Form Input
                'users'       => User::all(),
                'departemens' => Departemen::all(),

                // Untuk Modal Detail (Hierarki Standar)
                'lingkups'    => Lingkup::all(),
                'kriterias'   => Kriteria::all(),
                'standars'    => $standars,
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Simpan Jadwal Baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'tahun'       => 'required',
            'tgl_mulai'   => 'required|date',
            'tgl_selesai' => 'required|date|after_or_equal:tgl_mulai',
            'details'     => 'array|min:1',
            'details.*.user_id'       => 'required|exists:users,id',
            'details.*.id_departemen' => 'required|exists:departemens,id_departemen',
        ]);

        DB::transaction(function () use ($request) {
            // 1. Header
            $jadwal = JadwalAudit::create([
                'tahun'       => $request->tahun,
                'no_sk'       => $request->no_sk,
                'tgl_mulai'   => $request->tgl_mulai,
                'tgl_selesai' => $request->tgl_selesai,
            ]);

            // 2. Detail
            foreach ($request->details as $detail) {
                JadwalAuditDetail::create([
                    'id_jadwal'     => $jadwal->id_jadwal,
                    'user_id'       => $detail['user_id'],
                    'id_departemen' => $detail['id_departemen'],
                ]);
            }
        });

        return redirect()->back()->with('message', 'Jadwal Audit berhasil dibuat');
    }

    /**
     * Update Jadwal
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'tahun'     => 'required',
            'tgl_mulai' => 'required|date',
            'details'   => 'array',
        ]);

        DB::transaction(function () use ($request, $id) {
            $jadwal = JadwalAudit::findOrFail($id);

            // Update Header
            $jadwal->update([
                'tahun'       => $request->tahun,
                'no_sk'       => $request->no_sk,
                'tgl_mulai'   => $request->tgl_mulai,
                'tgl_selesai' => $request->tgl_selesai,
            ]);

            // Reset Detail
            $jadwal->details()->delete();

            // Insert Ulang Detail
            foreach ($request->details as $detail) {
                JadwalAuditDetail::create([
                    'id_jadwal'     => $jadwal->id_jadwal,
                    'user_id'       => $detail['user_id'],
                    'id_departemen' => $detail['id_departemen'],
                ]);
            }
        });

        return redirect()->back()->with('message', 'Jadwal Audit diperbarui');
    }

    /**
     * Hapus Jadwal
     */
    public function destroy($id)
    {
        JadwalAudit::findOrFail($id)->delete();
        return redirect()->back()->with('message', 'Data dihapus');
    }
    public function exportChecklist($id)
    {
        // 1. Ambil data Jadwal beserta Detail-nya
        $jadwal = JadwalAudit::with(['details.auditor', 'details.departemen'])->findOrFail($id);

        // 2. Ambil semua Standar + Indikator + Kriteria untuk dipassing ke View
        // Kita ambil semua dulu, nanti di Blade difilter per departemen biar hemat query
        $standars = Standar::with(['indikators', 'kriteria'])
            ->get();

        // 3. Generate PDF
        $pdf = DomPdf::loadView('exports.checklist_audit', compact('jadwal', 'standars'));

        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('Checklist-Audit.pdf');
    }
}


// kunci ketika sudah dinilai

// <?php

// namespace App\Http\Controllers;

// use App\Models\User;
// use Inertia\Inertia;
// use App\Models\Lingkup;
// use App\Models\Standar;
// // IMPORT MODEL HIERARKI (Wajib ada agar modal detail berjalan)
// use App\Models\Kriteria;
// use App\Models\Departemen;
// use App\Models\JadwalAudit;
// // TAMBAHKAN MODEL PAMI UNTUK PENGECEKAN SKOR
// use App\Models\Pami;

// use Illuminate\Http\Request;
// use App\Models\JadwalAuditDetail;
// use Illuminate\Support\Facades\DB;
// use Barryvdh\DomPDF\Facade\Pdf as DomPdf;

// class JadwalAuditController extends Controller
// {
//     /**
//      * Menampilkan daftar jadwal audit & Data Master untuk Modal.
//      */
//     public function index(Request $request)
//     {
//         // 1. Ambil Data Jadwal (Header + Detail + Auditor + Departemen)
//         $query = JadwalAudit::with(['details.auditor', 'details.departemen']);

//         // Filter Pencarian
//         if ($request->has('search')) {
//             $query->where('tahun', 'like', '%' . $request->search . '%')
//                 ->orWhere('no_sk', 'like', '%' . $request->search . '%');
//         }

//         // 2. Ambil Data Master Hierarki (Khusus untuk Modal Detail)
//         $standars = Standar::with('indikators')->get();

//         // [UPDATE] AMBIL DATA & CEK STATUS PENILAIAN (LOCKING)
//         // Kita map data jadwal untuk menambahkan flag 'is_graded'
//         $dataJadwal = $query->latest('id_jadwal')->get()->map(function($item) {
//             // Cek apakah jadwal ini sudah ada penilaian (skor tidak null) di tabel PAMI
//             $item->is_graded = Pami::where('id_jadwal', $item->id_jadwal)
//                                    ->whereNotNull('skor')
//                                    ->exists();
//             return $item;
//         });

//         return Inertia::render('jadwal/Index', [
//             'data' => $dataJadwal, // Gunakan variabel data yang sudah dimapping

//             // Paket Master Data Lengkap untuk Frontend
//             'masterData' => [
//                 // Untuk Form Input
//                 'users'       => User::all(),
//                 'departemens' => Departemen::all(),

//                 // Untuk Modal Detail (Hierarki Standar)
//                 'lingkups'    => Lingkup::all(),
//                 'kriterias'   => Kriteria::all(),
//                 'standars'    => $standars,
//             ],
//             'filters' => $request->only(['search']),
//         ]);
//     }

//     /**
//      * Simpan Jadwal Baru
//      */
//     public function store(Request $request)
//     {
//         $request->validate([
//             'tahun'       => 'required',
//             'tgl_mulai'   => 'required|date',
//             'tgl_selesai' => 'required|date|after_or_equal:tgl_mulai',
//             'details'     => 'array|min:1',
//             'details.*.user_id'       => 'required|exists:users,id',
//             'details.*.id_departemen' => 'required|exists:departemens,id_departemen',
//         ]);

//         DB::transaction(function () use ($request) {
//             // 1. Header
//             $jadwal = JadwalAudit::create([
//                 'tahun'       => $request->tahun,
//                 'no_sk'       => $request->no_sk,
//                 'tgl_mulai'   => $request->tgl_mulai,
//                 'tgl_selesai' => $request->tgl_selesai,
//             ]);

//             // 2. Detail
//             foreach ($request->details as $detail) {
//                 JadwalAuditDetail::create([
//                     'id_jadwal'     => $jadwal->id_jadwal,
//                     'user_id'       => $detail['user_id'],
//                     'id_departemen' => $detail['id_departemen'],
//                 ]);
//             }
//         });

//         return redirect()->back()->with('message', 'Jadwal Audit berhasil dibuat');
//     }

//     /**
//      * Update Jadwal
//      */
//     public function update(Request $request, $id)
//     {
//         // [UPDATE] PROTEKSI SEBELUM UPDATE
//         // Jika sudah ada nilai, tolak update
//         $isGraded = Pami::where('id_jadwal', $id)->whereNotNull('skor')->exists();
//         if ($isGraded) {
//             return redirect()->back()->withErrors(['message' => 'Gagal Update: Jadwal ini sudah dinilai oleh auditor (Terkunci).']);
//         }

//         $request->validate([
//             'tahun'     => 'required',
//             'tgl_mulai' => 'required|date',
//             'details'   => 'array',
//         ]);

//         DB::transaction(function () use ($request, $id) {
//             $jadwal = JadwalAudit::findOrFail($id);

//             // Update Header
//             $jadwal->update([
//                 'tahun'       => $request->tahun,
//                 'no_sk'       => $request->no_sk,
//                 'tgl_mulai'   => $request->tgl_mulai,
//                 'tgl_selesai' => $request->tgl_selesai,
//             ]);

//             // Reset Detail
//             $jadwal->details()->delete();

//             // Insert Ulang Detail
//             foreach ($request->details as $detail) {
//                 JadwalAuditDetail::create([
//                     'id_jadwal'     => $jadwal->id_jadwal,
//                     'user_id'       => $detail['user_id'],
//                     'id_departemen' => $detail['id_departemen'],
//                 ]);
//             }
//         });

//         return redirect()->back()->with('message', 'Jadwal Audit diperbarui');
//     }

//     /**
//      * Hapus Jadwal
//      */
//     public function destroy($id)
//     {
//         // [UPDATE] PROTEKSI SEBELUM HAPUS
//         // Jika sudah ada nilai, tolak hapus
//         $isGraded = Pami::where('id_jadwal', $id)->whereNotNull('skor')->exists();
//         if ($isGraded) {
//             return redirect()->back()->withErrors(['message' => 'Gagal Hapus: Jadwal ini sudah memiliki data penilaian (Terkunci).']);
//         }

//         JadwalAudit::findOrFail($id)->delete();
//         return redirect()->back()->with('message', 'Data dihapus');
//     }

//     public function exportChecklist($id)
//     {
//         // 1. Ambil data Jadwal beserta Detail-nya
//         $jadwal = JadwalAudit::with(['details.auditor', 'details.departemen'])->findOrFail($id);

//         // 2. Ambil semua Standar + Indikator + Kriteria untuk dipassing ke View
//         // Kita ambil semua dulu, nanti di Blade difilter per departemen biar hemat query
//         $standars = Standar::with(['indikators', 'kriteria'])
//             ->get();

//         // 3. Generate PDF
//         $pdf = DomPdf::loadView('exports.checklist_audit', compact('jadwal', 'standars'));

//         $pdf->setPaper('a4', 'portrait');

//         return $pdf->stream('Checklist-Audit.pdf');
//     }
// }
