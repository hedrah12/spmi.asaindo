import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface HeaderProps {
    primaryColor: string;
}

export default function Header({ primaryColor }: HeaderProps) {
    const page = usePage<SharedData>();
    const { auth, setting } = page.props;
    const { url } = page;

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 🔹 Scroll detection (lebih smooth & modern)
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 🔹 Lock scroll saat menu mobile terbuka
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const logo = setting?.logo;

    const navLinks = [
        { label: 'Beranda', href: '/' },
        { label: 'Dokumen', href: '/dokumen' },
        { label: 'Kontak', href: '/kontak' },
        { label: 'Berita', href: '/berita' },
    ];

    const buttonGradient = {
        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
    };

    return (
        <header
            role="navigation"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
                    : 'bg-transparent'
            }`}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* LOGO */}
                    <Link href="/" className="flex items-center group">
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

                    {/* DESKTOP MENU */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map(link => {
                            const isActive = url === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'text-gray-900 dark:text-white font-semibold'
                                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    {link.label}
                                    {isActive && (
                                        <span
                                            className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* CTA */}
                    <div className="hidden lg:flex">
                        <Link
                            href={auth.user ? '/dashboard' : '/login'}
                            className="px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-transform hover:-translate-y-0.5"
                            style={buttonGradient}
                        >
                            {auth.user ? 'Dashboard' : 'Masuk'}
                        </Link>
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button
                        aria-label="Toggle Menu"
                        aria-expanded={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(v => !v)}
                        className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={
                                    isMobileMenuOpen
                                        ? 'M6 18L18 6M6 6l12 12'
                                        : 'M4 6h16M4 12h16M4 18h16'
                                }
                            />
                        </svg>
                    </button>
                </div>

                {/* MOBILE MENU */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map(link => {
                                const isActive = url === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`px-4 py-2 font-medium border-l-4 transition-colors ${
                                            isActive
                                                ? 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
                                                : 'border-transparent text-gray-700 dark:text-gray-300'
                                        }`}
                                        style={{
                                            borderColor: isActive ? primaryColor : 'transparent',
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}

                            <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    href={auth.user ? '/dashboard' : '/login'}
                                    className="block w-full text-center px-6 py-2.5 rounded-xl font-medium text-white"
                                    style={buttonGradient}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {auth.user ? 'Dashboard' : 'Masuk'}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
