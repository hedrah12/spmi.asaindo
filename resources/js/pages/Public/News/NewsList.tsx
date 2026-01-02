import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import LandingLayout from "@/layouts/LandingLayout";

interface NewsItem {
    slug: string;
    title: string;
    excerpt: string;
    image_url: string | null;
    date: string;
}

interface Props {
    news: NewsItem[];
}

export default function NewsList({ news }: Props) {
    const { setting } = usePage().props;
    const primaryColor = setting?.warna || "#2563eb";

    return (
        <>
            <Head title="Daftar Berita - Universitas Asa Indonesia" />

            <LandingLayout>

                {/* PAGE HEADER */}
                <div className="bg-gray-100 dark:bg-gray-900 pt-32 pb-10">
                    <div className="max-w-6xl mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                            Berita & Informasi
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-3">
                            Update terbaru seputar kegiatan SPMI Universitas Asa Indonesia.
                        </p>
                    </div>
                </div>

                {/* LIST BERITA */}
                <div className="max-w-6xl mx-auto px-6 py-16">

                    {news.length === 0 && (
                        <div className="text-center text-gray-600 dark:text-gray-300 py-20">
                            Belum ada berita untuk saat ini.
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {news.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all group"
                            >
                                {/* GAMBAR */}
                                <Link href={route("public.news.show", item.slug)} className="block h-52 overflow-hidden">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt={item.title}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500">
                                            No Image
                                        </div>
                                    )}
                                </Link>

                                {/* CONTENT */}
                                <div className="p-6">
                                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                        {item.date}
                                    </span>

                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-3 group-hover:text-indigo-600 transition-colors">
                                        <Link href={route("public.news.show", item.slug)}>
                                            {item.title}
                                        </Link>
                                    </h2>

                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-3">
                                        {item.excerpt}
                                    </p>

                                    <div className="mt-4">
                                        <Link
                                            href={route("public.news.show", item.slug)}
                                            className="text-indigo-600 hover:underline font-semibold text-sm"
                                        >
                                            Baca Selengkapnya →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </LandingLayout>
        </>
    );
}
