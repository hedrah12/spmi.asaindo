import AppLogoIcon from "@/components/app-logo-icon";
import { Link, usePage } from "@inertiajs/react";
import { useEffect } from "react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const { props } = usePage();

    const setting = props?.setting as {
        nama_app: string;
        logo?: string;
        warna?: string;
    };

    const primaryColor = setting?.warna || "#0ea5e9";
    const primaryForeground = "#ffffff";

    useEffect(() => {
        document.documentElement.style.setProperty("--primary", primaryColor);
        document.documentElement.style.setProperty("--primary-foreground", primaryForeground);
    }, [primaryColor]);

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100">

            {/* LEFT: IMAGE / HERO */}
            <div
                className="hidden lg:flex items-center justify-center bg-cover bg-center relative"
                style={{
                    backgroundImage: "url('/storage/img/IMG_0724.JPG')"
                }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

                <div className="relative z-10 text-white text-center px-10 max-w-xl">
                    <h1 className="text-4xl font-bold drop-shadow-lg">
                        Selamat Datang di {setting?.nama_app}
                    </h1>
                </div>
            </div>

            {/* RIGHT: FORM LOGIN */}
            <div className="flex items-center justify-center p-6 lg:p-10 bg-white">
                <div className="w-full max-w-md space-y-6">

                    {/* Logo */}
                    <div className="flex flex-col items-center gap-3">
                        <img
                            src={`/storage/${setting.logo}`}
                            alt="Logo"
                            className="h-35 w-35 object-contain rounded-xl p-2"
                        />


                        <span className="text-xl font-semibold text-gray-900">
                            {setting?.nama_app}
                        </span>
                    </div>

                    {/* Title & Description */}
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {description && (
                            <p className="text-gray-600 text-sm">{description}</p>
                        )}
                    </div>

                    {/* FORM */}
                    <div className="mt-4">{children}</div>

                    {/* FOOTER */}
                    <p className="text-xs text-center text-gray-500 mt-6">
                        © {new Date().getFullYear()} {setting?.nama_app}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
