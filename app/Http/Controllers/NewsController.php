<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    // =================================================================
    //                            PUBLIC AREA
    //  Method di bawah ini diakses oleh pengunjung umum (Front-end)
    // =================================================================

    /**
     * Menampilkan daftar semua berita untuk halaman arsip/list publik.
     * Menggunakan pagination agar halaman tidak terlalu berat.
     */
    public function publicIndex()
    {
        // Ambil data berita terbaru, 10 per halaman
        $news = News::latest()->paginate(10);

        return Inertia::render('Public/News/NewsList', [
            // Transformasi data agar sesuai kebutuhan frontend
            'news' => $news->map(function ($item) {
                return [
                    'title'     => $item->title,
                    'slug'      => $item->slug,
                    // Buat kutipan pendek (excerpt) max 150 karakter & hapus tag HTML
                    'excerpt'   => Str::limit(strip_tags($item->content), 150),
                    // Generate URL lengkap gambar jika ada, atau null
                    'image_url' => $item->image ? asset('storage/' . $item->image) : null,
                    'date'      => $item->created_at->format('d M Y'),
                ];
            }),
            // Kirim data pagination manual karena kita memodifikasi collection 'news' di atas
            'pagination' => [
                'current_page' => $news->currentPage(),
                'last_page'    => $news->lastPage(),
            ]
        ]);
    }

    /**
     * Menampilkan 3 berita terbaru untuk halaman beranda (Landing Page).
     */
    public function landing()
    {
        // Ambil hanya 3 berita terbaru
        $news = News::latest()->take(3)->get()->map(function ($item) {
            return [
                'title'     => $item->title,
                'slug'      => $item->slug,
                // Excerpt lebih pendek untuk landing page (100 char)
                'excerpt'   => Str::limit(strip_tags($item->content), 100),
                'image_url' => $item->image ? asset('storage/' . $item->image) : null,
                'date'      => $item->created_at->format('d M Y'),
            ];
        });

        return Inertia::render('welcome', [
            'newsList' => $news
        ]);
    }

    /**
     * Menampilkan detail satu berita berdasarkan slug.
     */
    public function show($slug)
    {
        // Cari berita berdasarkan slug, jika tidak ketemu tampilkan 404 (firstOrFail)
        $news = News::where('slug', $slug)->firstOrFail();

        return Inertia::render('Public/News/NewsDetail', [
            'article' => [
                'title'     => $news->title,
                'content'   => $news->content, // Content full (biasanya HTML dari Rich Text Editor)
                'image_url' => $news->image ? asset('storage/' . $news->image) : null,
                'date'      => $news->created_at->format('d F Y'),
                'author'    => 'Admin', // Bisa diganti dinamis jika ada relasi user
            ]
        ]);
    }


    // =================================================================
    //                             ADMIN AREA
    //       Method di bawah ini untuk manajemen data (Back-end)
    // =================================================================

    /**
     * Menampilkan tabel daftar berita di dashboard Admin.
     */
    public function index()
    {
        return Inertia::render('News/Index', [
            'news' => News::latest()->get()->map(function ($item) {
                return [
                    'id'         => $item->id,
                    'title'      => $item->title,
                    'slug'       => $item->slug,
                    'image_url'  => $item->image ? asset('storage/' . $item->image) : null,
                    'created_at' => $item->created_at->format('d M Y'),
                ];
            })
        ]);
    }

    /**
     * Menampilkan form untuk membuat berita baru.
     */
    public function create()
    {
        return Inertia::render('News/Create');
    }

    /**
     * Menyimpan data berita baru ke database.
     */
    public function store(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'title'   => 'required|string',
            'content' => 'required|string',
            'image'   => 'nullable|image|max:2048', // Max 2MB
        ]);

        // 2. Handle Upload Gambar
        $path = null;
        if ($request->hasFile('image')) {
            // Simpan ke folder storage/app/public/uploads/news
            $path = $request->file('image')->store('uploads/news', 'public');
        }

        // 3. Simpan ke Database
        News::create([
            'title'   => $request->title,
            // Buat slug unik: judul-di-slug + string random 5 karakter
            'slug'    => Str::slug($request->title) . '-' . Str::random(5),
            'content' => $request->content,
            'image'   => $path,
        ]);

        return redirect()->route('News.index')->with('success', 'Berita berhasil dibuat.');
    }

    /**
     * Menghapus berita dan file gambarnya.
     */
    public function destroy($id)
    {
        $news = News::findOrFail($id);

        // Hapus file fisik gambar jika ada, agar storage tidak penuh sampah file
        if ($news->image) {
            Storage::disk('public')->delete($news->image);
        }

        // Hapus record dari database
        $news->delete();

        return back()->with('success', 'Berita berhasil dihapus.');
    }
}
