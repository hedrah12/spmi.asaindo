import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    LayoutDashboard, CheckCircle2, AlertCircle, Calendar,
    ListChecks, Filter, FileText, Printer, Building2, ChevronRight,
    Search, AlertTriangle, Clock, X, CheckCircle
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";

// --- TYPES ---
interface Pami {
    id: number;
    skor: string;
}

interface Car {
    status: string;
    ketidaksesuaian: string;
    temuan: string | null;
    akar_masalah: string | null;
    tindakan_koreksi: string | null;
    tanggal_pemenuhan: string | null;
}

interface Indikator {
    id: number;
    pernyataan_indikator: string;
    pami: Pami;
    car: Car | null;
}

interface Standar {
    id: number;
    pernyataan_standar: string;
    indikators: Indikator[];
}

interface Props {
    auth: any;
    data: Standar[];
    meta: {
        role: string;
        nama_departemen: string;
        available_years: string[];
        selected_year: string;
        departemen_id: number;
        jadwal_id: number;
        my_departments?: { id: number; nama: string }[];
        debug_message: string | null;
        has_schedule: boolean;
    };
}

// Opsi Filter
const FILTER_OPTIONS = [
    { label: "Semua", value: "ALL" },
    { label: "Sesuai", value: "Sesuai" },
    { label: "Mayor", value: "Mayor" },
    { label: "Minor", value: "Minor" },
    { label: "Observasi", value: "Observasi" },
];

export default function PencatatanAmiIndex({ auth, data, meta }: Props) {
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [selectedIndikator, setSelectedIndikator] = useState<Indikator | null>(null);

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Pencatatan AMI", href: "/pencatatan-ami" },
    ];

    // --- CLIENT SIDE FILTERING ---
    const filteredData = useMemo(() => {
        if (activeFilter === "ALL") return data;
        return data.map(standar => {
            const matchingIndikators = standar.indikators.filter(ind => {
                return ind.pami?.skor.includes(activeFilter);
            });
            if (matchingIndikators.length > 0) {
                return { ...standar, indikators: matchingIndikators };
            }
            return null;
        }).filter(Boolean) as Standar[];
    }, [data, activeFilter]);

    // Format Tanggal
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Helper: Warna Badge yang "Dipercantik"
    const getScoreBadgeVariant = (skor: string) => {
        const lowerSkor = skor.toLowerCase();
        if (lowerSkor.includes("observasi")) return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
        if (lowerSkor.includes("minor")) return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
        if (lowerSkor.includes("mayor")) return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
        if (lowerSkor.includes("melampaui")) return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
        if (lowerSkor.includes("sesuai")) return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    };

    // Helper: Style untuk Tombol Filter
    const getFilterButtonClass = (value: string, isActive: boolean) => {
        if (!isActive) return "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700";

        switch (value) {
            case "Sesuai": return "bg-emerald-100 text-emerald-800 ring-emerald-500 dark:bg-emerald-900/50 dark:text-emerald-300 ring-2 ring-offset-1 dark:ring-offset-gray-900 border-transparent";
            case "Mayor": return "bg-rose-100 text-rose-800 ring-rose-500 dark:bg-rose-900/50 dark:text-rose-300 ring-2 ring-offset-1 dark:ring-offset-gray-900 border-transparent";
            case "Minor": return "bg-orange-100 text-orange-800 ring-orange-500 dark:bg-orange-900/50 dark:text-orange-300 ring-2 ring-offset-1 dark:ring-offset-gray-900 border-transparent";
            case "Observasi": return "bg-yellow-100 text-yellow-800 ring-yellow-500 dark:bg-yellow-900/50 dark:text-yellow-300 ring-2 ring-offset-1 dark:ring-offset-gray-900 border-transparent";
            default: return "bg-indigo-100 text-indigo-800 ring-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-300 ring-2 ring-offset-1 dark:ring-offset-gray-900 border-transparent";
        }
    };

    // --- SWITCHER COMPONENTS ---
    const YearSwitcher = () => (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 dark:text-gray-400">
                <Calendar size={14} />
            </div>
            <select
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-24 pl-8 pr-6 py-1.5 font-semibold cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
                value={meta.selected_year}
                onChange={(e) => router.get(route('pencatatan.index'), { tahun: e.target.value, dept_id: meta.departemen_id })}
            >
                {meta.available_years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500 dark:text-gray-400">
                <ChevronRight size={12} className="rotate-90" />
            </div>
        </div>
    );

    const DeptSwitcher = () => {
        if (!meta.my_departments || meta.my_departments.length <= 1) {
            return (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <Building2 size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">{meta.nama_departemen}</span>
                </div>
            );
        }
        return (
            <div className="relative min-w-[200px]">
                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-indigo-600 dark:text-indigo-400">
                    <Building2 size={16} />
                </div>
                <select
                    className="appearance-none bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-8 py-2 font-semibold cursor-pointer transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                    value={meta.departemen_id || ''}
                    onChange={(e) => router.get(route('pencatatan.index'), { dept_id: e.target.value, tahun: meta.selected_year })}
                >
                    {meta.my_departments.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-700 dark:text-indigo-400">
                    <ChevronRight size={16} className="rotate-90" />
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pencatatan AMI" />

            <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">

                {/* HEADER SECTION */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 dark:from-indigo-400 dark:to-purple-400 flex items-center gap-2">
                           <ListChecks className="text-indigo-600 dark:text-indigo-400 w-8 h-8" /> Pencatatan Hasil AMI
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 pl-1">
                            Monitor status kepatuhan standar dan tindak lanjut audit.
                        </p>
                    </div>

                    <Card className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tahun</span>
                            <YearSwitcher />
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Departemen</span>
                            <DeptSwitcher />
                        </div>
                    </Card>
                </div>

                {!meta.has_schedule && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 flex items-start gap-3 text-red-800 dark:text-red-400">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <p className="text-sm font-medium">{meta.debug_message || "Data tidak ditemukan."}</p>
                    </div>
                )}

                {/* FILTER BAR */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2 mr-2 text-gray-500 text-sm font-medium dark:text-gray-400">
                        <Filter size={16} />
                        <span className="hidden sm:inline">Filter Status:</span>
                    </div>
                    {FILTER_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setActiveFilter(option.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${getFilterButtonClass(option.value, activeFilter === option.value)}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* DATA TABLE */}
                <Card className="overflow-hidden shadow-xl border-0 ring-1 ring-gray-200 dark:ring-gray-800 bg-white dark:bg-gray-900 rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm text-left">
                            <thead className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-b border-indigo-700">
                                <tr>
                                    <th className="p-5 font-semibold w-[30%] rounded-tl-xl">Standar Audit</th>
                                    <th className="p-5 font-semibold w-[40%]">Pernyataan Indikator</th>
                                    <th className="p-5 font-semibold text-center w-[15%]">Nilai</th>
                                    <th className="p-5 font-semibold text-center w-[15%] rounded-tr-xl">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                                <Search size={48} className="mb-4 opacity-20" />
                                                <p className="font-medium">Tidak ada data penilaian yang sesuai filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((standar, sIdx) => (
                                        <React.Fragment key={standar.id}>
                                            {standar.indikators.map((indikator, index) => {
                                                const skor = indikator.pami?.skor || '-';
                                                const carStatus = indikator.car?.status;
                                                const badgeClass = getScoreBadgeVariant(skor);

                                                // ID unik untuk key
                                                const rowKey = `row-${standar.id}-${indikator.id}`;

                                                return (
                                                    <tr key={rowKey} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                                        {/* KOLOM STANDAR (ROWSPAN) */}
                                                        {index === 0 && (
                                                            <td
                                                                rowSpan={standar.indikators.length}
                                                                className="p-5 align-top bg-gray-50/50 dark:bg-gray-900/40 border-r border-gray-100 dark:border-gray-800"
                                                            >
                                                                <div className="sticky top-5 space-y-2">
                                                                    <Badge variant="outline" className="mb-1 text-[10px] text-indigo-600 border-indigo-200 dark:text-indigo-400 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20">
                                                                        Standar
                                                                    </Badge>
                                                                    <p className="font-bold text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                                                                        {standar.pernyataan_standar}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {/* KOLOM INDIKATOR */}
                                                        <td className="p-5 align-top border-r border-gray-100 dark:border-gray-800 relative">
                                                            <div className="flex items-start gap-3">
                                                                <div className="mt-1.5 min-w-[6px] min-h-[6px] rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-indigo-500 transition-colors"></div>
                                                                <div className="space-y-2 w-full">
                                                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                                                        {indikator.pernyataan_indikator}
                                                                    </p>
                                                                    {carStatus && (
                                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${
                                                                            carStatus === 'OPEN'
                                                                                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                                                                                : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                                                                        }`}>
                                                                            {carStatus === 'OPEN' ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                                                                            CAR: {carStatus}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* KOLOM NILAI */}
                                                        <td className="p-5 align-top text-center border-r border-gray-100 dark:border-gray-800">
                                                            <Badge className={`px-3 py-1 text-[10px] border shadow-sm font-bold uppercase tracking-wide whitespace-nowrap ${badgeClass}`}>
                                                                {skor}
                                                            </Badge>
                                                        </td>

                                                        {/* KOLOM AKSI */}
                                                        <td className="p-5 align-top text-center">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/50 dark:bg-transparent"
                                                                onClick={() => setSelectedIndikator(indikator)}
                                                            >
                                                                <FileText size={14} className="mr-1.5" /> Detail
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* --- MODAL DETAIL --- */}
            <Dialog open={!!selectedIndikator} onOpenChange={(open) => !open && setSelectedIndikator(null)}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xl">
                    {selectedIndikator && (
                        <>
                            <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                        <FileText size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                            Detail Hasil Audit
                                        </DialogTitle>
                                        <DialogDescription className="text-gray-500 dark:text-gray-400">
                                            Tinjauan lengkap untuk indikator dan status perbaikan (CAR).
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="p-6 space-y-6">
                                {/* Section 1: Indikator & Skor */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                         <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pernyataan Indikator</h4>
                                         <Badge className={`uppercase px-3 py-1 ${getScoreBadgeVariant(selectedIndikator.pami?.skor || '')}`}>
                                            {selectedIndikator.pami?.skor || 'Belum Dinilai'}
                                        </Badge>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                                            {selectedIndikator.pernyataan_indikator}
                                        </p>
                                    </div>
                                </div>

                                {/* Section 2: CAR Details */}
                                {selectedIndikator.car ? (
                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle size={18} className="text-rose-500" />
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Lembar Ketidaksesuaian (CAR)</h3>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            {/* Kolom Kiri: Info Utama */}
                                            <div className="md:col-span-1 space-y-3">
                                                <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Status</span>
                                                        <Badge variant={selectedIndikator.car.status === 'CLOSED' ? 'default' : 'destructive'} className="uppercase w-full justify-center">
                                                            {selectedIndikator.car.status}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Target Penyelesaian</span>
                                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            <Clock size={14} className="text-indigo-500" />
                                                            {formatDate(selectedIndikator.car.tanggal_pemenuhan)}
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>

                                            {/* Kolom Kanan: Detail Text */}
                                            <div className="md:col-span-2 space-y-4">
                                                <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-lg border border-rose-100 dark:border-rose-900/50">
                                                    <h5 className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase mb-1">Temuan Auditor</h5>
                                                    <p className="text-sm text-gray-800 dark:text-gray-200">
                                                        {selectedIndikator.car.temuan || "-"}
                                                    </p>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <label className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase block mb-1">Akar Masalah</label>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedIndikator.car.akar_masalah || "-"}</p>
                                                    </div>
                                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <label className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase block mb-1">Tindakan Koreksi</label>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedIndikator.car.tindakan_koreksi || "-"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 opacity-80" />
                                            <h4 className="font-semibold text-gray-900 dark:text-white">Tidak Ada Ketidaksesuaian</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Indikator ini memenuhi standar (Sesuai) atau belum ada CAR yang diterbitkan.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex justify-between sm:justify-between items-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                         const url = route('pencatatan.print', {
                                            id_indikator: selectedIndikator.id,
                                            jadwal_id: meta.jadwal_id
                                        });
                                        window.open(url, '_blank');
                                    }}
                                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    <Printer size={16} className="mr-2" /> Cetak PDF
                                </Button>
                                <Button onClick={() => setSelectedIndikator(null)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    Tutup
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
