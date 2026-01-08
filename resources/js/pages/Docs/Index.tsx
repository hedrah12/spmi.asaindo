import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react'; // Link tidak dipakai, hapus jika mau
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
    FolderPlus, FilePlus, Folder, FileText,
    Pencil, Trash2, Home, ChevronRight, Link as LinkIcon,
    Upload, FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

interface DocItem {
    id: number;
    name: string;
    url?: string;
    type: 'folder' | 'file';
    is_active: boolean;
    parent_id?: number;
}

interface Props {
    items: DocItem[];
    currentFolder: DocItem | null;
    ancestors: DocItem[];
}

export default function AdminDocsIndex({ items, currentFolder, ancestors }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [createType, setCreateType] = useState<'folder' | 'file'>('folder');
    const [editingItem, setEditingItem] = useState<DocItem | null>(null);

    // Form Create
    const createForm = useForm({
        name: '',
        url: '',
        type: 'folder',
        parent_id: currentFolder?.id || null
    });

    // Form Edit
    const editForm = useForm({
        name: '',
        url: '',
        is_active: true
    });

    // Form Import
    const importForm = useForm<{
        file: File | null,
        parent_id: number | null
    }>({
        file: null,
        parent_id: currentFolder?.id || null
    });

    // Handle Create
    const openCreate = (type: 'folder' | 'file') => {
        setCreateType(type);
        createForm.reset();
        createForm.setData({
            name: '',
            url: '',
            type: type,
            parent_id: currentFolder?.id || null
        });
        createForm.clearErrors();
        setIsCreateOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('docs.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                toast.success(`${createType === 'folder' ? 'Folder' : 'Dokumen'} berhasil dibuat`);
            }
        });
    };

    // Handle Edit
    const openEdit = (item: DocItem) => {
        setEditingItem(item);
        editForm.setData({
            name: item.name,
            url: item.url || '',
            is_active: !!item.is_active
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        editForm.put(route('docs.update', editingItem.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                toast.success('Berhasil diperbarui');
            }
        });
    };

    // Handle Import
    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Update parent_id terbaru sebelum submit
        importForm.transform((data) => ({
            ...data,
            parent_id: currentFolder?.id || null
        }));

        importForm.post(route('docs.import'), {
            onSuccess: () => {
                setIsImportOpen(false);
                importForm.reset();
                toast.success('File berhasil diimport');
            },
            forceFormData: true,
        });
    };

    // Fungsi download template (DIPERBAIKI: Menggunakan titik koma ;)
    const downloadTemplate = () => {
        // Header: name;url
        // Data: Contoh 1;https://...
        const csvContent = "data:text/csv;charset=utf-8,name;url\nContoh Dokumen 1;https://google.com\nContoh Dokumen 2;https://drive.google.com/file/d/xxxx";

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "template_import_dokumen.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus item ini? Jika folder, isinya akan ikut terhapus.')) {
            router.delete(route('docs.destroy', id), {
                onSuccess: () => toast.success('Berhasil dihapus')
            });
        }
    };

    const navigateTo = (folderId: number | null) => {
        router.get(route('docs.index'), { folder: folderId });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'CMS Dokumen', href: '/admin/docs' }]}>
            <Head title="Kelola Dokumen" />

            <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Header & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Repository Dokumen</h1>
                            <p className="text-sm text-gray-500">Atur struktur folder dan link dokumen publik.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {/* Tombol Import */}
                            <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => setIsImportOpen(true)}>
                                <Upload className="w-4 h-4 mr-2" /> Import Excel
                            </Button>

                            <Button variant="outline" onClick={() => openCreate('folder')}>
                                <FolderPlus className="w-4 h-4 mr-2" /> Folder Baru
                            </Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => openCreate('file')}>
                                <FilePlus className="w-4 h-4 mr-2" /> Link Dokumen
                            </Button>
                        </div>
                    </div>

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1 text-sm text-gray-600 bg-white p-3 rounded-lg border shadow-sm overflow-x-auto whitespace-nowrap">
                        <button onClick={() => navigateTo(null)} className="hover:text-indigo-600 flex items-center">
                            <Home className="w-4 h-4" />
                        </button>
                        {ancestors.map((crumb) => (
                            <React.Fragment key={crumb.id}>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <button onClick={() => navigateTo(crumb.id)} className="hover:text-indigo-600 font-medium">
                                    {crumb.name}
                                </button>
                            </React.Fragment>
                        ))}
                        {currentFolder && (
                            <>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className="font-bold text-gray-900">{currentFolder.name}</span>
                            </>
                        )}
                    </div>

                    {/* List Items */}
                    <Card className="border-0 shadow-md">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Tipe/URL</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead className="text-right w-[120px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                                Folder ini kosong.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item) => (
                                            <TableRow key={item.id} className="group hover:bg-gray-50/50">
                                                <TableCell>
                                                    {item.type === 'folder' ? (
                                                        <Folder className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                                    ) : (
                                                        <FileText className="w-5 h-5 text-blue-500" />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {item.type === 'folder' ? (
                                                        <button
                                                            onClick={() => navigateTo(item.id)}
                                                            className="font-semibold text-gray-800 hover:text-indigo-600 hover:underline text-left"
                                                        >
                                                            {item.name}
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-900 font-medium">{item.name}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {item.type === 'file' ? (
                                                        <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 text-xs max-w-[250px] truncate">
                                                            <LinkIcon size={10} /> {item.url}
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Folder</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {item.is_active ? 'Aktif' : 'Sembunyi'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-indigo-600" onClick={() => openEdit(item)}>
                                                            <Pencil size={14} />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => handleDelete(item.id)}>
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* MODAL CREATE */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{createType === 'folder' ? 'Buat Folder Baru' : 'Tambah Link Dokumen'}</DialogTitle>
                            <DialogDescription>
                                {createType === 'folder'
                                    ? `Membuat folder di dalam "${currentFolder?.name || 'Home'}"`
                                    : 'Masukkan link dokumen (G-Drive, Dropbox, dll).'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <Label>Nama {createType === 'folder' ? 'Folder' : 'Dokumen'}</Label>
                                <Input
                                    value={createForm.data.name}
                                    onChange={e => createForm.setData('name', e.target.value)}
                                    placeholder={createType === 'folder' ? 'Contoh: Akreditasi 2024' : 'Contoh: SK Rektor No. 1'}
                                />
                                {createForm.errors.name && <p className="text-xs text-red-500">{createForm.errors.name}</p>}
                            </div>

                            {createType === 'file' && (
                                <div className="space-y-1">
                                    <Label>URL Link</Label>
                                    <Input
                                        value={createForm.data.url}
                                        onChange={e => createForm.setData('url', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    {createForm.errors.url && <p className="text-xs text-red-500">{createForm.errors.url}</p>}
                                </div>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={createForm.processing} className="bg-indigo-600">Simpan</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL EDIT */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Item</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <Label>Nama</Label>
                                <Input
                                    value={editForm.data.name}
                                    onChange={e => editForm.setData('name', e.target.value)}
                                />
                            </div>

                            {editingItem?.type === 'file' && (
                                <div className="space-y-1">
                                    <Label>URL Link</Label>
                                    <Input
                                        value={editForm.data.url}
                                        onChange={e => editForm.setData('url', e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-50">
                                <Label className="cursor-pointer">Status Tampil</Label>
                                <Switch
                                    checked={editForm.data.is_active}
                                    onCheckedChange={(c) => editForm.setData('is_active', c)}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={editForm.processing}>Update</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* MODAL IMPORT EXCEL */}
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Import Dokumen dari Excel</DialogTitle>
                            <DialogDescription>
                                Masukkan file Excel (.xlsx, .csv) yang berisi daftar dokumen.
                                Data akan dimasukkan ke folder: <b>{currentFolder?.name || 'Home (Root)'}</b>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-start gap-3">
                            <FileSpreadsheet className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold mb-1">Format Excel/CSV:</p>
                                <p>Pastikan file memiliki header kolom: <b>name</b> dan <b>url</b>.</p>
                                {/* [FIX] Tambahkan instruksi tentang titik koma */}
                                <p className="text-xs mt-1 text-blue-600 font-semibold">Gunakan pemisah titik koma (;) jika memakai file CSV.</p>
                                <button onClick={downloadTemplate} className="text-blue-600 underline hover:text-blue-800 font-medium mt-2 text-xs">
                                    Download Template CSV
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleImportSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <Label>Pilih File</Label>
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={e => importForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                    className="cursor-pointer"
                                />
                                {importForm.errors.file && <p className="text-xs text-red-500">{importForm.errors.file}</p>}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsImportOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={importForm.processing || !importForm.data.file} className="bg-green-600 hover:bg-green-700">Import Data</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    );
}
