import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { DoorOpen, CheckCircle2, AlertCircle, Lock, Mail } from 'lucide-react';

import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

// --- CSS ANIMATION: ADEGAN TERSANDUNG (SLAPSTICK) ---
const stickmanStyles = `
  /* 1. ANIMASI KAKI & TANGAN (Lari Panik) */
  @keyframes limb-run-left {
    0%, 100% { transform: rotate(-60deg); }
    50% { transform: rotate(60deg); }
  }
  @keyframes limb-run-right {
    0%, 100% { transform: rotate(60deg); }
    50% { transform: rotate(-60deg); }
  }

  /* Saat jatuh, tangan melambai panik */
  @keyframes flail {
    0%, 100% { transform: rotate(-20deg); }
    50% { transform: rotate(20deg); }
  }

  /* 2. SKENARIO UTAMA: Lari -> Tersandung -> Jatuh -> Meluncur */
  @keyframes trip-and-slide {
    /* PHASE 1: LARI (0% - 30%) */
    0% {
      left: 1rem;
      transform: translateX(0) rotate(0deg) translateY(0);
    }
    30% {
      left: 35%;
      transform: translateX(0) rotate(10deg) translateY(0);
    }

    /* PHASE 2: TERSANDUNG/TRIP (30% - 40%) - Loncat dikit kaget */
    35% {
      transform: rotate(-15deg) translateY(-15px); /* Kaki nyangkut, badan condong belakang */
    }
    40% {
      transform: rotate(45deg) translateY(-10px); /* Mulai jatuh ke depan */
    }

    /* PHASE 3: JATUH/SPLAT (40% - 50%) - Menghantam lantai */
    45% {
      left: 45%;
      transform: rotate(90deg) translateY(24px); /* Posisi tidur (faceplant) */
    }

    /* PHASE 4: MELUNCUR/SLIDE (50% - 100%) - Sisa momentum membawa dia masuk pintu */
    100% {
      left: 100%;
      margin-left: -20px;
      transform: rotate(90deg) translateY(24px); /* Tetap tidur sambil meluncur */
      opacity: 0;
    }
  }

  /* SETUP STICKMAN */
  .stickman-container {
    position: absolute;
    bottom: 8px;
    width: 36px;
    height: 52px;
    z-index: 30;
    pointer-events: none;
    transform-origin: bottom center; /* Pivot di kaki untuk rotasi lari */
  }

  .stickman-idle {
    left: 1rem;
    transition: left 0.3s;
  }

  /* CLASS ACTION */
  .stickman-tripping {
    /* Total durasi adegan 2 detik */
    animation: trip-and-slide 2s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
  }

  /* Mengontrol gerakan anggota tubuh berdasarkan Phase animasi utama */

  /* Saat lari (awal) kaki gerak cepat */
  .stickman-tripping .limb {
    animation-duration: 0.2s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }
  .stickman-tripping .leg-l { animation-name: limb-run-left; }
  .stickman-tripping .leg-r { animation-name: limb-run-right; }
  .stickman-tripping .arm-l { animation-name: limb-run-right; } /* Tangan berlawanan kaki */
  .stickman-tripping .arm-r { animation-name: limb-run-left; }

  /* BATU PENGHALANG (Invisible trigger visual joke) */
  .rock {
    position: absolute;
    bottom: 10px;
    left: 40%; /* Posisi dia tersandung */
    width: 8px;
    height: 4px;
    background: #a8a29e;
    border-radius: 4px 4px 0 0;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .show-rock { opacity: 1; }

`;

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    // State: 'idle' | 'action' (lari & jatuh)
    const [animState, setAnimState] = useState<'idle' | 'action'>('idle');

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setAnimState('idle');
        }
    }, [errors]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // 1. Trigger Animasi Lucu
        setAnimState('action');

        // 2. Kirim Data (Delay sedikit agar user lihat dia jatuh dulu)
        // Animasi total 2s. Kita kirim request di tengah-tengah.
        setTimeout(() => {
            post(route('login'), {
                onFinish: () => {
                    // Jika gagal/selesai, reset (tapi jika sukses, inertia akan redirect page)
                    // Kita biarkan dia dalam posisi 'sliding' sampai halaman pindah
                },
                onError: () => {
                    setAnimState('idle'); // Balik berdiri kalau salah password
                    reset('password');
                }
            });
        }, 1500);
    };

    return (
        <AuthLayout title="Selamat Datang" description="Hati-hati, jangan terburu-buru...">
            <Head title="Log in" />
            <style>{stickmanStyles}</style>

            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="space-y-4">

                    {/* INPUT EMAIL */}
                    <div className="space-y-1">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="pl-9 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                placeholder="nama@email.com"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    {/* INPUT PASSWORD */}
                    <div className="space-y-1">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="password"
                                type="password"
                                required
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="pl-9 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                placeholder="••••••••"
                            />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(c) => setData('remember', !!c)}
                            className="border-gray-300 dark:border-gray-600 text-indigo-600"
                        />
                        <Label htmlFor="remember" className="font-normal text-gray-600 dark:text-gray-400">Ingat saya</Label>
                    </div>

                    {/* ======================================================= */}
                    {/* BUTTON ANIMASI (THE FACEPLANT)                          */}
                    {/* ======================================================= */}
                    <div className="relative w-full h-16 mt-6 group z-10">

                        {/* 1. BACKGROUND JALANAN/LANTAI */}
                        <div className="absolute inset-0 rounded-xl bg-indigo-600 dark:bg-indigo-700 overflow-hidden shadow-lg border-b-4 border-indigo-800">
                             {/* Garis-garis kecepatan (Speed lines) saat animasi jalan */}

                        </div>

                        {/* 2. BATU KECIL (Penyebab jatuh) */}
                        <div className={`rock ${animState === 'action' ? 'show-rock' : ''}`}></div>

                        {/* 3. AREA TOMBOL */}
                        <button
                            type="submit"
                            disabled={animState !== 'idle'}
                            className="absolute inset-0 w-full h-full z-20 cursor-pointer disabled:cursor-default"
                        >
                            <div className="relative w-full h-full px-4 flex items-center">

                                {/* TEXT: MASUK */}
                                <span className={`
                                    absolute left-1/2 -translate-x-1/2 font-bold text-white tracking-widest transition-all duration-300
                                    ${animState === 'action' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}
                                `}>
                                    MASUK
                                </span>

                                {/* --- KARAKTER STICKMAN (GEMOY) --- */}
                                <div className={`
                                    stickman-container
                                    ${animState === 'action' ? 'stickman-tripping' : 'stickman-idle'}
                                `}>
                                    <svg viewBox="0 0 50 100" className="w-full h-full overflow-visible drop-shadow-sm" strokeLinecap="round" strokeLinejoin="round">
                                        {/* KAKI KIRI */}
                                        <g className="limb leg-l" style={{ transformOrigin: '25px 65px' }}>
                                            <line x1="25" y1="65" x2="15" y2="95" stroke="white" strokeWidth="7" />
                                            {/* Sepatu */}
                                            <path d="M15,95 L5,95" stroke="white" strokeWidth="7" />
                                        </g>

                                        {/* KAKI KANAN */}
                                        <g className="limb leg-r" style={{ transformOrigin: '25px 65px' }}>
                                            <line x1="25" y1="65" x2="35" y2="95" stroke="white" strokeWidth="7" />
                                            <path d="M35,95 L45,95" stroke="white" strokeWidth="7" />
                                        </g>

                                        {/* BADAN */}
                                        <line x1="25" y1="35" x2="25" y2="65" stroke="white" strokeWidth="7" />

                                        {/* TANGAN KIRI (Di belakang badan) */}
                                        <g className="limb arm-l" style={{ transformOrigin: '25px 40px' }}>
                                            <line x1="25" y1="40" x2="10" y2="55" stroke="white" strokeWidth="6" />
                                        </g>

                                        {/* TANGAN KANAN */}
                                        <g className="limb arm-r" style={{ transformOrigin: '25px 40px' }}>
                                            <line x1="25" y1="40" x2="40" y2="55" stroke="white" strokeWidth="6" />
                                        </g>

                                        {/* KEPALA */}
                                        <circle cx="25" cy="20" r="13" fill="white" />

                                        {/* EKSPRESI WAJAH (Mata) - berubah saat animasi mungkin? (Simplifikasi: tetap polos biar lucu) */}
                                    </svg>
                                </div>
                                {/* --- END STICKMAN --- */}

                                {/* PINTU (Goal) */}
                                <div className={`
                                    absolute right-4 text-white/40 transition-all duration-300
                                    ${animState === 'action' ? 'text-white scale-110 translate-x-1' : ''}
                                `}>
                                    <DoorOpen size={32} />
                                </div>

                            </div>
                        </button>
                    </div>

                    {/* Feedback Status */}
                    <div className="h-6 flex justify-center">
                         {animState === 'action' && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 animate-pulse font-medium">
                                Memproses...
                            </span>
                         )}
                    </div>

                </div>
            </form>
        </AuthLayout>
    );
}




// import { Head, useForm, usePage, Link } from '@inertiajs/react';
// import { FormEventHandler, useEffect } from 'react';
// import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
// import { SharedData } from '@/types'; // Pastikan path ini sesuai dengan project Anda

// import InputError from '@/components/input-error';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import AuthLayout from '@/layouts/auth-layout';

// interface LoginForm {
//     email: string;
//     password: string;
//     remember: boolean;
// }

// export default function Login({ status, canResetPassword }: { status?: string, canResetPassword: boolean }) {
//     // 1. Mengambil Setting Warna dari Shared Props (Sama seperti Welcome.tsx)
//     const { setting } = usePage<SharedData>().props;
//     const primaryColor = setting?.warna || '#2563eb'; // Default Blue

//     const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
//         email: '',
//         password: '',
//         remember: false,
//     });

//     // 2. Setup CSS Variables saat component mount
//     useEffect(() => {
//         document.documentElement.style.setProperty('--primary', primaryColor);
//     }, [primaryColor]);

//     const submit: FormEventHandler = (e) => {
//         e.preventDefault();
//         post(route('login'), {
//             onFinish: () => reset('password'),
//         });
//     };

//     return (
//         <AuthLayout title="" description="">
//             <Head title="Log in" />

//             {/* BACKGROUND DECORATION (Glow Effect) */}
//             <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
//                 <div
//                     className="absolute -top-[10%] -left-[10%] w-64 h-64 rounded-full blur-[100px] opacity-20 dark:opacity-30 transition-colors duration-500"
//                     style={{ backgroundColor: primaryColor }}
//                 ></div>
//                 <div
//                     className="absolute top-[20%] right-[10%] w-40 h-40 rounded-full blur-[80px] bg-purple-500/20 dark:bg-purple-500/30"
//                 ></div>
//             </div>

//             {/* HEADER LOGO / TITLE */}
//             <div className="text-center mb-10">
//                 {setting?.logo ? (
//                      <img src={`/storage/${setting.logo}`} alt="Logo" className="h-16 w-auto mx-auto mb-4 object-contain" />
//                 ) : (
//                     // Logo Placeholder jika tidak ada gambar
//                     <div
//                         className="h-16 w-16 mx-auto mb-4 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
//                         style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` }}
//                     >
//                         S
//                     </div>
//                 )}

//                 <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
//                     Selamat Datang Kembali
//                 </h2>
//                 <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
//                     Masuk ke Sistem Penjaminan Mutu Internal
//                 </p>
//             </div>

//             {/* FORM CONTAINER */}
//             <form onSubmit={submit} className="space-y-6">

//                 {/* INPUT EMAIL */}
//                 <div className="space-y-2">
//                     <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
//                             <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-gray-800 dark:group-focus-within:text-white transition-colors" />
//                         </div>
//                         <Input
//                             id="email"
//                             type="email"
//                             name="email"
//                             value={data.email}
//                             className="pl-12 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:border-transparent rounded-xl transition-all placeholder:text-gray-400 dark:text-white"
//                             // Style khusus untuk focus ring mengikuti warna primary
//                             style={{ '--tw-ring-color': `${primaryColor}40` } as React.CSSProperties}
//                             autoComplete="username"
//                             placeholder="Email Institusi"
//                             onChange={(e) => setData('email', e.target.value)}
//                             required
//                         />
//                     </div>
//                     <InputError message={errors.email} />
//                 </div>

//                 {/* INPUT PASSWORD */}
//                 <div className="space-y-2">
//                     <div className="relative group">
//                         <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
//                             <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-gray-800 dark:group-focus-within:text-white transition-colors" />
//                         </div>
//                         <Input
//                             id="password"
//                             type="password"
//                             name="password"
//                             value={data.password}
//                             className="pl-12 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:border-transparent rounded-xl transition-all placeholder:text-gray-400 dark:text-white"
//                             style={{ '--tw-ring-color': `${primaryColor}40` } as React.CSSProperties}
//                             autoComplete="current-password"
//                             placeholder="Password"
//                             onChange={(e) => setData('password', e.target.value)}
//                             required
//                         />
//                     </div>
//                     <InputError message={errors.password} />
//                 </div>

//                 {/* REMEMBER & FORGOT */}
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                         <Checkbox
//                             id="remember"
//                             checked={data.remember}
//                             onCheckedChange={(checked) => setData('remember', !!checked)}
//                             className="border-gray-300 dark:border-gray-600 rounded data-[state=checked]:border-transparent"
//                             // Checkbox color override
//                             style={{
//                                 backgroundColor: data.remember ? primaryColor : undefined
//                             }}
//                         />
//                         <Label htmlFor="remember" className="text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer select-none">
//                             Ingat saya
//                         </Label>
//                     </div>

//                     {canResetPassword && (
//                         <Link
//                             href={route('password.request')}
//                             className="text-sm font-medium hover:underline transition-colors"
//                             style={{ color: primaryColor }}
//                         >
//                             Lupa password?
//                         </Link>
//                     )}
//                 </div>

//                 {/* DYNAMIC BUTTON (Sama Style dengan Welcome.tsx) */}
//                 <button
//                     type="submit"
//                     disabled={processing}
//                     className="w-full h-12 flex justify-center items-center gap-2 rounded-xl font-bold text-white transition-all duration-300 transform active:scale-[0.98] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
//                     style={{
//                         background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)`,
//                         boxShadow: `0 10px 20px -5px ${primaryColor}60`
//                     }}
//                 >
//                     {processing ? (
//                         <Loader2 className="h-5 w-5 animate-spin" />
//                     ) : (
//                         <>
//                             <span>Masuk</span>
//                             <ArrowRight className="h-5 w-5 opacity-80" />
//                         </>
//                     )}
//                 </button>
//             </form>

//             {/* FOOTER LINK */}
//             <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
//                 Belum punya akun?{' '}
//                 <Link
//                     href="/"
//                     className="font-semibold hover:underline"
//                     style={{ color: primaryColor }}
//                 >
//                     Hubungi Administrator
//                 </Link>
//             </div>
//         </AuthLayout>
//     );
// }
