import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateNews() {
    const { data, setData, post, processing } = useForm({
        title: '', content: '', image: null as File | null
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // PERUBAHAN DISINI: News.store
        post(route('News.store'), {
            onSuccess: () => toast.success('Berita berhasil dipublish')
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: "News", href: "/News" }, { title: "Create", href: "#" }]}>
            <Head title="Buat News" />
            <div className="p-8 bg-gray-100 min-h-screen
    dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
                <Card className="p-6 bg-white/80 dark:bg-gray-800/80">
                    <h1 className="text-2xl font-bold mb-6">Tulis News Baru</h1>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block mb-2 font-bold">Judul</label>
                            <Input className='bg-white text-black' value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Judul Berita" />
                        </div>
                        <div>
                            <label className="block mb-2 font-bold">Gambar</label>
                            <Input
                                className="bg-white text-black dark:bg-gray-800 dark:text-white border dark:border-gray-700"
                                type="file"
                                onChange={e => e.target.files && setData('image', e.target.files[0])}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-bold">Isi Berita</label>
                            <textarea
                                className="bg-white w-full border rounded p-2 h-32 text-black"
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                                placeholder="Isi konten berita..."
                            />
                        </div>
                        <div className="flex gap-2">
                            {/* PERUBAHAN DISINI: News.index */}
                            <Link href={route('News.index')}>
                                <Button type="button" variant="outline">Batal</Button>
                            </Link>
                            <Button disabled={processing}>Simpan News</Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
