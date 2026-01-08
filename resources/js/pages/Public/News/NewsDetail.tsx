import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import LandingLayout from '@/layouts/LandingLayout';
import { Button } from "@/components/ui/button";
import { type SharedData } from '@/types';
import { ArrowLeft, Calendar, User } from 'lucide-react';

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
    const { setting } = usePage<SharedData>().props;
    const primaryColor = setting?.warna || "#2563eb";
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    return (
        <>
            <Head title={article.title} />

            <LandingLayout>
                {/* --- HERO SECTION --- */}
                <section className="relative pt-32 pb-20 overflow-hidden bg-gray-50 dark:bg-gray-900">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2"></div>
                    </div>

                    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                        {/* Breadcrumb / Back */}
                        <div className="mb-6 flex justify-center md:justify-start">
                            <Link href={route('public.news.index')}>
                                <Button variant="ghost" className="pl-0 hover:bg-transparent text-gray-600 dark:text-gray-400 hover:text-indigo-600 group">
                                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                                    Kembali ke Berita
                                </Button>
                            </Link>
                        </div>

                        {/* Title & Meta */}
                        <div className="text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    Berita
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    {article.date}
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                    <User className="w-4 h-4" />
                                    {article.author}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                                {article.title}
                            </h1>
                        </div>
                    </div>
                </section>

                {/* --- CONTENT AREA --- */}
                <main className="min-h-[60vh] bg-white dark:bg-gray-950 pb-24">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

                        <article className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">

                            {/* Featured Image */}
                            {article.image_url && (
                                <div className="w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800 relative group">
                                    <img
                                        src={article.image_url}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                </div>
                            )}

                            {/* Article Body */}
                            <div className="p-8 md:p-12">
                                <div
                                    className="prose prose-lg md:prose-xl dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed space-y-6"
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                                {/* Note: Jika content bukan HTML raw, bisa pakai whitespace-pre-wrap seperti sebelumnya.
                                    Tapi biasanya berita dari CMS berupa HTML. Jika plain text:
                                    <div className="whitespace-pre-wrap">{article.content}</div>
                                */}
                            </div>

                            {/* Article Footer */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-8 md:px-12 py-6 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900 dark:text-white">Bagikan:</span>
                                    {/* Tambahkan tombol share sosmed disini jika perlu */}
                                    <button className="hover:text-indigo-600 transition-colors">Facebook</button>
                                    <span>•</span>
                                    <button className="hover:text-indigo-600 transition-colors">Twitter</button>
                                    <span>•</span>
                                    <button className="hover:text-indigo-600 transition-colors">LinkedIn</button>
                                </div>
                                <p className="italic">
                                    Universitas Asa Indonesia &copy; {new Date().getFullYear()}
                                </p>
                            </div>

                        </article>

                        {/* Navigation / Next Previous Article bisa ditambahkan disini */}

                    </div>
                </main>
            </LandingLayout>
        </>
    );
}
