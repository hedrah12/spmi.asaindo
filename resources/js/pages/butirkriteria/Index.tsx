import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type BreadcrumbItem } from "@/types";
import ModalTambah from "./ModalTambah";

export default function ButirKriteriaIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Butir Kriteria", href: "/butirkriteria" },
    ];

    const allData = [
        {
            id: 1,
            element: "C1. Visi, Misi, Tujuan, dan Sasaran",
            prodi: "tekpang",indikator:
                "Dokumen visi, misi, tujuan, dan sasaran institusi telah ditetapkan dan disosialisasikan kepada seluruh sivitas akademika serta pemangku kepentingan terkait.",
        },
        {
            id: 2,
            element: "C2. Tata Pamong, Kepemimpinan, Sistem Pengelolaan, dan Penjaminan Mutu",
            prodi: "tekpang",indikator:
                "Struktur organisasi, mekanisme kepemimpinan, dan SOP penjaminan mutu dilaksanakan secara konsisten dan dievaluasi secara berkala.",
        },
        {
            id: 3,
            element: "C3. Mahasiswa",
            prodi: "tekpang",indikator:
                "Data mahasiswa, penerimaan, kelulusan, kegiatan kemahasiswaan, serta kepuasan mahasiswa tercatat dan dianalisis untuk peningkatan mutu.",
        },
        {
            id: 4,
            element: "C4. Sumber Daya Manusia",
            prodi: "tekpang",indikator:
                "Tenaga pendidik dan tenaga kependidikan memiliki kualifikasi, kompetensi, dan beban kerja yang sesuai dengan standar yang berlaku.",
        },
        {
            id: 5,
            element: "C5. Kurikulum, Pembelajaran, dan Suasana Akademik",
            prodi: "tekpang",indikator:
                "Kurikulum dikembangkan sesuai standar nasional dan kebutuhan industri; proses pembelajaran dijalankan dengan metode yang tepat dan terukur.",
        },
        {
            id: 6,
            element: "C6. Pembiayaan, Sarana, dan Prasarana",
            prodi: "tekpang",indikator:
                "Sumber pembiayaan, fasilitas, dan prasarana memadai, terawat, serta mendukung tercapainya tujuan pendidikan dan penelitian.",
        },
        {
            id: 7,
            element: "C7. Penelitian dan Pengabdian kepada Masyarakat",
            prodi: "tekpang",indikator:
                "Kegiatan penelitian dan pengabdian masyarakat terdokumentasi, memiliki dampak nyata, dan diintegrasikan dengan proses pembelajaran.",
        },
        {
            id: 8,
            element: "C8. Luaran dan Capaian Tridharma", prodi: "tekpang",
            indikator:
                "Hasil lulusan, publikasi ilmiah, paten, dan penghargaan diukur secara sistematis untuk menilai capaian tridharma perguruan tinggi.",
        },
        {
            id: 9,
            element: "C9. Sistem Penjaminan Mutu Internal",
            prodi: "tekpang",indikator:
                "Sistem penjaminan mutu internal diterapkan, dimonitor, dievaluasi, dan diperbaiki secara berkelanjutan sesuai standar akreditasi.",
        },
    ];


    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const itemsPerPage = 5;

    const filteredData = allData.filter((item) =>
        item.element.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Butir Kriteria" />
            <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen transition-colors duration-300">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Butir Kriteria</h1>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="shadow-sm bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg transition-all"
                    >
                        Tambah
                    </Button>
                </div>

                {/* Modal */}
                <ModalTambah open={showModal} onClose={() => setShowModal(false)} />

                {/* Search Bar */}
                <div className="relative mb-6 w-full sm:w-1/3">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan elemen..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 focus:outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Table */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-left">
                                <th className="p-4 w-1/5">Element</th>
                                <th className="p-4">Indikator</th>
                                <th className="p-4">Program Studi</th>
                                <th className="p-4 text-center w-[120px]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? (
                                currentData.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0
                                                ? "bg-gray-50 dark:bg-gray-700/20"
                                                : "bg-white dark:bg-gray-800/50"
                                            } hover:bg-gray-100 dark:hover:bg-gray-600/30 transition`}
                                    >
                                        <td className="p-4 font-medium text-gray-800 dark:text-gray-100 align-top">
                                            {item.element}
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300 text-justify">
                                            {item.indikator}
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300 text-justify">
                                            {item.prodi}
                                        </td>
                                        <td className="p-4 text-center flex justify-center gap-2">
                                            <button className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition">
                                                <Pencil className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800 transition">
                                                <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-6 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-300">
                        <span>
                            Menampilkan {currentData.length} dari {filteredData.length} data
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="px-3 py-1 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Sebelumnya
                            </Button>
                            <span className="px-2">Halaman {currentPage} dari {totalPages}</span>
                            <Button
                                variant="outline"
                                className="px-3 py-1 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
