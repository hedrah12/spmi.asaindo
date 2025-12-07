<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lingkup extends Model
{
    use HasFactory;

    protected $table = 'lingkups';

    protected $fillable = [
        'nama_lingkup',
    ];
}
