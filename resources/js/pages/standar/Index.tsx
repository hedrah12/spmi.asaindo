import React, { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react"; // 1. Import router
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type BreadcrumbItem } from "@/types";

// 2. Terima props 'data' dan 'filters' dari Controller
export default function StandarIndex({ data, filters }) {

    // modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // form data
    const [formData, setFormData] = useState({
        namaStandar: "",
    });

    // search state (ambil default dari filters controller)
    const [search, setSearch] = useState(filters.search || "");

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Standar", href: "/standar" },
    ];

    // 3. Effect untuk Search Server-side
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                "/standar",
                { search: search },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // 4. Handle Submit ke Backend
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEditMode && selectedId) {
            // Update
            router.put(`/standar/${selectedId}`, formData, {
                onSuccess: () => closeModal(),
            });
        } else {
            // Create
            router.post("/standar", formData, {
                onSuccess: () => closeModal(),
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setFormData({ namaStandar: "" });
    };

    // input handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        // id di input form Anda adalah "namaStandar", pastikan cocok
        setFormData((prev) => ({ ...prev, namaStandar: value }));
    };

    // edit handler
    const handleEdit = (item: any) => {
        setSelectedId(item.id);
        setIsEditMode(true);
        setIsModalOpen(true);

        setFormData({
            // Ambil dari kolom database 'pernyataan_standar'
            namaStandar: item.pernyataan_standar,
        });
    };

    // delete handler
    const handleDelete = (id: number) => {
        if (!confirm("Yakin ingin menghapus data ini?")) return;
        router.delete(`/standar/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Standar" />

            <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        Standar
                    </h1>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="shadow-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                onClick={() => {
                                    setIsEditMode(false);
                                    setFormData({ namaStandar: "" });
                                }}
                            >
                                Tambah
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[630px]">
                            <DialogHeader>
                                <DialogTitle>
                                    {isEditMode ? "Edit Standar" : "Tambah Standar"}
                                </DialogTitle>
                                <DialogDescription>Isi form berikut lalu klik simpan.</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="namaStandar" className="text-right">
                                        Pernyataan Standar
                                    </Label>
                                    <Input
                                        id="namaStandar" // ID ini penting untuk handleInputChange
                                        value={formData.namaStandar}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        placeholder="Contoh: Audit Sistem Mutu"
                                        required
                                    />
                                </div>

                                <DialogFooter>
                                    <Button onClick={() => setIsModalOpen(false)} variant="outline" type="button">
                                        Batal
                                    </Button>
                                    <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* SEARCH */}
                <div className="mb-4 flex items-center justify-between">
                    <Input
                        placeholder="Cari standar..."
                        className="w-120"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* TABLE */}
                <Card className="bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl overflow-hidden border">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-left">
                                <th className="p-4 w-1">No.</th>
                                <th className="p-4">Pernyataan Standar</th>
                                <th className="p-4 text-center w-32">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-500">
                                        Belum ada data
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-4">{index + 1}</td>

                                        {/* Tampilkan kolom dari database */}
                                        <td className="p-4">{item.pernyataan_standar}</td>

                                        <td className="p-4 flex gap-2 justify-center">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                Delete
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
