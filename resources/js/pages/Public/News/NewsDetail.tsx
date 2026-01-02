import React from 'react';
import { Head, Link } from '@inertiajs/react';
import LandingLayout from '@/layouts/LandingLayout';
import { Button } from "@/components/ui/button";

interface ArticleProps {
    article: {
        title: string;
        content: string;
        image_url: string | null;
        date: string;
        author: string;
    };
}

export default function NewsDetail({ article }: ArticleProps) {
    return (
        <LandingLayout>
            <Head title={article.title} />

            <article className="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Tombol Kembali */}
                    <div className="mb-8">
                        <Link href="/">
                            <Button variant="ghost" className="pl-0 hover:bg-transparent text-gray-600 dark:text-gray-400 hover:text-indigo-600">
                                &larr; Kembali ke Beranda
                            </Button>
                        </Link>
                    </div>

                    {/* Header: Kategori & Tanggal */}
                    <div className="flex items-center gap-4 text-sm mb-4">
                        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-3 py-1 rounded-full font-semibold">
                            Berita
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            {article.date}
                        </span>
                    </div>

                    {/* Judul Besar */}
                    <h1 className="text-2xl md:text-2xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight text-align:justify">
                        {article.title}
                    </h1>

                    {/* Gambar Utama */}
                    {article.image_url && (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-10 bg-gray-100 dark:bg-gray-800">
                            <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Konten Berita */}
                    {/* whitespace-pre-wrap berguna agar Enter/Paragraf terbaca */}
                    <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed [text-align:justify]">
                        {article.content}
                    </div>


                    {/* Footer Artikel */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-gray-500 italic">
                            Diposting oleh Admin • Universitas Asa Indonesia
                        </p>
                    </div>

                </div>
            </article>
        </LandingLayout>
    );
}
