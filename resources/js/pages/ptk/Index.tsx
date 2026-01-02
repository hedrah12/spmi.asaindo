import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    LayoutDashboard, AlertTriangle, Calendar, Building2,
    CheckCircle2, FileText, Link as LinkIcon, ExternalLink, AlertCircle,
    FolderOpen, ChevronRight, Eye, Trash2, Loader2, Download,
    FileImage, FileSpreadsheet, FileVideo, FileMusic, File as FileIcon, X
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";

// --- REUSE COMPONENT PAMI ---
import CarModal from '@/Pages/pami/CarModal';

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
        available_years: string[];
        selected_year: string;
        departemen_id: number;
        my_departments: { id: number; nama: string }[];
        debug_message: string | null;
        has_schedule: boolean;
    };
}

// --- HELPER: FILE ICON ---
function getFileIcon(fileName: string | null, className = "w-6 h-6") {
    if (!fileName) return <LinkIcon className={`${className} text-indigo-500`} />;

    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return <FileText className={`${className} text-red-500`} />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FileImage className={`${className} text-blue-500`} />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className={`${className} text-green-600`} />;
    if (['doc', 'docx'].includes(ext)) return <FileText className={`${className} text-blue-700`} />;
    if (['mp4', 'mov', 'avi'].includes(ext)) return <FileVideo className={`${className} text-purple-600`} />;
    if (['mp3', 'wav'].includes(ext)) return <FileMusic className={`${className} text-yellow-600`} />;

    return <FileIcon className={`${className} text-gray-500`} />;
}

export default function PtkIndex({ auth, data, meta }: Props) {
    const [selectedIndikatorForModal, setSelectedIndikatorForModal] = useState<Indikator | null>(null);
    const [previewFile, setPreviewFile] = useState<Upload | null>(null);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // --- COMPONENT: SWITCHERS (Style Match Index.tsx) ---
    const YearSwitcher = () => (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 dark:text-gray-400">
                <Calendar size={14} />
            </div>
            <select
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-24 pl-8 pr-6 py-1.5 font-semibold cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
                value={meta.selected_year}
                onChange={(e) => router.get(route('ptk.index'), { tahun: e.target.value, dept_id: meta.departemen_id })}
            >
                {meta.available_years.map(y => <option key={`year-${y}`} value={y}>{y}</option>)}
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
            <div className="relative group min-w-[200px]">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-indigo-600 dark:text-indigo-400">
                    <Building2 size={16} />
                </div>
                <select
                    className="appearance-none bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-8 py-2 font-semibold cursor-pointer transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                    value={meta.departemen_id || ''}
                    onChange={(e) => router.get(route('ptk.index'), { dept_id: e.target.value, tahun: meta.selected_year })}
                >
                    {meta.my_departments.map(d => <option key={`dept-${d.id}`} value={d.id}>{d.nama}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-700 dark:text-indigo-400">
                    <ChevronRight size={16} className="rotate-90" />
                </div>
            </div>
        );
    };

    // --- COMPONENT: FILE ITEM (Style Match Index.tsx) ---
    const FileItem = ({ file }: { file: Upload }) => (
        <div className="group relative pl-3 border-l-2 border-indigo-500 bg-white dark:bg-gray-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 p-2 rounded-r-md transition-colors border border-gray-100 dark:border-gray-700 shadow-sm mb-2">
            <div className="flex justify-between items-start">
                <div className="overflow-hidden cursor-pointer w-full" onClick={() => setPreviewFile(file)}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                            {formatDate(file.created_at)}
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        {getFileIcon(file.file_name, "w-4 h-4 shrink-0 mt-0.5")}
                        <div className="flex flex-col overflow-hidden">
                            {file.file_name && (
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate transition-colors">
                                    {file.file_name}
                                </span>
                            )}
                            {file.keterangan && (
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 italic truncate flex items-center gap-1 mt-0.5">
                                    <LinkIcon size={8} /> {file.keterangan}
                                </span>
                            )}
                            {!file.file_name && !file.keterangan && <span className="text-xs text-gray-400 italic">Tanpa Nama</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                    <button
                        onClick={() => setPreviewFile(file)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="Preview File"
                    >
                        <Eye size={14} />
                    </button>
                </div>
            </div>
        </div>
    );

    // --- HELPER: RENDER PREVIEW ---
    const renderPreviewContent = (file: Upload) => {
        // Gunakan path storage langsung
        const url = file.file_path ? `/storage/${file.file_path}` : null;

        if (!url) {
            return (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <LinkIcon className="w-16 h-16 text-indigo-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Keterangan / Tautan</h3>
                    <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-y-auto max-h-[200px]">
                        <p className="text-sm text-gray-700 dark:text-gray-300 break-all whitespace-pre-line">{file.keterangan}</p>
                    </div>
                    {file.keterangan && (file.keterangan.startsWith('http') || file.keterangan.startsWith('www')) && (
                        <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700" onClick={() => window.open(file.keterangan || '#', '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" /> Buka Tautan
                        </Button>
                    )}
                </div>
            )
        }

        const ext = file.file_name?.split('.').pop()?.toLowerCase() || '';

        // 1. Gambar
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))
            return <img src={url} alt={file.file_name || 'File'} className="max-w-full max-h-[70vh] object-contain mx-auto rounded-md shadow-sm" />;

        // 2. PDF
        if (['pdf'].includes(ext))
            return <iframe src={url} className="w-full h-[70vh] rounded-md border dark:border-gray-700" title="PDF Preview"></iframe>;

        // 3. Video
        if (['mp4', 'mov', 'avi'].includes(ext))
            return <video controls src={url} className="w-full max-h-[70vh] rounded-md" />;

        // 4. Lainnya
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                <FileSpreadsheet className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Preview tidak tersedia</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">File ini tidak dapat ditampilkan langsung di browser.</p>
                <Button onClick={() => window.open(url, '_blank')} variant="outline">
                    <Download className="w-4 h-4 mr-2" /> Download File
                </Button>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Tindakan Koreksi (PTK)" />

            <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="space-y-1">
                        {/* Mengubah Gradient menjadi Indigo/Violet sesuai style PAMI/Index.tsx */}
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 dark:from-indigo-400 dark:to-purple-400 flex items-center gap-2">
                            <FileText className="text-indigo-600 dark:text-indigo-400 w-8 h-8" /> Tindakan Koreksi (PTK)
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <LayoutDashboard size={16} />
                            <span>Akses: <span className="uppercase font-bold text-indigo-600 dark:text-indigo-400">{meta.role}</span></span>
                        </div>
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
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{meta.debug_message || "Tidak ada data."}</p>
                    </div>
                )}

                <Card className="overflow-hidden shadow-xl border-0 ring-1 ring-gray-200 dark:ring-gray-800 bg-white dark:bg-gray-900 rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm text-left">
                            {/* Header Gradient Indigo/Violet */}
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
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-gray-400 dark:text-gray-500 italic bg-gray-50/50 dark:bg-gray-900/50">
                                            <div className="flex flex-col items-center justify-center">
                                                <CheckCircle2 className="w-12 h-12 mb-3 text-green-500 opacity-50" />
                                                <p className="font-bold text-lg text-gray-700 dark:text-gray-300">Tidak Ada Temuan!</p>
                                                <p className="text-sm">Semua standar telah terpenuhi.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((standar, sIdx) => (
                                        <React.Fragment key={`standar-${standar.id || sIdx}`}>
                                            {standar.indikators.map((ind, iIdx) => {
                                                const skor = ind.pami?.skor || '-';
                                                const rowKey = `row-${standar.id || sIdx}-${ind.id || iIdx}`;

                                                return (
                                                    <tr key={rowKey} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors duration-200">
                                                        <td className="p-5 align-top border-r border-gray-100 dark:border-gray-800">
                                                            {iIdx === 0 && (
                                                                <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-900/50">
                                                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase block mb-1">Standar</span>
                                                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{standar.pernyataan_standar}</p>
                                                                </div>
                                                            )}
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Indikator</span>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                                                {ind.pernyataan_indikator}
                                                            </p>
                                                        </td>

                                                        <td className="p-5 align-top border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                                                            {ind.car && (
                                                                <div className="space-y-4">
                                                                    <div className="relative pl-3 border-l-2 border-red-500">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Temuan</span>
                                                                            <span className="text-[10px] text-red-500 font-mono bg-red-50 dark:bg-red-900/30 px-1 rounded">
                                                                                Target: {formatDate(ind.car.tanggal_pemenuhan)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{ind.car.temuan}"</p>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <div className="bg-white dark:bg-gray-900 p-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                                                                            <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase block mb-1">Akar Masalah</span>
                                                                            <p className="text-xs text-gray-700 dark:text-gray-300">{ind.car.akar_masalah || "-"}</p>
                                                                        </div>
                                                                        <div className="bg-white dark:bg-gray-900 p-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                                                                            <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase block mb-1">Tindakan Koreksi</span>
                                                                            <p className="text-xs text-gray-700 dark:text-gray-300">{ind.car.tindakan_koreksi || "-"}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="p-5 align-top border-r border-gray-100 dark:border-gray-800">
                                                            {/* UPDATE: Menggunakan FileItem dari Index.tsx style */}
                                                            {ind.pami?.uploads?.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {ind.pami.uploads.map((file, fIdx) => (
                                                                        <FileItem key={`file-${file.id || fIdx}`} file={file} />
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-lg">
                                                                    <FolderOpen size={20} className="text-gray-300 dark:text-gray-600" />
                                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Belum ada bukti</span>
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="p-5 align-top text-center">
                                                            <div className="flex flex-col gap-3 items-center">
                                                                <div className="w-full">
                                                                    <span className="text-[9px] text-gray-400 uppercase block mb-1">Nilai Audit</span>
                                                                    <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-[10px] w-full justify-center">
                                                                        {skor}
                                                                    </Badge>
                                                                </div>

                                                                {ind.car && (
                                                                    <>
                                                                        <div className="w-full">
                                                                            <span className="text-[9px] text-gray-400 uppercase block mb-1">Status CAR</span>
                                                                            <Badge variant="outline" className={`text-[10px] w-full justify-center uppercase ${ind.car.status === 'Close' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
                                                                                {ind.car.status}
                                                                            </Badge>
                                                                        </div>
                                                                        <Button
                                                                            size="sm"
                                                                            className={`w-full text-xs gap-1 text-white shadow-sm ${['admin', 'superadmin', 'auditor'].includes(meta.role)
                                                                                    ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                                                                    : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                                                                }`}
                                                                            onClick={() => setSelectedIndikatorForModal(ind)}
                                                                        >
                                                                            {['admin', 'superadmin', 'auditor'].includes(meta.role) ? 'Verifikasi' : 'Respon'}
                                                                        </Button>
                                                                    </>
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

            {/* MODAL CAR */}
            {selectedIndikatorForModal && (
                <CarModal
                    isOpen={!!selectedIndikatorForModal}
                    onClose={() => setSelectedIndikatorForModal(null)}
                    indikator={selectedIndikatorForModal}
                    userRole={meta.role}
                />
            )}

            {/* MODAL PREVIEW FILE (Added to match Index.tsx capability) */}
            <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
                <DialogContent className="max-w-4xl w-full h-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            {previewFile?.file_name ? (
                                <>
                                    {getFileIcon(previewFile.file_name, "w-5 h-5")}
                                    <span className="truncate">{previewFile.file_name}</span>
                                </>
                            ) : (
                                "Detail Bukti"
                            )}
                        </DialogTitle>
                        <DialogDescription className="hidden">Preview File</DialogDescription>
                    </DialogHeader>

                    <div className="mt-2">
                        {previewFile && renderPreviewContent(previewFile)}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
