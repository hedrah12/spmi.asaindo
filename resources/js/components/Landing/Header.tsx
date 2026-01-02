import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface HeaderProps {
    primaryColor: string;
}

export default function Header({ primaryColor }: HeaderProps) {
    // 💡 INFO: Mengambil data global. Pastikan 'auth' di backend HandleInertiaRequests
    // mengembalikan user object atau null.
    const { auth, setting } = usePage<SharedData>().props;

    // 💡 INFO: State local UI
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 🔍 REVIEW: Mendeteksi URL aktif.
    // Berguna untuk memberi warna beda pada menu yang sedang dikunjungi.
    const { url } = usePage();

    useEffect(() => {
        const handleScroll = () => {
            // 💡 INFO: Angka 50 adalah threshold (batas) pixel sebelum header berubah warna.
            setIsScrolled(window.scrollY > 50);
        };

        // 🔍 REVIEW: Performance Tip
        // Event scroll mentrigger fungsi ini Ratusan kali per detik.
        // Untuk aplikasi simple ini OKE. Tapi untuk aplikasi berat,
        // pertimbangkan menggunakan "Lodash throttle" atau "Debounce"
        // agar fungsi tidak dijalankan terlalu sering.
        window.addEventListener('scroll', handleScroll);

        // 💡 INFO: Cleanup function.
        // Wajib ada agar tidak memory leak saat user pindah halaman (component unmount).
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const logo = setting?.logo;

    // 💡 TIPS: Mendefinisikan menu dalam Array (DRY Principle)
    // Agar kita tidak perlu menulis ulang link di Desktop dan Mobile view.
    const navLinks = [
        { label: 'Beranda', href: '/' },
        { label: 'Dokumen', href: '/dokumen' },
        { label: 'Kontak', href: '/kontak' },
        { label: 'Berita', href: '/berita' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
                    : 'bg-transparent'
            }`}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* =============================
                        LOGO
                    ============================== */}
                    <Link href="/" className="flex items-center group"> {/* Tambah group untuk hover effect logo */}
                        {logo ? (
                            <img
                                src={`/storage/${logo}`}
                                alt="Logo Instansi"
                                className="h-16 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        ) : (
                            <div className="h-16 w-16 bg-gray-300 rounded-md flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                        )}
                    </Link>

                    {/* =============================
                        NAVIGASI DESKTOP (Refactored)
                    ============================== */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-all duration-300 hover:text-gray-900 dark:hover:text-white relative
                                    ${url === link.href
                                        ? 'text-gray-900 dark:text-white font-bold' // Style jika aktif
                                        : 'text-gray-700 dark:text-gray-300'       // Style default
                                    }
                                `}
                            >
                                {link.label}
                                {/* Garis bawah animasi jika menu aktif */}
                                {url === link.href && (
                                    <span
                                        className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full"
                                        style={{ backgroundColor: primaryColor }}
                                    ></span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* =============================
                        TOMBOL LOGIN / DASHBOARD
                    ============================== */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-white"
                                // 🔍 REVIEW: Inline style di sini VALID & TEPAT.
                                // Karena primaryColor adalah dynamic value dari database/props,
                                // Tailwind tidak bisa men-generate class static untuk ini.
                                style={{
                                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                                }}
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-white"
                                style={{
                                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                                }}
                            >
                                Masuk
                            </Link>
                        )}
                    </div>

                    {/* =============================
                        TOMBOL MENU MOBILE
                    ============================== */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        // 🔍 REVIEW: Tambahkan aria-label untuk Accessibility (Screen Reader)
                        aria-label="Toggle Menu"
                        className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* =============================
                    MENU NAVIGASI MOBILE
                ============================== */}
                {/* 💡 INFO: Menggunakan transisi CSS kondisional kadang lebih halus daripada unmount total */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-fade-in-down">
                        <div className="flex flex-col space-y-4">

                            {/* Loop menu mobile dari Array yang sama */}
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 font-medium transition-colors border-l-4
                                        ${url === link.href
                                            ? 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
                                            : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }
                                    `}
                                    // Style border kiri dinamis sesuai warna tema
                                    style={{ borderColor: url === link.href ? primaryColor : 'transparent' }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    href={auth.user ? "/dashboard" : "/login"}
                                    className="block w-full text-center px-6 py-2.5 rounded-xl font-medium transition-all duration-300 text-white"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                                    }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {auth.user ? "Dashboard" : "Masuk"}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
