<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class KkriteriaController extends Controller
{
    public function index()
    {
        // Render ke halaman React bernama "Pencatatan Koreksi Lanjut/Index"
        return Inertia::render('kkriteria/Index');
    }
}
