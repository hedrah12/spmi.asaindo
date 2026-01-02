<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    // Method ini opsional, jika Auditor ingin membuat CAR secara manual di luar penilaian PAMI
    public function store(Request $request)
    {
        $request->validate([
            'id_jadwal' => 'required',
            'id_indikator' => 'required',
            'temuan' => 'nullable|string',
            'ketidaksesuaian' => 'required|string',
            'tanggal_pemenuhan' => 'nullable|date',
        ]);

        Car::updateOrCreate(
            [
                'id_jadwal' => $request->id_jadwal,
                'id_indikator' => $request->id_indikator
            ],
            [
                'temuan' => $request->temuan,
                'ketidaksesuaian' => $request->ketidaksesuaian,
                'tanggal_pemenuhan' => $request->tanggal_pemenuhan,
                'status' => 'Open' // Default jika dibuat manual
            ]
        );

        return redirect()->back()->with('message', 'Data CAR berhasil diperbarui');
    }
}
