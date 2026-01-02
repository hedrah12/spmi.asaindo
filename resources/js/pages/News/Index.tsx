import React from 'react';
import { Link, Head, router } from '@inertiajs/react';
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner"; // Pastikan install sonner atau ganti alert biasa

export default function IndexNews({ news }: any) {

    const handleDelete = (id: number) => {
        if (confirm('Hapus berita ini?')) {
            // PERUBAHAN DISINI: News.destroy
            router.delete(route('News.destroy', id), {
                onSuccess: () => toast.success('Berita dihapus')
            });
        }
    }

    return (
        <AppLayout breadcrumbs={[{ title: "News", href: "/News" }]}>
            <Head title="List News" />
            <div className="p-8 bg-gray-100 min-h-screen
    dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">

                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-bold">Manajemen News</h1>
                    {/* PERUBAHAN DISINI: News.create */}
                    <Link href={route('News.create')}>
                        <Button className="shadow-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white">+ Tambah News</Button>
                    </Link>
                </div>
                <Card className="bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl overflow-hidden border">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-left">
                                <th className="p-4">Cover</th>
                                <th className="p-4">Judul</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {news.map((item: any) => (
                                <tr key={item.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="p-4">
                                        {item.image_url && <img src={item.image_url} className="h-12 w-12 object-cover rounded" />}
                                    </td>
                                    <td className="p-4">{item.title}</td>
                                    <td className="p-4 flex gap-2 justify-center">
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                                            Hapus
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </AppLayout>
    );
}
