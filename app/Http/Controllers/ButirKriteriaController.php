<?php

namespace App\Http\Controllers;

use App\Models\ButirKriteria;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ButirKriteriaController extends Controller
{
    public function index()
    {

        return Inertia::render('butirkriteria/Index');
    }
}
