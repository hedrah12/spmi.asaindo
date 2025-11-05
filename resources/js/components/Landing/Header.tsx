import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface HeaderProps {
    primaryColor: string;
}

export default function Header({ primaryColor }: HeaderProps) {
    const { auth, setting } = usePage<SharedData>().props;
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const logo = setting?.logo;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
                    : 'bg-transparent'
                }`}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo Image */}
                    <Link href="/" className="flex items-center">
                        {logo ? (
                            <img
                                src={`/storage/${logo}`}
                                alt="Logo"
                                className="h-16 w-auto object-contain" // diperbesar
                            />
                        ) : (
                            <div className="h-16 w-16 bg-gray-300 rounded-md flex items-center justify-center">
                                {/* fallback icon */}
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-300">Beranda</Link>
                        <Link href="/tentang" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-300">Tentang</Link>
                        <Link href="/dokumen" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-300">Dokumen</Link>
                        <Link href="/kontak" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-300">Kontak</Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                                style={{
                                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                                    color: 'white'
                                }}
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                                style={{
                                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                                    color: 'white'
                                }}
                            >
                                Masuk
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
                        <div className="flex flex-col space-y-4">
                            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link>
                            <Link href="/tentang" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Tentang</Link>
                            <Link href="/dokumen" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Dokumen</Link>
                            <Link href="/kontak" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Kontak</Link>
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="block w-full text-center px-6 py-2.5 rounded-xl font-medium transition-all duration-300"
                                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`, color: 'white' }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="block w-full text-center px-6 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Masuk
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
