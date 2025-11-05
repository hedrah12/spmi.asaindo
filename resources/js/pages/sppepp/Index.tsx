import React from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card } from "@/components/ui/card";
import { type BreadcrumbItem } from "@/types";

export default function RencanaTindakLanjut() {
  // breadcrumb agar muncul di navigasi atas
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Siklus PPEPP", href: "/sppepp" },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Siklus PPEPP" />
      <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen transition-colors duration-300">
        <Card className="p-8 bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Siklus PPEPP
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Halaman ini menampilkan <strong>Siklus PPEPP</strong>
          </p>

          <a
            href="/dashboard"
            className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Kembali ke Dashboard
          </a>
        </Card>
      </div>
    </AppLayout>
  );
}
