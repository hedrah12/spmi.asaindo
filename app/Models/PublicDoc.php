<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicDoc extends Model
{
    use HasFactory;

    protected $table = 'public_docs';

    protected $fillable = ['name', 'url', 'is_active', 'type', 'parent_id'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relasi ke Parent (Folder diatasnya)
    public function parent()
    {
        return $this->belongsTo(PublicDoc::class, 'parent_id');
    }

    // Relasi ke Children (Isi folder)
    public function children()
    {
        return $this->hasMany(PublicDoc::class, 'parent_id');
    }

    // Helper untuk Breadcrumbs
    public function getAncestors()
    {
        $ancestors = collect([]);
        $current = $this;
        while ($current->parent) {
            $ancestors->prepend($current->parent);
            $current = $current->parent;
        }
        return $ancestors;
    }
}
