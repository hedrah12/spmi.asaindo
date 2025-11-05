<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class SppeppController extends Controller
{
    public function index()
    {
        // Render ke halaman React bernama "Siklus PPEPP/Index"
        return Inertia::render('sppepp/Index');
    }
}
