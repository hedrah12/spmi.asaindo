import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    LayoutDashboard, ClipboardList, Building2,
    CheckCircle2, FileText, Link as LinkIcon, ExternalLink,
    AlertCircle, FolderOpen, Calendar,
    AlertTriangle
} from "lucide-react";

// --- REUSE COMPONENT DARI PAMI ---
import CarModal from '@/pages/pami/CarModal';

// --- TYPES ---
interface Upload {
    id: number;
    file_path: string | null;
    file_name: string | null;
    keterangan: string | null;
    created_at: string;
}

interface Car {
    id: number;
    status: string;
    temuan: string | null;
    akar_masalah: string | null;
    tindakan_koreksi: string | null;
    tanggal_pemenuhan: string | null;
    tahun_audit?: string;
    link_bukti?: string | null;
}

interface Indikator {
    id: number;
    pernyataan_indikator: string;
    pami: {
        id: number;
        skor: string;
        uploads: Upload[];
    };
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
        departemen_id: number;
        my_departments: { id: number; nama: string }[];
        debug_message: string | null;
    };
}

export default function RtlIndex({ auth, data, meta }: Props) {
    const [selectedIndikatorForModal, setSelectedIndikatorForModal] = useState<Indikator | null>(null);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Rencana Tindak Koreksi", href: "/rtl" },
    ];
    const DeptSwitcher = () => {
        if (!meta.my_departments || meta.my_departments.length <= 1) {
            return (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Building2 size={16} className="text-gray-500" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{meta.nama_departemen}</span>
                </div>
            );
        }
        return (
            <div className="relative group min-w-[250px]">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400"><Building2 size={16} /></div>
                <select className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-8 py-2 font-medium cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    value={meta.departemen_id || ''}
                    onChange={(e) => router.get(route('rtl.index'), { dept_id: e.target.value })}
                >
                    {meta.my_departments.map(d => <option key={`dept-opt-${d.id}`} value={d.id}>{d.nama}</option>)}
                </select>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rencana Tindak Lanjut (RTL)" />

            <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 flex items-center gap-2">
                            Rencana Tindak Lanjut
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <LayoutDashboard size={16} />
                            <span>Panel Akses:</span>
                            <Badge variant={meta.role === 'auditor' ? 'default' : (meta.role === 'auditee' ? 'secondary' : 'destructive')} className="uppercase">
                                {meta.role}
                            </Badge>
                        </div>
                    </div>

                    <Card className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                       <div className="space-y-1 min-w-[150px]">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Departemen Target</span>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                <DeptSwitcher />
                            </div>
                        </div>
                    </Card>
                </div>

                {meta.debug_message && (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 flex items-start gap-3 text-green-800 dark:text-green-400">
                        <CheckCircle2 size={20} />
                        <p className="text-sm font-medium">{meta.debug_message}</p>
                    </div>
                )}

                <Card className="overflow-hidden shadow-xl border-0 ring-1 ring-gray-200 dark:ring-gray-800 bg-white dark:bg-gray-900 rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm text-left">
                            <thead className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-b border-indigo-700">
                                <tr>
                                    <th className="p-5 font-semibold w-[30%] rounded-tl-xl">Standar / Indikator</th>
                                    <th className="p-5 font-semibold w-[30%]">Temuan & Respon</th>
                                    <th className="p-5 font-semibold w-[20%]">Dokumen Bukti</th>
                                    <th className="p-5 font-semibold w-[20%] text-center rounded-tr-xl">Nilai & Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {data.length === 0 ? (
                                    <tr key="empty-rtl-row">
                                        <td colSpan={4} className="p-12 text-center text-gray-400 dark:text-gray-500 italic bg-gray-50/50 dark:bg-gray-900/50">
                                            <div className="flex flex-col items-center justify-center">
                                                <CheckCircle2 className="w-12 h-12 mb-3 text-green-500 opacity-50" />
                                                <p className="font-bold text-lg text-gray-700 dark:text-gray-300">Tidak Ada Tunggakan RTL!</p>
                                                <p className="text-sm">Semua temuan di departemen ini sudah berstatus Close.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((standar) => (
                                        <React.Fragment key={`std-group-${standar.id}`}>
                                            {standar.indikators.map((ind, index) => {
                                                const skor = ind.pami?.skor || '-';
                                                return (
                                                    <tr key={`ind-row-${ind.id}`} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors duration-200">
                                                        <td className="p-5 align-top border-r border-gray-100 dark:border-gray-800">
                                                            {index === 0 && (
                                                                <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-900/50">
                                                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase block mb-1">Standar</span>
                                                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 whitespace-pre-line">{standar.pernyataan_standar}</p>
                                                                </div>
                                                            )}
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Indikator</span>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-line">
                                                                {ind.pernyataan_indikator}
                                                            </p>
                                                        </td>

                                                        <td className="p-5 align-top border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                                                            {ind.car && (
                                                                <div className="space-y-4">
                                                                    <div className="relative pl-3 border-l-2 border-red-500">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Temuan</span>
                                                                            <div className="flex items-center gap-1">
                                                                                <Badge variant="outline" className="text-[9px] h-5 bg-white dark:bg-gray-900">
                                                                                    <Calendar size={9} className="mr-1" />
                                                                                    {ind.car.tahun_audit}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 italic mb-2">"{ind.car.temuan}"</p>
                                                                        <div className="text-[10px] text-red-500 font-mono bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded inline-block">
                                                                            Target: {formatDate(ind.car.tanggal_pemenuhan)}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="bg-white dark:bg-gray-900 p-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                                                                            <span className="text-[9px] font-bold text-orange-500 uppercase block mb-1">Akar Masalah</span>
                                                                            {ind.car.akar_masalah ? (
                                                                                <p className="text-xs text-gray-700 dark:text-gray-300">{ind.car.akar_masalah}</p>
                                                                            ) : (
                                                                                <span className="text-xs text-red-400 italic flex items-center gap-1">
                                                                                    <AlertTriangle size={10} /> Belum diisi
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="bg-white dark:bg-gray-900 p-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                                                                            <span className="text-[9px] font-bold text-orange-500 uppercase block mb-1">Tindakan Koreksi</span>
                                                                            {ind.car.tindakan_koreksi ? (
                                                                                <p className="text-xs text-gray-700 dark:text-gray-300">{ind.car.tindakan_koreksi}</p>
                                                                            ) : (
                                                                                <span className="text-xs text-red-400 italic flex items-center gap-1">
                                                                                    <AlertTriangle size={10} /> Belum diisi
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="p-5 align-top border-r border-gray-100 dark:border-gray-800">
                                                            {ind.pami?.uploads?.length > 0 ? (
                                                                <ul className="space-y-2">
                                                                    {ind.pami.uploads.map((file) => (
                                                                        <li key={`file-rtl-${file.id}`} className="flex items-start gap-2 text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-colors">
                                                                            {file.file_path ? <FileText size={14} className="text-blue-600 mt-0.5 shrink-0" /> : <LinkIcon size={14} className="text-blue-600 mt-0.5 shrink-0" />}
                                                                            <div className="flex-1 overflow-hidden">
                                                                                <a href={file.file_path ? `/storage/${file.file_path}` : '#'} target="_blank" rel="noreferrer" className="font-medium text-blue-700 dark:text-blue-400 hover:underline truncate block">
                                                                                    {file.file_name || "Link Bukti"}
                                                                                    <ExternalLink size={10} className="inline ml-1" />
                                                                                </a>
                                                                                {file.keterangan && <p className="text-[10px] text-gray-500 truncate mt-0.5">{file.keterangan}</p>}
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-lg">
                                                                    <FolderOpen size={20} className="mb-1 opacity-50" />
                                                                    <span className="text-[10px]">Belum ada bukti</span>
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="p-5 align-top text-center w-[20%]">
                                                            <div className="flex flex-col gap-3 items-center">
                                                                <div className="w-full">
                                                                    <span className="text-[9px] text-gray-400 uppercase block mb-1">Nilai Audit</span>
                                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 text-[10px] w-full justify-center shadow-sm">
                                                                        {skor}
                                                                    </Badge>
                                                                </div>

                                                                {ind.car && (
                                                                    <div className="w-full">
                                                                        <span className="text-[9px] text-gray-400 uppercase block mb-1">Status CAR</span>
                                                                        <Badge variant="outline" className={`text-[10px] w-full justify-center uppercase tracking-wide py-1 ${ind.car.status === 'Open' ? 'border-red-200 text-red-600 bg-red-50 dark:bg-red-900/20' :
                                                                            ind.car.status === 'Submitted' ? 'border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-900/20' :
                                                                                'border-green-200 text-green-600 bg-green-50 dark:bg-green-900/20'
                                                                            }`}>
                                                                            {ind.car.status}
                                                                        </Badge>
                                                                    </div>
                                                                )}

                                                                {ind.car && (
                                                                    <Button
                                                                        size="sm"
                                                                        className={`w-full text-xs gap-1 shadow-sm mt-1 text-white ${['admin', 'superadmin', 'auditor'].includes(meta.role)
                                                                            ? "bg-indigo-600 hover:bg-indigo-700"
                                                                            : "bg-orange-600 hover:bg-orange-700"
                                                                            }`}
                                                                        onClick={() => setSelectedIndikatorForModal(ind)}
                                                                    >
                                                                        {['admin', 'superadmin', 'auditor'].includes(meta.role) ? <CheckCircle2 size={12} /> : <FileText size={12} />}
                                                                        {['admin', 'superadmin', 'auditor'].includes(meta.role) ? 'Verifikasi' : 'Respon'}
                                                                    </Button>
                                                                )}
                                                            </div>
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

            {selectedIndikatorForModal && (
                <CarModal
                    isOpen={!!selectedIndikatorForModal}
                    onClose={() => setSelectedIndikatorForModal(null)}
                    indikator={selectedIndikatorForModal}
                    userRole={meta.role}
                />
            )}
        </AppLayout>
    );
}
