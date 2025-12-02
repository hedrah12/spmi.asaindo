<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kriteria extends Model
{
    use HasFactory;

    // Nama tabel di database
    protected $table = 'kriterias';

    // Kolom yang boleh diisi (Mass Assignment)
    protected $fillable = [
        'kriteria',
        'id_lingkup',
    ];
}
