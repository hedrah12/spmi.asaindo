import React, { useState, useEffect } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import LandingLayout from "@/layouts/LandingLayout";
import { type SharedData } from "@/types";
import { Calendar, ArrowRight, ImageOff } from "lucide-react";

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
    const { setting } = usePage<SharedData>().props;
    const primaryColor = setting?.warna || "#2563eb";
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Animasi muncul saat load
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    return (
        <>
            <Head title="Berita & Informasi - Universitas Asa Indonesia" />

            <LandingLayout>

                {/* --- HERO SECTION --- */}
                <section className="relative pt-32 pb-20 overflow-hidden bg-gray-50 dark:bg-gray-900">
                    {/* Background Blob Animation */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>

                    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Berita & <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` }}>Informasi</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Dapatkan update terbaru seputar kegiatan, prestasi, dan pengumuman resmi dari Universitas Asa Indonesia.
                        </p>
                    </div>
                </section>

                {/* --- CONTENT AREA --- */}
                <main className="min-h-[60vh] bg-white dark:bg-gray-950 pb-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

                        {news.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <ImageOff className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Belum Ada Berita</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Saat ini belum ada berita yang dipublikasikan.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                {news.map((item, index) => (
                                    <article
                                        key={index}
                                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
                                    >
                                        {/* GAMBAR */}
                                        <Link href={route("public.news.show", item.slug)} className="block h-56 overflow-hidden relative">
                                            {item.image_url ? (
                                                <>
                                                    <img
                                                        src={item.image_url}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        alt={item.title}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                        <span className="text-white text-sm font-medium flex items-center gap-1">
                                                            Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                                                    <ImageOff className="w-10 h-10 mb-2 opacity-50" />
                                                    <span className="text-sm">No Image</span>
                                                </div>
                                            )}
                                        </Link>

                                        {/* CONTENT */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            {/* Date Badge */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                                                    <Calendar className="w-3 h-3" />
                                                    {item.date}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                <Link href={route("public.news.show", item.slug)}>
                                                    {item.title}
                                                </Link>
                                            </h2>

                                            {/* Excerpt */}
                                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-6 leading-relaxed flex-1">
                                                {item.excerpt}
                                            </p>

                                            {/* Footer Link */}
                                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                                <Link
                                                    href={route("public.news.show", item.slug)}
                                                    className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                >
                                                    Baca Berita
                                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

            </LandingLayout>
        </>
    );
}
