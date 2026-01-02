<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Form Permintaan Tindakan Koreksi (PTK)</title>

    <style>
        body {
            font-family: DejaVu Sans, Arial, Helvetica, sans-serif;
            font-size: 11.5px;
            color: #222;
            line-height: 1.4;
            margin-bottom: 60px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }

        th, td {
            border: 1px solid #444;
            padding: 6px 8px;
            vertical-align: top;
            font-size: 11.5px;
        }

        th {
            background-color: #f5f5f5;
            font-weight: bold;
            width: 20%;
        }

        tr {
            page-break-inside: avoid;
        }

        .header table {
            border: none;
        }

        .header h1 {
            margin: 0;
            font-size: 17px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .header h3 {
            margin: 0;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .header p {
            margin: 2px 0;
            font-size: 10px;
        }

        .section {
            margin-bottom: 14px;
        }

        .badge {
            padding: 3px 8px;
            border-radius: 4px;
            color: #fff;
            font-weight: bold;
            font-size: 10px;
            display: inline-block;
        }

        .bg-red { background-color: #b91c1c; }
        .bg-orange { background-color: #c2410c; }
        .bg-yellow { background-color: #a16207; }
        .bg-blue { background-color: #1d4ed8; }

        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9.5px;
            color: #666;
            border-top: 1px solid #444;
            padding-top: 4px;
        }
    </style>
</head>

<body>

<!-- HEADER -->
<div class="header">
    <table>
        <tr>
            <td rowspan="2" style="width:20%; text-align:center; vertical-align:middle;">
                <img src="{{ public_path('storage/logo/8PRb2dEJpjqwrclNWqe2u0GtZgyd7lEQ5awejVNe.png') }}"
                     alt="Logo Universitas Asa Indonesia"
                     style="width:120px;">
            </td>
            <td style="text-align:center; vertical-align:middle;">
                <h1>UNIT PENJAMINAN MUTU ASAINDO</h1>
                <p>Jl. Raya Kalimalang No. 2A Jakarta Timur</br>
                Jl. H. Ahmad R, Pondok Bambu Jakarta Timur</br>
                www.asaindo.ac.id</p>
            </td>
            <td style="width:20%; vertical-align:middle;">
                <h3>Nomor PTK</h3>
                <p>{{ $no_ptk }}</p>
            </td>
        </tr>
        <tr>
            <td style="text-align:center;">
                <h3>PERMINTAAN TINDAKAN KOREKSI</h3>
            </td>
            <td>
                <h3>Tanggal</h3>
                <p>{{ $tanggal }}</p>
            </td>
        </tr>
    </table>
</div>

<!-- IDENTITAS -->
<div class="section">
    <table>
        <tr>
            <th>Auditee</th>
            <td>{{ $nama_auditee ?? '-' }}</td>
            <th>Bagian / Unit</th>
            <td>{{ $nama_departemen ?? '-' }}</td>
        </tr>
        <tr>
            <th>Auditor</th>
            <td>{{ $nama_auditor ?? '-' }}</td>
            <th>Ketua Auditor</th>
            <td>Prof. Dr. Parlagutan Silitonga, M.M., MBA.</td>
        </tr>
        <tr>
            <th>Klasifikasi Temuan</th>
            <td>
                @php
                    $klasifikasi = $indikator->pami->skor ?? 'Observasi';
                    $bg = 'bg-yellow';
                    if (str_contains($klasifikasi, 'Mayor')) $bg = 'bg-red';
                    elseif (str_contains($klasifikasi, 'Minor')) $bg = 'bg-orange';
                    elseif (str_contains($klasifikasi, 'Sesuai') || str_contains($klasifikasi, 'Melampaui')) $bg = 'bg-blue';
                @endphp
                <span class="badge {{ $bg }}">{{ strtoupper($klasifikasi) }}</span>
            </td>
            <th>Kriteria / Elemen</th>
            <td>{{ $indikator->kriteria->kriteria ?? '-' }}</td>
        </tr>
    </table>
</div>

<!-- URAIAN TEMUAN -->
<div class="section">
    <table>
        <tr>
            <th>Uraian Temuan</th>
            <td colspan="3">{{ $indikator->car->temuan ?? '-' }}</td>
        </tr>
        <tr style="height:100px;">
            <th>Nama dan Tanda Tangan Auditor</th>
            <td style="vertical-align:bottom;">
                <div style="margin-bottom:35px; font-weight:bold; text-align:center;">
                    {{ $nama_auditor ?? '-' }}
                </div>
                <div style="text-align:center;">
                    ( ___________________ )
                </div>
            </td>
            <td colspan="2" style="vertical-align:bottom;">
                Tanggal : {{ $tanggal }}
            </td>
        </tr>
    </table>
</div>

<!-- AKAR MASALAH -->
<div class="section">
    <table>
        <tr>
            <th>Akar Masalah</th>
            <td colspan="3">{{ $indikator->car->akar_masalah ?? '(Belum diisi)' }}</td>
        </tr>
        <tr style="height:100px;">
            <th>Nama dan Tanda Tangan Auditee</th>
            <td style="vertical-align:bottom;">
                <div style="margin-bottom:35px; font-weight:bold;text-align:center;">
                    {{ $nama_auditee ?? '-' }}
                </div>
                <div style="text-align:center;">
                ( ___________________ )
                </div>
            </td>
            <td colspan="2" style="vertical-align:bottom;">
                Tanggal {{ $tanggal }}
            </td>
        </tr>
    </table>
</div>

<!-- TINDAKAN KOREKSI -->
<div class="section">
    <table>
        <tr>
            <th>Tindakan Koreksi</th>
            <td colspan="3">{{ $indikator->car->tindakan_koreksi ?? '(Belum diisi)' }}</td>
        </tr>
        <tr style="height:100px;">
            <th>Nama dan Tanda Tangan Auditee</th>
            <td style="vertical-align:bottom;">
                <div style="margin-bottom:35px; font-weight:bold; text-align:center;">
                    {{ $nama_auditee ?? '-' }}
                </div>
                <div style="text-align:center;">
                ( ___________________ )
                </div>
            </td>
            <td colspan="2" style="vertical-align:bottom;">
                Tanggal {{ $tanggal }}
            </td>
        </tr>
    </table>
</div>

<div class="footer">
    Dokumen ini digenerate secara otomatis oleh Sistem Penjaminan Mutu Internal (SPMI)
    Universitas Asa Indonesia.
</div>

</body>
</html>
