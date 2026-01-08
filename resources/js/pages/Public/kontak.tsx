import React, { useState, useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import LandingLayout from "@/layouts/LandingLayout";
import { type SharedData } from "@/types";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    CheckCircle2,
    Globe
} from "lucide-react";

export default function Contact() {
    const { setting } = usePage<SharedData>().props;
    const primaryColor = setting?.warna || "#2563eb";
    const [isVisible, setIsVisible] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Form state (Inertia useForm)
    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulasi submit (Anda bisa arahkan ke route backend sebenarnya nanti)
        // post(route('contact.send'), { onSuccess: () => setIsSubmitted(true) });

        // Untuk demo tampilan UI saja:
        setTimeout(() => {
            setIsSubmitted(true);
            reset();
            // Reset status success setelah beberapa detik
            setTimeout(() => setIsSubmitted(false), 5000);
        }, 1000);
    };

    return (
        <>
            <Head title="Hubungi Kami - Universitas Asa Indonesia" />

            <LandingLayout>

                {/* --- HERO SECTION --- */}
                <section className="relative pt-32 pb-20 overflow-hidden bg-gray-50 dark:bg-gray-900">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2"></div>
                    </div>

                    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Hubungi <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` }}>Kami</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Punya pertanyaan seputar akademik, pendaftaran, atau kerjasama? Tim kami siap membantu Anda.
                        </p>
                    </div>
                </section>

                {/* --- CONTENT AREA --- */}
                <main className="min-h-[60vh] bg-white dark:bg-gray-950 pb-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">

                            {/* LEFT COLUMN: CONTACT INFO */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Card Alamat */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 hover:-translate-y-1 transition-transform duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Kampus Utama</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        Jl. Raya Kalimalang No. 2A, <br/>
                                        Cipinang Melayu, Kec. Makasar,<br/>
                                        Jakarta Timur 13620
                                    </p>
                                </div>

                                {/* Card Kontak */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 hover:-translate-y-1 transition-transform duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Kontak Langsung</h3>
                                    <div className="space-y-3">
                                        <a href="tel:+62218629472" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors">
                                            <Phone className="w-4 h-4" />
                                            <span>(021) 8629472</span>
                                        </a>
                                        <a href="mailto:info@asaindo.ac.id" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors">
                                            <Mail className="w-4 h-4" />
                                            <span>info@asaindo.ac.id</span>
                                        </a>
                                        <a href="https://home.asaindo.ac.id" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors">
                                            <Globe className="w-4 h-4" />
                                            <span>home.asaindo.ac.id</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Card Jam Operasional */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 hover:-translate-y-1 transition-transform duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Jam Operasional</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        Senin - Jumat: 08.00 - 16.00 WIB <br/>
                                        Sabtu: 08.00 - 13.00 WIB <br/>
                                        <span className="text-red-500">Minggu & Libur Nasional: Tutup</span>
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: FORM & MAP */}
                            <div className="lg:col-span-2 space-y-8">

                                {/* Contact Form */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Kirim Pesan</h3>

                                    {isSubmitted ? (
                                        <div className="flex flex-col items-center justify-center py-10 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 animate-in fade-in zoom-in">
                                            <div className="w-16 h-16 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle2 className="w-8 h-8" />
                                            </div>
                                            <h4 className="text-xl font-bold text-green-800 dark:text-green-200">Pesan Terkirim!</h4>
                                            <p className="text-green-600 dark:text-green-300 mt-2 text-center">Terima kasih. Tim kami akan segera menghubungi Anda.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        value={data.name}
                                                        onChange={e => setData('name', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                                        placeholder="Nama Anda"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        value={data.email}
                                                        onChange={e => setData('email', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                                        placeholder="email@example.com"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">Subjek</label>
                                                <input
                                                    type="text"
                                                    id="subject"
                                                    value={data.subject}
                                                    onChange={e => setData('subject', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                                    placeholder="Perihal pesan..."
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pesan</label>
                                                <textarea
                                                    id="message"
                                                    rows={5}
                                                    value={data.message}
                                                    onChange={e => setData('message', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                                                    placeholder="Tulis pesan Anda di sini..."
                                                    required
                                                ></textarea>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full md:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-lg shadow-indigo-200 dark:shadow-none"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {processing ? 'Mengirim...' : (
                                                    <>
                                                        Kirim Pesan <Send className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>

                                {/* Google Maps Embed */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden h-[400px] group">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1956501256723!2d106.90795497499047!3d-6.237930993750379!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f34f8a335011%3A0x6b4acb2c1e8360f0!2sUniversitas%20Asa%20Indonesia!5e0!3m2!1sid!2sid!4v1709865000000!5m2!1sid!2sid"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen={true}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="grayscale group-hover:grayscale-0 transition-all duration-700"
                                    ></iframe>
                                </div>

                            </div>
                        </div>

                    </div>
                </main>

            </LandingLayout>
        </>
    );
}
