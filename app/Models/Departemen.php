<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Departemen extends Model
{
    use HasFactory;

    protected $table = 'departemens';

    protected $fillable = [
        'nama_departemen',
        'user_id',
    ];

    // Relasi ke User (jika diperlukan)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
