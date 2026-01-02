import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type BreadcrumbItem } from "@/types";

export default function KriteriaIndex({ data, filters, lingkups }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        namaKriteria: "",
        id_lingkup: "",
    });

    const [search, setSearch] = useState(filters.search || "");

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Kriteria", href: "/kriteria" },
    ];

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get("/kriteria", { search: search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            namaKriteria: formData.namaKriteria,
            id_lingkup: formData.id_lingkup
        };

        const options = {
            onSuccess: () => {
                toast.success(isEditMode ? "Data diperbarui" : "Data disimpan");
                closeModal();
            },
            onError: () => toast.error("Gagal menyimpan data"),
        };

        if (isEditMode && selectedId) {
            router.put(`/kriteria/${selectedId}`, payload, options);
        } else {
            router.post("/kriteria", payload, options);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setFormData({ namaKriteria: "", id_lingkup: "" });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, namaKriteria: e.target.value });
    };

    const handleEdit = (item: any) => {
        // ⚠️ PENTING: Gunakan id_kriteria
        setSelectedId(item.id_kriteria);
        setIsEditMode(true);
        setIsModalOpen(true);
        setFormData({
            namaKriteria: item.kriteria,
            // ⚠️ PENTING: Gunakan id_lingkup
            id_lingkup: item.id_lingkup ? String(item.id_lingkup) : "",
        });
    };

    const handleDelete = (id: number) => {
        if (confirm("Hapus data?")) {
            router.delete(`/kriteria/${id}`, {
                onSuccess: () => toast.success("Terhapus")
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kriteria" />

           <div className="p-8 bg-gray-100 min-h-screen
    dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">


                <div className="flex justify-between mb-6">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Kriteria</h1>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="shadow-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                onClick={() => { setIsEditMode(false); setFormData({ namaKriteria: "", id_lingkup: "" }); }}
                            >
                                Tambah
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>{isEditMode ? "Edit" : "Tambah"} Kriteria</DialogTitle>
                                <DialogDescription>Isi form berikut.</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                                {/* SELECT LINGKUP */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Lingkup</Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={formData.id_lingkup}
                                            onValueChange={(val) => setFormData({ ...formData, id_lingkup: val })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Pilih Lingkup" /></SelectTrigger>
                                            <SelectContent>
                                                {lingkups.map((l: any) => (
                                                    // ⚠️ PENTING: Gunakan l.id_lingkup
                                                    <SelectItem key={l.id_lingkup} value={String(l.id_lingkup)}>
                                                        {l.nama_lingkup}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* INPUT KRITERIA */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Kriteria</Label>
                                    <Input
                                        value={formData.namaKriteria}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        placeholder={!formData.id_lingkup ? "Pilih lingkup terlebih dahulu" : "Contoh: C.1. Visi Misi"}
                                        required
                                        disabled={!formData.id_lingkup}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                    <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Simpan</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="mb-4">
                    <Input
                        placeholder="Cari kriteria..."
                        className="w-120 bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Card className="bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl overflow-hidden border">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-left">
                                <th className="p-4 w-1">No</th>
                                <th className="p-4">Lingkup</th>
                                <th className="p-4">Nama Kriteria</th>
                                <th className="p-4 text-center w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada data ditemukan</td></tr>
                            ) : (
                                data.map((item: any, index: number) => (
                                    // ⚠️ PENTING: Gunakan item.id_kriteria
                                     <tr key={item.id_departemen} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="p-4 text-center">{index + 1}</td>
                                        <td className="p-4">
                                            {item.lingkup ? item.lingkup.nama_lingkup : "-"}
                                        </td>
                                        <td className="p-4">{item.kriteria}</td>
                                        <td className="p-4 flex gap-2 justify-center">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>Edit</Button>
                                            <Button
                                                size="sm"
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                // ⚠️ PENTING: Pass item.id_kriteria
                                                onClick={() => handleDelete(item.id_kriteria)}
                                            >
                                                Hapus
                                            </Button>
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
