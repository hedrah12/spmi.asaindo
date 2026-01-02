<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class News extends Model
{
    /**
     * Daftar kolom yang aman untuk diisi massal.
     * Pastikan input form sesuai dengan nama-nama ini.
     */
    protected $fillable = ['title', 'slug', 'content', 'image'];

    /**
     * ✨ VIRTUAL ATTRIBUTE (APPENDS)
     * Menambahkan key 'image_url' ke dalam hasil output JSON / Array model ini.
     * Sangat berguna untuk Frontend (Inertia/React) agar tidak perlu
     * merakit URL gambar secara manual.
     */
    protected $appends = ['image_url'];

    /**
     * ⚙️ MODEL BOOT / EVENT LISTENER
     * Method ini dijalankan otomatis saat Model diinisialisasi.
     */
    protected static function boot()
    {
        parent::boot();

        // Event 'creating': Dijalankan SESAAT SEBELUM data baru disimpan ke DB.
        static::creating(function ($news) {
            // 🤖 AUTO-SLUG GENERATOR
            // Jika Controller lupa membuat slug, Model ini akan membuatnya otomatis dari Title.
            // Contoh: "Berita Hari Ini" -> "berita-hari-ini"
            // Note: Logika ini membuat controller menjadi lebih bersih (Fat Model, Skinny Controller).
            $news->slug = Str::slug($news->title);
        });
    }

    /**
     * 🔗 ACCESSOR: getImageUrlAttribute
     * Logika untuk atribut virtual 'image_url' di atas.
     *
     * Fungsi:
     * Mengubah path relatif database ("uploads/news/foto.jpg")
     * Menjadi URL lengkap ("http://website.com/storage/uploads/news/foto.jpg")
     *
     * Cara akses di code: $news->image_url
     */
    public function getImageUrlAttribute()
    {
        // Cek apakah ada data image, jika ada bungkus dengan asset(), jika tidak return null
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}
