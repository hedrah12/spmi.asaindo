import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useEffect, useState } from 'react';
import LandingLayout from '@/layouts/LandingLayout';

export default function Welcome() {
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
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: "Audit Mutu Internal",
            description: "Sistem audit komprehensif untuk memastikan standar mutu akademik terpenuhi dengan monitoring real-time."
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: "Monitoring & Evaluasi",
            description: "Pemantauan berkelanjutan dan evaluasi periodik terhadap seluruh proses akademik dan administrasi."
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
            title: "Lapuran Terpadu",
            description: "Menampilkan data akademik dan administrasi secara terintegrasi untuk mendukung evaluasi mutu internal."
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
            ),
            title: "Dashboard Modern",
            description: "Interface yang user-friendly dengan dark mode support dan responsive design untuk semua perangkat."
        }
    ];
    const logo = setting?.logo || null;
    return (
        <>
            <Head title="SPMI - Universitas Asa Indonesia" />
            <LandingLayout>
                {/* Hero Section dengan Animasi */}
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                    {/* Background Effects */}
                    <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl animate-pulse delay-500"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}>
                            {/* Logo*/}
                            <Link href="/" className="flex items-center justify-center mb-6">
                                {logo ? (
                                    <img
                                        src={`/storage/${logo}`}
                                        alt="Logo"
                                        className="h-28 w-auto object-contain mt-4" // disesuaikan agar lebih turun
                                    />
                                ) : (
                                    <div className="h-24 w-24 bg-gray-300 rounded-md flex items-center justify-center">
                                        <span className="text-white font-bold text-2xl">S</span>
                                    </div>
                                )}
                            </Link>



                            {/* Main Heading */}
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                Sistem Penjamin Mutu Internal <br />
                                <span
                                    className="bg-clip-text text-transparent"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`,
                                        WebkitBackgroundClip: 'text',
                                    }}
                                >
                                    Universitas Asa Indonesia
                                </span>
                            </h1>

                            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                                Sistem Penjamin Mutu Internal Universitas Asa Indonesia memastikan seluruh proses akademik
                                dan administratif berjalan sesuai standar mutu yang tinggi, mendukung peningkatan kualitas pendidikan
                                secara konsisten dan berkelanjutan.
                            </p>



                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="group relative px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                                        style={{
                                            background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`,
                                            boxShadow: `0 20px 40px ${primaryColor}40`
                                        }}
                                    >
                                        <span className="relative z-10 flex items-center">
                                            Masuk Dashboard
                                            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="group relative px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                                            style={{
                                                background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`,
                                                boxShadow: `0 20px 40px ${primaryColor}40`
                                            }}
                                        >
                                            <span className="relative z-10 flex items-center">
                                                Mulai Sekarang
                                                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </span>
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
                                {[
                                    { number: '12+', label: 'Program Studi' },
                                    { number: '100+', label: 'Dosen' },
                                    { number: '1K+', label: 'Mahasiswa' },
                                    { number: '99%', label: 'Kepuasan' }
                                ].map((stat, index) => (
                                    <div
                                        key={index}
                                        className={`transition-all duration-500 delay-${index * 200} transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                            }`}
                                    >
                                        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                            {stat.number}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
                            <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"></div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Section Header */}
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                Fitur Utama <span style={{ color: primaryColor }}>SPMI</span> ASAINDO
                            </h2>

                            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Sistem internal yang mempermudah monitoring, evaluasi, dan pelaporan kegiatan akademik
                                dan administrasi di Universitas Asa Indonesia.
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-800"
                                >
                                    {/* Icon */}
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105"
                                        style={{
                                            background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}10)`,
                                            color: primaryColor
                                        }}
                                    >
                                        {feature.icon}
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {feature.description}
                                    </p>

                                    {/* Hover Subtle Background */}
                                    <div
                                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"
                                        style={{
                                            background: `linear-gradient(135deg, ${primaryColor}10, transparent)`
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* CTA Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0">
                        <div
                            className="absolute inset-0 opacity-5"
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`
                            }}
                        ></div>
                    </div>

                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Siap Transformasi{' '}
                            <span style={{ color: primaryColor }}>Mutu Pendidikan</span>?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Bergabung dengan sistem SPMI terdepan untuk mewujudkan standar mutu pendidikan tinggi yang unggul dan berkelanjutan.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Link
                                href={auth.user ? "/dashboard" : "/login"}
                                className="px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                                style={{
                                    background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`,
                                    boxShadow: `0 20px 40px ${primaryColor}40`
                                }}
                            >
                                {auth.user ? 'Lanjutkan ke Dashboard' : 'Mulai Sekarang'}
                            </Link>
                        </div>
                    </div>
                </section>
            </LandingLayout>
        </>
    );
}
