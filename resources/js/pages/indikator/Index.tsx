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

export default function IndikatorIndex({ data, filters, masterData }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Form State (id_lingkup hanya helper filter)
    const [formData, setFormData] = useState({
        namaIndikator: "",
        id_lingkup: "",
        id_kriteria: "",
        id_standar: "",
    });

    const [search, setSearch] = useState(filters.search || "");

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

    // ----------------------

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get("/indikator", { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

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

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setFormData({ namaIndikator: "", id_lingkup: "", id_kriteria: "", id_standar: "" });
    };

    const handleEdit = (item) => {
        // Gunakan PK Custom: id_indikator
        setSelectedId(item.id_indikator);
        setIsEditMode(true);
        setIsModalOpen(true);

        // Reverse Lookup untuk mengisi dropdown saat edit
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

            <div className="p-8 bg-gray-100 min-h-screen
    dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
                <div className="flex justify-between mb-6">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Indikator</h1>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                onClick={() => { setIsEditMode(false); setFormData({ namaIndikator: "", id_lingkup: "", id_kriteria: "", id_standar: "" }); }}>
                                Tambah
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[700px]">
                            <DialogHeader>
                                <DialogTitle>{isEditMode ? "Edit Indikator" : "Tambah Indikator"}</DialogTitle>
                                <DialogDescription>Isi form berikut secara berurutan.</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                                {/* 1. SELECT LINGKUP */}
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

                                {/* 2. SELECT KRITERIA */}
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

                                {/* 3. SELECT STANDAR */}
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

                                {/* 4. INPUT PERNYATAAN */}
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

                {/* TABLE */}
                <div className="mb-4">
                    <Input placeholder="Cari..." className="w-120 bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <Card className="bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl overflow-hidden border">
                    <table className="w-full border-collapse text-sm">
                        <thead >
                            <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                <th className="p-4 w-1">No</th>
                                <th className="p-4">Lingkup</th>
                                <th className="p-4">Kreteria</th>
                                <th className="p-4">Standar</th>
                                <th className="p-4">Pernyataan Indikator</th>
                                <th className="p-4 w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Belum ada data</td></tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={item.id_indikator} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="p-4 text-center">{index + 1}</td>
                                        <td className="p-4 text-xs">{item.kriteria?.lingkup?.nama_lingkup || "-"}</td>
                                        <td className="p-4 text-xs ">{item.kriteria?.kriteria || "-"}</td>
                                        <td className="p-4 text-xs text-justify whitespace-pre-line w-80">{item.standar?.pernyataan_standar || "-"}</td>

                                        <td className="p-4 align-top text-justify whitespace-pre-line w-120">
    {item.pernyataan_indikator}
</td>
                                        <td className="p-4 flex gap-2 justify-center align-top">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>Edit</Button>
                                            <Button size="sm" className="bg-red-500 text-white" onClick={() => handleDelete(item.id_indikator)}>Hapus</Button>
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
