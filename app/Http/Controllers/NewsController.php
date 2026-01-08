<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    /**
     * Menampilkan tabel daftar berita di dashboard Admin.
     */
    public function index()
    {
        // [FIX] Sesuai folder: pages/News/Index.tsx
        return Inertia::render('news/Index', [
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
        // [FIX] Sesuai folder: pages/News/Create.tsx
        return Inertia::render('news/Create');
    }

    /**
     * Menyimpan data berita baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
            'image'   => 'nullable|image|max:2048',
        ]);

        $path = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('uploads/news', 'public');
        }

        news::create([
            'title'   => $request->title,
            'slug'    => Str::slug($request->title) . '-' . Str::random(5),
            'content' => $request->content,
            'image'   => $path,
        ]);

        // [FIX] Redirect ke route 'news.index' (huruf kecil sesuai web.php)
        return redirect()->route('news.index')->with('success', 'Berita berhasil dibuat.');
    }

    /**
     * Menampilkan form Edit Berita.
     */
    public function edit($id)
    {
        $news = news::findOrFail($id);

        // [FIX] Sesuai folder (Asumsi Anda punya pages/News/Edit.tsx)
        // Jika belum ada, pastikan file Edit.tsx ada di folder News
        return Inertia::render('news/Edit', [
            'news' => [
                'id'        => $news->id,
                'title'     => $news->title,
                'content'   => $news->content,
                'image_url' => $news->image ? asset('storage/' . $news->image) : null,
            ]
        ]);
    }

    /**
     * Update berita.
     */
    public function update(Request $request, $id)
    {
        $news = news::findOrFail($id);

        $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
            'image'   => 'nullable|image|max:2048',
        ]);

        $data = [
            'title'   => $request->title,
            'content' => $request->content,
        ];

        if ($request->hasFile('image')) {
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }
            $data['image'] = $request->file('image')->store('uploads/news', 'public');
        }

        $news->update($data);

        return redirect()->route('news.index')->with('success', 'Berita berhasil diperbarui.');
    }

    /**
     * Hapus berita.
     */
    public function destroy($id)
    {
        $news = news::findOrFail($id);
        if ($news->image) {
            Storage::disk('public')->delete($news->image);
        }
        $news->delete();

        return back()->with('success', 'Berita berhasil dihapus.');
    }

    /**
     * Redirect Show ke Edit untuk Admin (Mencegah konflik)
     */
    public function show($id)
    {
        return redirect()->route('news.edit', $id);
    }
}
