<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ButirKriteria extends Model
{
    use HasFactory;

    protected $table = 'butir_kriteria'; // nama tabel

    protected $fillable = [
        'element',
        'indikator',
        'prodi',
        'lingkup',
        'auditor',
        'auditee',
        'siklus',
    ];
}
