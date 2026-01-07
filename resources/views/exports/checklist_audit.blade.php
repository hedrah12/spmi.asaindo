<!DOCTYPE html>
<html>
<head>
    <title>Checklist Audit Mutu Internal</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 12px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h2 {
            margin: 0;
            text-transform: uppercase;
        }
        .header p {
            margin: 2px 0;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .meta-table td {
            padding: 5px;
            vertical-align: top;
        }

        .content-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .content-table th,
        .content-table td {
            border: 1px solid #000;
            padding: 6px;
            vertical-align: top;
        }
        .content-table th {
            background-color: #f0f0f0;
            text-align: center;
            font-weight: bold;
        }

        .signature-section {
            width: 100%;
            margin-top: 30px;
            page-break-inside: avoid;
        }
        .signature-box {
            float: left;
            width: 45%;
            text-align: center;
        }
        .signature-line {
            margin-top: 60px;
            border-bottom: 1px solid black;
            display: inline-block;
            width: 80%;
        }

        .page-break {
            page-break-after: always;
        }
        .text-center {
            text-align: center;
        }
        .font-bold {
            font-weight: bold;
        }
        /* Utilitas tambahan untuk baris header kategori */
        .category-header {
            border: none !important;
            padding-top: 15px;
            padding-bottom: 5px;
            font-size: 13px;
        }
    </style>
</head>
<body>

    @foreach($jadwal->details as $index => $detail)

    {{-- HEADER --}}
    <div class="header">
        <h2>Universitas Asa Indonesia</h2>
        <h2>Checklist Audit Mutu Internal</h2>
        <p>Periode Audit {{ $jadwal->tahun }}</p>
    </div>

    {{-- META INFO --}}
    <table class="meta-table">
        <tr>
            <td width="15%"><strong>No. SK</strong></td>
            <td width="35%">: {{ $jadwal->no_sk ?? '-' }}</td>
            <td width="15%"><strong>Tanggal Audit</strong></td>
            <td width="35%">: {{ \Carbon\Carbon::parse($jadwal->tgl_mulai)->format('d-m-Y') }} s/d {{ \Carbon\Carbon::parse($jadwal->tgl_selesai)->format('d-m-Y') }}</td>
        </tr>
        <tr>
            <td><strong>Auditee (Unit)</strong></td>
            <td>: {{ $detail->departemen->nama_departemen }}</td>
            <td><strong>Auditor</strong></td>
            <td>: {{ $detail->auditor->name }}</td>
        </tr>
    </table>

    {{-- CONTENT TABLE --}}
    <table class="content-table">
        <thead>
            <tr>
                <th width="35%">Standar / Kriteria</th>
                <th width="35%">Indikator / Pertanyaan</th>
                <th width="30%">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @php
                // Filter standar yang milik departemen ini
                $deptStandars = $standars->where('id_departemen', $detail->id_departemen);
            @endphp

            @forelse($deptStandars as $st)

                {{-- BARIS 1: JUDUL KATEGORI / KRITERIA (Tanpa Border Samping) --}}
                <tr>
                    <td colspan="3" class="category-header">
                        <strong>{{ $st->kriteria->kriteria ?? 'Standar Audit' }}</strong>
                    </td>
                </tr>

                {{-- LOOP INDIKATOR --}}
                @if($st->indikators->count() > 0)
                    @foreach($st->indikators as $ind)
                        <tr>
                            {{-- Kolom 1: Pernyataan Standar --}}
                            <td>
                                {{ $st->pernyataan_standar }}
                            </td>

                            {{-- Kolom 2: Pernyataan Indikator --}}
                            <td>
                                {{ $ind->pernyataan_indikator }}
                            </td>

                            {{-- Kolom 3: Kolom Status Manual --}}
                            <td>
                                Status : Melampaui / Memenuhi / Observasi / KRS Major / KTS Minor
                                <br><br>
                                <p>Catatan Auditor:</p>
                                <br><br><br>
                            </td>
                        </tr>
                    @endforeach
                @else
                    {{-- Jika Standar ada tapi tidak ada indikator --}}
                    <tr>
                        <td>{{ $st->pernyataan_standar }}</td>
                        <td class="text-center"><i>Belum ada indikator</i></td>
                        <td>Status : ...</td>
                    </tr>
                @endif

            @empty
                {{-- Jika tidak ada data standar sama sekali --}}
                <tr>
                    <td colspan="3" class="text-center" style="padding: 20px;">
                        Tidak ada standar audit yang dipetakan untuk departemen ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    {{-- TANDA TANGAN --}}
    <div class="signature-section">
        <div class="signature-box">
            <p>Auditee,</p>
            <div class="signature-line"></div>
            <p>( ....................................... )</p>
        </div>
        <div class="signature-box" style="float: right">
            <p>Auditor,</p>
            <div class="signature-line"></div>
            <p><strong>{{ $detail->auditor->name }}</strong></p>
        </div>
        <div style="clear: both"></div>
    </div>

    {{-- Page Break untuk Detail berikutnya (Kecuali halaman terakhir) --}}
    @if(!$loop->last)
        <div class="page-break"></div>
    @endif

    @endforeach

</body>
</html>
