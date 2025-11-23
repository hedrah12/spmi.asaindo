import React from "react";
import { usePage } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageProps } from "@inertiajs/core";
import { Shield } from "lucide-react"; // Pastikan import icon Shield

// 1. UPDATE INTERFACE
// Menyesuaikan dengan data yang dikirim dari HandleInertiaRequests
interface DashboardPageProps extends PageProps {
  auth: {
    user: {
      name: string;
    };
    active_role?: string; // Data role dari middleware
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
];

export default function Dashboard() {
  const { auth } = usePage<DashboardPageProps>().props;

  // 2. DEFINISI ROLE
  // Fallback ke 'guest' jika undefined agar tidak error saat .toUpperCase()
  const currentRole = auth.active_role || "guest";

  // Helper Boolean
  const isSuperAdmin = currentRole === 'superadmin';
  const isAdmin = currentRole === 'admin';

  const prodiList = [
    "S2 Manajemen", "S1 Manajemen", "S1 Akuntansi", "S1 Sistem Informasi",
    "S1 Teknologi Informasi", "S1 Teknologi Pangan", "D3 Perhotelan",
    "D3 Usaha Perjalanan Wisata", "D1 Perhotelan",
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen transition-colors duration-300">

        {/* Header Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Welcome <span className="text-indigo-600">{auth.user.name}</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-200">
                        <Shield size={12}/> {currentRole.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>

        {/* Siklus PPEPP */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold text-gray-800 dark:text-gray-100 tracking-wide">
              Siklus PPEPP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "Penetapan", color: "from-blue-500 to-indigo-500" },
                { label: "Pelaksanaan", color: "from-cyan-500 to-sky-500" },
                { label: "Evaluasi", color: "from-emerald-500 to-green-500" },
                { label: "Pengendalian", color: "from-amber-500 to-orange-500" },
                { label: "Peningkatan", color: "from-pink-500 to-rose-500" },
              ].map((btn, index) => (
                <button
                  key={index}
                  className={`px-6 py-2 text-white font-medium rounded-lg shadow-md
                              bg-gradient-to-r ${btn.color} hover:brightness-110 transition-all`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grid Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Progress per Prodi */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="font-semibold text-base text-gray-800 dark:text-gray-100">
                Universitas (Seluruh Prodi)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {prodiList.map((prodi, i) => {
                  const progress = 50 + (i % 5) * 10;
                  const color = [
                    "bg-indigo-500",
                    "bg-sky-500",
                    "bg-emerald-500",
                    "bg-amber-500",
                    "bg-rose-500",
                  ][i % 5];
                  return (
                    <li key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{prodi}</span>
                        <span className="opacity-70 text-gray-600 dark:text-gray-400">
                          {progress}%
                        </span>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${color} h-3 rounded-full transition-all`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Grafik */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl flex items-center justify-center hover:shadow-xl transition-all">
            <p className="text-gray-600 dark:text-gray-400 text-sm">📊 Grafik atau Statistik</p>
          </Card>

          {/* Informasi Tambahan */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl flex items-center justify-center hover:shadow-xl transition-all">
            <p className="text-gray-600 dark:text-gray-400 text-sm">📁 Informasi Tambahan</p>
          </Card>
        </div>

        {/* Bagian bawah */}
        <Card className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl h-[180px] flex items-center justify-center hover:shadow-xl transition-all">
          <p className="text-gray-600 dark:text-gray-400 text-sm">🧾 Data Tambahan atau Grafik Tren</p>
        </Card>
      </div>
    </AppLayout>
  );
}
