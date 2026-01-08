<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\PublicDoc;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PublicController extends Controller
{
    /**
     * 1. Halaman Beranda (Home / Landing Page)
     * URL: /
     */
    public function home()
    {
        // Ambil 3 berita terbaru untuk section berita di landing page
        $newsList = News::latest()->take(3)->get()->map(function ($item) {
            return [
                'title'     => $item->title,
                'slug'      => $item->slug,
                'excerpt'   => Str::limit(strip_tags($item->content), 100),
                'image_url' => $item->image ? asset('storage/' . $item->image) : null,
                'date'      => $item->created_at->format('d M Y'),
            ];
        });

        return Inertia::render('welcome', [
            'newsList' => $newsList
        ]);
    }

    /**
     * 2. Halaman Daftar Berita
     * URL: /berita
     */
    public function berita()
    {
        // Menggunakan pagination 9 item per halaman agar rapi di grid 3x3
        $news = News::latest()->paginate(9);

        return Inertia::render('Public/News/NewsList', [
            'news' => $news->map(function ($item) {
                return [
                    'title'     => $item->title,
                    'slug'      => $item->slug,
                    'excerpt'   => Str::limit(strip_tags($item->content), 150),
                    'image_url' => $item->image ? asset('storage/' . $item->image) : null,
                    'date'      => $item->created_at->format('d M Y'),
                ];
            }),
            // Pass pagination data manual jika perlu custom di frontend,
            // atau biarkan inertia menangani links() dari object pagination asli jika tidak dimap.
            // Karena kita map, kita ambil meta datanya:
            'pagination' => [
                'current_page' => $news->currentPage(),
                'last_page'    => $news->lastPage(),
                'next_page_url' => $news->nextPageUrl(),
                'prev_page_url' => $news->previousPageUrl(),
            ]
        ]);
    }

    /**
     * 3. Halaman Detail Berita
     * URL: /berita/{slug}
     */
    public function beritaShow($slug)
    {
        $news = News::where('slug', $slug)->firstOrFail();

        return Inertia::render('Public/News/NewsDetail', [
            'article' => [
                'title'     => $news->title,
                'content'   => $news->content,
                'image_url' => $news->image ? asset('storage/' . $news->image) : null,
                'date'      => $news->created_at->format('d F Y'),
                'author'    => 'Admin', // Sesuaikan jika ada relasi user
            ]
        ]);
    }

    /**
     * 4. Halaman Dokumen Publik
     * URL: /dokumen
     */
    public function dokumen(Request $request)
    {
        $folderId = $request->query('folder');

        // 1. Cek Folder Aktif (jika ada parameter folder)
        $currentFolder = null;
        if ($folderId) {
            $currentFolder = PublicDoc::where('id', $folderId)
                ->where('is_active', true)
                ->firstOrFail();
        }

        // 2. Ambil Breadcrumb (Jalur Folder)
        $ancestors = $currentFolder ? $currentFolder->getAncestors() : collect([]);

        // 3. Ambil Item (Folder & File) di dalam folder ini
        // Hanya yang is_active = true karena ini halaman publik
        $items = PublicDoc::where('parent_id', $folderId)
            ->where('is_active', true)
            ->orderBy('type', 'desc') // Folder tampil duluan
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Public/Dokumen', [
            'items'         => $items,
            'currentFolder' => $currentFolder,
            'ancestors'     => $ancestors
        ]);
    }

    /**
     * 5. Halaman Kontak
     * URL: /kontak
     */
    public function kontak()
    {
        return Inertia::render('Public/kontak');
    }
}
