import React, { useState, useEffect, useMemo } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { FileSpreadsheet, UploadCloud, Download } from "lucide-react"; // Icon tambahan

export default function IndikatorIndex({ data, filters, masterData }) {

    // --- STATE UTAMA ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false); // State untuk Modal Import
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search || "");

    // --- FORM MANUAL ---
    const [formData, setFormData] = useState({
        namaIndikator: "",
        id_lingkup: "",
        id_kriteria: "",
        id_standar: "",
    });

    // --- FORM IMPORT EXCEL (Inertia useForm) ---
    const importForm = useForm({
        file: null,
    });

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Indikator", href: "/indikator" },
    ];

    // --- LOGIC FILTERING ---
    const filteredKriterias = useMemo(() => {
        if (!formData.id_lingkup) return [];
        return masterData.kriterias.filter(
            (k) => String(k.id_lingkup) === String(formData.id_lingkup)
        );
    }, [formData.id_lingkup, masterData.kriterias]);

    const filteredStandars = useMemo(() => {
        if (!formData.id_kriteria) return [];
        return masterData.standars.filter(
            (s) => String(s.id_kriteria) === String(formData.id_kriteria)
        );
    }, [formData.id_kriteria, masterData.standars]);

    // --- EFFECTS ---
    useEffect(() => {
        const delay = setTimeout(() => {
            router.get("/indikator", { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    // --- HANDLERS MANUAL ---
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validasi Frontend
        if (!formData.id_lingkup) { toast.error("Pilih Lingkup dulu!"); return; }
        if (!formData.id_kriteria) { toast.error("Pilih Kriteria dulu!"); return; }
        if (!formData.id_standar) { toast.error("Pilih Standar dulu!"); return; }
        if (!formData.namaIndikator) { toast.error("Isi Indikator!"); return; }

        const payload = {
            namaIndikator: formData.namaIndikator,
            id_kriteria: formData.id_kriteria,
            id_standar: formData.id_standar,
        };

        const options = {
            onSuccess: () => {
                toast.success(isEditMode ? "Data diperbarui" : "Data disimpan");
                closeModal();
            },
            onError: () => toast.error("Gagal menyimpan data"),
        };

        if (isEditMode && selectedId) {
            router.put(`/indikator/${selectedId}`, payload, options);
        } else {
            router.post("/indikator", payload, options);
        }
    };

    // --- HANDLER IMPORT ---
    const handleImportSubmit = (e) => {
        e.preventDefault();

        if (!importForm.data.file) {
            toast.error("Pilih file Excel terlebih dahulu");
            return;
        }

        importForm.post(route('indikator.import'), { // Pastikan route ini ada di web.php
            onSuccess: () => {
                setIsImportOpen(false);
                importForm.reset();
                toast.success("Import Berhasil", { description: "Data Excel berhasil diproses." });
            },
            onError: (errors) => {
                toast.error("Gagal Import", { description: errors.file || "Cek format file anda." });
            }
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setFormData({ namaIndikator: "", id_lingkup: "", id_kriteria: "", id_standar: "" });
    };

    const handleEdit = (item) => {
        setSelectedId(item.id_indikator);
        setIsEditMode(true);
        setIsModalOpen(true);

        const lingkupId = item.kriteria?.id_lingkup ? String(item.kriteria.id_lingkup) : "";

        setFormData({
            namaIndikator: item.pernyataan_indikator,
            id_lingkup: lingkupId,
            id_kriteria: item.id_kriteria ? String(item.id_kriteria) : "",
            id_standar: item.id_standar ? String(item.id_standar) : "",
        });
    };

    const handleDelete = (id) => {
        if (!confirm("Yakin hapus?")) return;
        router.delete(`/indikator/${id}`, { onSuccess: () => toast.success("Terhapus") });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Indikator" />

            <div className="p-8 bg-gray-100 min-h-screen dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">

                {/* --- HEADER & BUTTONS --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        Indikator
                    </h1>

                    <div className="flex gap-2">
                        {/* 1. TOMBOL IMPORT EXCEL */}
                        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400">
                                    <FileSpreadsheet size={16} />
                                    Import Excel
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Import Data dari Excel</DialogTitle>
                                    <DialogDescription>
                                        Gunakan format header: <br/>
                                        <code className="bg-muted px-1 rounded text-xs font-mono">lingkup | standar | departemen | pernyataan_standar | indikator</code>
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleImportSubmit} className="space-y-4 py-2">
                                    <div className="grid w-full gap-2">
                                        <Label htmlFor="excel">File Excel (.xlsx)</Label>
                                        <Input
                                            id="excel"
                                            type="file"
                                            accept=".xlsx, .xls"
                                            onChange={(e) => importForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                            className="cursor-pointer"
                                        />
                                        {importForm.errors.file && (
                                            <p className="text-red-500 text-xs">{importForm.errors.file}</p>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 flex gap-2">
                                        <UploadCloud size={16} className="shrink-0 mt-0.5" />
                                        <p>Pastikan data Induk (Lingkup & Kriteria) sesuai nama agar tidak duplikat.</p>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => setIsImportOpen(false)}>Batal</Button>
                                        <Button type="submit" disabled={importForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                            {importForm.processing ? "Mengupload..." : "Upload & Import"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* 2. TOMBOL TAMBAH MANUAL */}
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="shadow-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                    onClick={() => { setIsEditMode(false); setFormData({ namaIndikator: "", id_lingkup: "", id_kriteria: "", id_standar: "" }); }}>
                                    Tambah Manual
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[700px]">
                                <DialogHeader>
                                    <DialogTitle>{isEditMode ? "Edit Indikator" : "Tambah Indikator"}</DialogTitle>
                                    <DialogDescription>Isi form berikut secara berurutan.</DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                    {/* SELECT LINGKUP */}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Lingkup</Label>
                                        <div className="col-span-3">
                                            <Select
                                                value={formData.id_lingkup}
                                                onValueChange={(val) => {
                                                    setFormData({ ...formData, id_lingkup: val, id_kriteria: "", id_standar: "" });
                                                }}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Pilih Lingkup" /></SelectTrigger>
                                                <SelectContent>
                                                    {masterData?.lingkups?.map((l) => (
                                                        <SelectItem key={l.id_lingkup} value={String(l.id_lingkup)}>{l.nama_lingkup}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* SELECT KRITERIA */}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Kriteria</Label>
                                        <div className="col-span-3">
                                            <Select
                                                disabled={!formData.id_lingkup}
                                                value={formData.id_kriteria}
                                                onValueChange={(val) => setFormData({ ...formData, id_kriteria: val, id_standar: "" })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={formData.id_lingkup ? "Pilih Kriteria" : "Pilih Lingkup Dulu"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filteredKriterias.map((k) => (
                                                        <SelectItem key={k.id_kriteria} value={String(k.id_kriteria)}>{k.kriteria}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* SELECT STANDAR */}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Standar</Label>
                                        <div className="col-span-3">
                                            <Select
                                                disabled={!formData.id_kriteria}
                                                value={formData.id_standar}
                                                onValueChange={(val) => setFormData({ ...formData, id_standar: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={formData.id_kriteria ? "Pilih Standar" : "Pilih Kriteria Dulu"} />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60 w-120 overflow-y-auto">
                                                    {filteredStandars.map((s) => (
                                                        <SelectItem key={s.id_standar} value={String(s.id_standar)}>{s.pernyataan_standar}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* INPUT PERNYATAAN */}
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <Label className="text-right mt-2">Indikator</Label>
                                        <Textarea
                                            disabled={!formData.id_standar}
                                            value={formData.namaIndikator}
                                            onChange={(e) => setFormData({ ...formData, namaIndikator: e.target.value })}
                                            className="col-span-3"
                                            placeholder={formData.id_standar ? "Isi indikator..." : "Pilih Standar Dulu"}
                                            required
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                        <Button type="submit" disabled={!formData.namaIndikator}>Simpan</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* --- SEARCH & TABLE --- */}
                <div className="mb-4">
                    <Input placeholder="Cari Indikator, Standar, atau Kriteria..." className="w-full md:w-96 bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <Card className="bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl overflow-hidden border">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                <th className="p-4 w-1">No</th>
                                <th className="p-4">Lingkup</th>
                                <th className="p-4">Kriteria</th>
                                <th className="p-4">Standar</th>
                                <th className="p-4">Pernyataan Indikator</th>
                                <th className="p-4 w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">Belum ada data indikator.</td></tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={item.id_indikator} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="p-4 text-center">{index + 1}</td>
                                        <td className="p-4 text-xs font-medium text-gray-600 dark:text-gray-300">{item.kriteria?.lingkup?.nama_lingkup || "-"}</td>
                                        <td className="p-4 text-xs">{item.kriteria?.kriteria || "-"}</td>
                                        <td className="p-4 text-xs text-justify whitespace-pre-line w-80">{item.standar?.pernyataan_standar || "-"}</td>
                                        <td className="p-4 align-top text-justify whitespace-pre-line w-120 font-semibold text-gray-800 dark:text-gray-200">
                                            {item.pernyataan_indikator}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2 justify-center">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>Edit</Button>
                                                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleDelete(item.id_indikator)}>Hapus</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>

            </div>
        </AppLayout>
    );
}
