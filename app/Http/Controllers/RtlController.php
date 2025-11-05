<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class RtlController extends Controller
{
    public function index()
    {
        // Render ke halaman React bernama "Rencana Tindak Lanjut/Index"
        return Inertia::render('rtl/Index');
    }
}
