import React, { useState, useEffect, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
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

export default function StandarIndex({ data, filters, masterData }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        namaStandar: "",
        id_lingkup: "",
        id_kriteria: "",
        id_departemen: "",
    });

    const [search, setSearch] = useState(filters.search || "");

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Standar", href: "/standar" },
    ];

    // --- 1. FILTERING & DEPENDENCY LOGIC ---

    // Filter Kriteria berdasarkan Lingkup
    const filteredKriterias = useMemo(() => {
        if (!formData.id_lingkup) return [];
        return masterData.kriterias.filter(
            (k) => String(k.id_lingkup) === String(formData.id_lingkup)
        );
    }, [formData.id_lingkup, masterData.kriterias]);

    // (Opsional) Filter Departemen jika ada relasi
    // Jika Departemen tidak bergantung pada Kriteria di database,
    // kita tetap bisa disable field-nya secara visual (UI Logic)
    // Di sini kita asumsikan semua departemen muncul, tapi field-nya mati dulu.

    // ---------------------------------------

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get("/standar", { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validasi Frontend Bertahap
        if (!formData.id_lingkup) { toast.error("Pilih Lingkup dulu!"); return; }
        if (!formData.id_kriteria) { toast.error("Pilih Kriteria dulu!"); return; }
        if (!formData.id_departemen) { toast.error("Pilih Departemen dulu!"); return; }
        if (!formData.namaStandar) { toast.error("Isi Pernyataan Standar!"); return; }

        const payload = {
            namaStandar: formData.namaStandar,
            id_kriteria: formData.id_kriteria,
            id_departemen: formData.id_departemen,
            // id_lingkup tidak dikirim ke server (sesuai request sebelumnya)
        };

        const options = {
            onSuccess: () => {
                toast.success(isEditMode ? "Data diperbarui" : "Data disimpan");
                closeModal();
            },
            onError: () => toast.error("Gagal menyimpan data"),
        };

        if (isEditMode && selectedId) {
            router.put(`/standar/${selectedId}`, payload, options);
        } else {
            router.post("/standar", payload, options);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setFormData({ namaStandar: "", id_lingkup: "", id_kriteria: "", id_departemen: "" });
    };

    const handleEdit = (item) => {
        setSelectedId(item.id_standar);
        setIsEditMode(true);
        setIsModalOpen(true);

        const relatedLingkupId = item.kriteria?.id_lingkup ? String(item.kriteria.id_lingkup) : "";

        setFormData({
            namaStandar: item.pernyataan_standar,
            id_lingkup: relatedLingkupId,
            id_kriteria: item.id_kriteria ? String(item.id_kriteria) : "",
            id_departemen: item.id_departemen ? String(item.id_departemen) : "",
        });
    };

    const handleDelete = (id) => {
        if (!confirm("Yakin hapus?")) return;
        router.delete(`/standar/${id}`, { onSuccess: () => toast.success("Terhapus") });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Standar" />

            <div className="p-8 bg-gray-100 min-h-screen
    dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">

                <div className="flex justify-between mb-6">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Standar</h1>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                onClick={() => { setIsEditMode(false); setFormData({ namaStandar: "", id_lingkup: "", id_kriteria: "", id_departemen: "" }); }}>
                                Tambah
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[700px]">
                            <DialogHeader>
                                <DialogTitle>{isEditMode ? "Edit Standar" : "Tambah Standar"}</DialogTitle>
                                <DialogDescription>Isi form berikut secara berurutan.</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                                {/* 1. SELECT LINGKUP (Awal) */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Lingkup</Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={formData.id_lingkup}
                                            onValueChange={(val) => {
                                                // Reset semua anak di bawahnya
                                                setFormData({
                                                    ...formData,
                                                    id_lingkup: val,
                                                    id_kriteria: "",
                                                    id_departemen: "", // Reset juga
                                                    namaStandar: ""    // Reset juga
                                                });
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

                                {/* 2. SELECT KRITERIA (Disabled jika Lingkup Kosong) */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Kriteria</Label>
                                    <div className="col-span-3">
                                        <Select
                                            disabled={!formData.id_lingkup} // Syarat 1
                                            value={formData.id_kriteria}
                                            onValueChange={(val) => {
                                                // Reset anak di bawahnya
                                                setFormData({
                                                    ...formData,
                                                    id_kriteria: val,
                                                    id_departemen: "", // Reset
                                                    namaStandar: ""    // Reset
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={formData.id_lingkup ? "Pilih Kriteria" : "Pilih Lingkup Dulu"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredKriterias.length > 0 ? (
                                                    filteredKriterias.map((k) => (
                                                        <SelectItem key={k.id_kriteria} value={String(k.id_kriteria)}>{k.kriteria}</SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-sm text-center text-gray-500">Tidak ada kriteria di lingkup ini</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* 3. SELECT DEPARTEMEN (Disabled jika Kriteria Kosong) */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Departemen</Label>
                                    <div className="col-span-3">
                                        <Select
                                            disabled={!formData.id_kriteria} // Syarat 2
                                            value={formData.id_departemen}
                                            onValueChange={(val) => {
                                                setFormData({ ...formData, id_departemen: val });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={formData.id_kriteria ? "Pilih Departemen" : "Pilih Kriteria Dulu"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {masterData?.departemens?.map((d) => (
                                                    <SelectItem key={d.id_departemen} value={String(d.id_departemen)}>{d.nama_departemen}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* 4. INPUT PERNYATAAN (Disabled jika Departemen Kosong) */}
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label className="text-right mt-2">Pernyataan</Label>
                                    <Textarea
                                        disabled={!formData.id_departemen} // Syarat 3
                                        value={formData.namaStandar}
                                        onChange={(e) => setFormData({ ...formData, namaStandar: e.target.value })}
                                        className="col-span-3"
                                        placeholder={
                                            formData.id_departemen
                                                ? "Tulis pernyataan standar..."
                                                : "Pilih Departemen Dulu"
                                        }
                                        required
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={!formData.namaStandar}>Simpan</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* TABLE (Sama seperti sebelumnya) */}
                <div className="mb-4 flex items-center justify-between">
                    <Input placeholder="Cari ..." className="w-120 bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <Card className="bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl overflow-hidden border">
                    <table className="w-full border-collapse text-sm">
                        <thead >
                            <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-left">
                                <th className="p-4 w-1">No</th>
                                <th className="p-4">Lingkup</th>
                                <th className="p-4">Kriteria</th>
                                <th className="p-4">Departemen</th>
                                <th className="p-4">Pernyataan Standar</th>
                                <th className="p-4 text-center w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada data ditemukan</td></tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={item.id_standar} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ">
                                        <td className="p-4 text-center">{index + 1}</td>
                                        <td className="p-4">
                                            <div className="text-xs p-4">{item.kriteria?.lingkup?.nama_lingkup || "-"}</div>
                                        </td>
                                        <td>
                                            <div className="text-xs p-4">{item.kriteria?.kriteria || "-"}</div>
                                        </td>
                                        <td>
                                            <div className="text-xs p-4">{item.departemen?.nama_departemen || "-"}</div>
                                        </td>

                                        <td className="p-4 text-justify whitespace-pre-line leading-relaxed">{item.pernyataan_standar}</td>

                                        <td className="p-4 flex gap-2 justify-center">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>Edit</Button>
                                            <Button size="sm" className="bg-red-500 text-white" onClick={() => handleDelete(item.id_standar)}>Hapus</Button>
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
