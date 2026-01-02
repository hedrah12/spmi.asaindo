import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type BreadcrumbItem } from "@/types";

export default function DepartemenIndex({ data, filters }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        namaDepartemen: "",
    });

    const [search, setSearch] = useState(filters.search || "");

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Departemen", href: "/departemen" },
    ];

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get("/departemen", { search }, { preserveState: true, replace: true });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // HANDLE SUBMIT
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEditMode && selectedId) {
            router.put(`/departemen/${selectedId}`, formData, {
                onSuccess: () => {
                    toast.success("Departemen berhasil diperbarui!");
                    closeModal();
                },
                onError: () => toast.error("Gagal memperbarui data."),
            });
        } else {
            router.post("/departemen", formData, {
                onSuccess: () => {
                    toast.success("Departemen berhasil ditambahkan!");
                    closeModal();
                },
                onError: () => toast.error("Gagal menambahkan data."),
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setFormData({ namaDepartemen: "" });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Hapus destructuring {id} karena id input sama dengan key formData
        setFormData({ namaDepartemen: e.target.value });
    };

    // HANDLE EDIT
    const handleEdit = (item: any) => {
        // ⚠️ PENTING: Gunakan id_departemen sesuai database
        setSelectedId(item.id_departemen);
        setIsEditMode(true);
        setIsModalOpen(true);

        setFormData({
            namaDepartemen: item.nama_departemen,
        });
    };

    // HANDLE DELETE
    const handleDelete = (id: number) => {
        if (!confirm("Hapus data ini?")) return;

        router.delete(`/departemen/${id}`, {
            onSuccess: () => toast.success("Data berhasil dihapus."),
            onError: () => toast.error("Gagal menghapus data."),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departemen" />

            <div className="p-8 bg-gray-100 min-h-screen
    dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
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
                                    <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
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

                <div className="mb-4">
                    <Input
                        placeholder="Cari Departemen..."
                        value={search}
                        className="w-120 bg-white"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Card className="bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl overflow-hidden border">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
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
                                    // ⚠️ Gunakan item.id_departemen sebagai key
                                    <tr key={item.id_departemen} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="p-4">{index + 1}</td>
                                        <td className="p-4">{item.nama_departemen}</td>
                                        <td className="p-4 flex gap-2 justify-center">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                                Edit
                                            </Button>
                                            {/* ⚠️ Pass item.id_departemen ke handleDelete */}
                                            <Button
                                                size="sm"
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                onClick={() => handleDelete(item.id_departemen)}
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
