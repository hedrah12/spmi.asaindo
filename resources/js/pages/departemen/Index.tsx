import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react"; // 1. Import router
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type BreadcrumbItem } from "@/types";

// 2. Terima props 'data' dan 'filters'
export default function DepartemenIndex({ data, filters }) {

    // modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // form data
    const [formData, setFormData] = useState({
        namaDepartemen: "",
    });

    // search state
    const [search, setSearch] = useState(filters.search || "");

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Departemen", href: "/departemen" },
    ];

    // 3. Search Server-side Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                "/departemen",
                { search: search },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // 4. Handle Submit (Inertia)
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEditMode && selectedId) {
            router.put(`/departemen/${selectedId}`, formData, {
                onSuccess: () => closeModal(),
            });
        } else {
            router.post("/departemen", formData, {
                onSuccess: () => closeModal(),
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setFormData({ namaDepartemen: "" });
    };

    // input handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // edit handler
    const handleEdit = (item: any) => {
        setSelectedId(item.id);
        setIsEditMode(true);
        setIsModalOpen(true);

        setFormData({
            namaDepartemen: item.nama_departemen, // Sesuai kolom DB
        });
    };

    // delete handler
    const handleDelete = (id: number) => {
        if (!confirm("Hapus data ini?")) return;
        router.delete(`/departemen/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departemen" />

            <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        Departemen
                    </h1>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="shadow-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                onClick={() => {
                                    setIsEditMode(false);
                                    setFormData({ namaDepartemen: "" });
                                }}
                            >
                                Tambah
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[630px]">
                            <DialogHeader>
                                <DialogTitle>
                                    {isEditMode ? "Edit Departemen" : "Tambah Departemen"}
                                </DialogTitle>
                                <DialogDescription>Isi form berikut lalu klik simpan.</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="namaDepartemen" className="text-right">
                                        Departemen
                                    </Label>
                                    <Input
                                        id="namaDepartemen"
                                        value={formData.namaDepartemen}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        placeholder="Contoh: Keuangan"
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
                        placeholder="Cari Departemen..."
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
                                <th className="p-4">Departemen</th>
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
                                        <td className="p-4">{item.nama_departemen}</td>

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
