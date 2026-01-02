import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useEffect, useState } from 'react';
import LandingLayout from '@/layouts/LandingLayout';
import { Button } from "@/components/ui/button";

// Interface untuk data berita
interface NewsItem {
    slug: string;
    title: string;
    excerpt: string;
    image_url: string | null;
    date: string;
}

interface WelcomeProps {
    newsList?: NewsItem[]; // Langsung array, bukan { data: ... } karena mapping controller
}

export default function Welcome({ newsList }: WelcomeProps) {
    const { auth, setting } = usePage<SharedData>().props;
    const primaryColor = setting?.warna || '#2563eb';
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--color-primary', primaryColor);

        // Animation trigger
        setTimeout(() => setIsVisible(true), 100);
    }, [primaryColor]);

    const features = [
        {
            icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>),
            title: "Audit Mutu Internal", description: "Sistem audit komprehensif untuk memastikan standar mutu akademik terpenuhi."
        },
        {
            icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
            title: "Monitoring & Evaluasi", description: "Pemantauan berkelanjutan dan evaluasi periodik terhadap proses akademik."
        },
        {
            icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>),
            title: "Laporan Terpadu", description: "Menampilkan data akademik dan administrasi secara terintegrasi."
        },
        {
            icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>),
            title: "Dashboard Modern", description: "Interface yang user-friendly dengan dark mode support."
        }
    ];

    const logo = setting?.logo || null;

    return (
        <>
            <Head title="SPMI - Universitas Asa Indonesia" />
            <LandingLayout>
                {/* HERO SECTION */}
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                    <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <Link href="/" className="flex items-center justify-center mb-6">
                                {logo ? (
                                    <img src={`/storage/${logo}`} alt="Logo" className="h-28 w-auto object-contain mt-4" />
                                ) : (
                                    <div className="h-24 w-24 bg-gray-300 rounded-md flex items-center justify-center"><span className="text-white font-bold text-2xl">S</span></div>
                                )}
                            </Link>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                Sistem Penjamin Mutu Internal <br />
                                <span className="bg-clip-text text-transparent" style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`, WebkitBackgroundClip: 'text' }}>
                                    Universitas Asa Indonesia
                                </span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                                Memastikan seluruh proses akademik dan administratif berjalan sesuai standar mutu yang tinggi.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
                                <Link href={auth.user ? "/dashboard" : "/login"}
                                    className="px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`, boxShadow: `0 20px 40px ${primaryColor}40` }}>
                                    {auth.user ? 'Masuk Dashboard' : 'Mulai Sekarang'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                Fitur Utama <span style={{ color: primaryColor }}>SPMI</span> ASAINDO
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}10)`, color: primaryColor }}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- BERITA SECTION (FIXED: LINK ADDED) --- */}
                {newsList && newsList.length > 0 && (
                    <section className="py-20 bg-white dark:bg-gray-900">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Berita & Informasi</h2>
                                <p className="text-gray-500 mt-2">Update terbaru seputar kampus.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {newsList.map((item, index) => (
                                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group">

                                        {/* 1. GAMBAR DIBUNGKUS LINK */}
                                        <Link href={route('public.news.show', item.slug)} className="block h-48 overflow-hidden bg-gray-200 cursor-pointer">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                            )}
                                        </Link>

                                        <div className="p-6">
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{item.date}</span>

                                            {/* 2. JUDUL DIBUNGKUS LINK */}
                                            <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                <Link href={route('public.news.show', item.slug)}>
                                                    {item.title}
                                                </Link>
                                            </h3>

                                            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{item.excerpt}</p>

                                            {/* 3. TOMBOL BACA SELENGKAPNYA (Ditambahkan) */}
                                            <div className="mt-4">
                                                <Link href={route('public.news.show', item.slug)} className="text-indigo-600 font-semibold hover:underline text-sm">
                                                    Baca Selengkapnya &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div><Link
                                href={route('public.news.index')}
                                className="text-white inline-block mt-4 text-indigo-600 font-semibold hover:underline"
                            >
                                Lihat Semua Berita →
                            </Link></div>
                        </div>
                    </section>
                )}
                {/* --- END BERITA SECTION --- */}

                {/* CTA Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` }}></div>
                    </div>
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Siap Transformasi <span style={{ color: primaryColor }}>Mutu Pendidikan</span>?
                        </h2>
                        <div className="flex justify-center">
                            <Link href={auth.user ? "/dashboard" : "/login"}
                                className="px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                                style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`, boxShadow: `0 20px 40px ${primaryColor}40` }}>
                                {auth.user ? 'Lanjutkan ke Dashboard' : 'Mulai Sekarang'}
                            </Link>
                        </div>
                    </div>
                </section>
            </LandingLayout>
        </>
    );
}
