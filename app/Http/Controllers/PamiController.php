<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PamiController extends Controller
{
    public function index()
    {
        // Render ke halaman React bernama "Pencatatan Audit Mutu Internal/Index"
        return Inertia::render('Pami/Index');
    }
}
