<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DspmiController extends Controller
{
    public function index()
    {
        // Render ke halaman React bernama "Rencana Tindak Lanjut/Index"
        return Inertia::render('dspmi/Index');
    }
}
