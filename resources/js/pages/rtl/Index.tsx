import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    LayoutDashboard, Calendar, Building2,
    CheckCircle2, FileText, Link as LinkIcon, ExternalLink, AlertCircle,
    FolderOpen, ChevronRight, Eye, Download,
    FileImage, FileSpreadsheet, FileVideo, FileMusic, File as FileIcon, X
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
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

interface CarItem {
    id: number;
    id_jadwal: number;
    id_indikator: number;
    status: string;
    temuan: string | null;
    akar_masalah: string | null;
    tindakan_koreksi: string | null;
    tanggal_pemenuhan: string | null;
    tahun_audit: string;
    link_bukti?: string | null;
    pami_data: {
        skor: string;
        uploads: Upload[];
    } | null;
}

interface Indikator {
    id_indikator: number;
    pernyataan_indikator: string;
    cars: CarItem[]; // ARRAY UNTUK STACKED ROW
}

interface Standar {
    id_standar: number;
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
        available_years: string[];
        selected_year: string;
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

export default function RtlIndex({ auth, data, meta }: Props) {
    // Kita simpan objek "Dummy Indikator" untuk modal, yang hanya berisi 1 CAR spesifik
    const [modalData, setModalData] = useState<any | null>(null);
    const [previewFile, setPreviewFile] = useState<Upload | null>(null);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Rencana Tindak Lanjut", href: "/rtl" },
    ];

    // --- HELPER: OPEN MODAL ---
    const openModalForCar = (ind: Indikator, car: CarItem) => {
        // Manipulasi data agar sesuai format yang diterima CarModal (Single Car)
        const singleCarData = {
            id_indikator: ind.id_indikator,
            pernyataan_indikator: ind.pernyataan_indikator,
            car: car, // Masukkan objek car spesifik ini
            pami: car.pami_data // Masukkan data pami tahun tersebut
        };
        setModalData(singleCarData);
    };

    // --- HELPER: RENDER PREVIEW CONTENT ---
    const renderPreviewContent = (file: Upload) => {
        const url = route('pami.download', file.id);
        if (!file.file_path && file.keterangan) {
            return (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <LinkIcon className="w-16 h-16 text-indigo-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Keterangan / Tautan</h3>
                    <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-y-auto max-h-[200px]">
                        <p className="text-sm text-gray-700 dark:text-gray-300 break-all whitespace-pre-line">{file.keterangan}</p>
                    </div>
                    {(file.keterangan.startsWith('http') || file.keterangan.startsWith('www')) && (
                        <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700" onClick={() => window.open(file.keterangan || '#', '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" /> Buka Tautan
                        </Button>
                    )}
                </div>
            )
        }
        const ext = file.file_name?.split('.').pop()?.toLowerCase() || '';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <img src={url} alt="Preview" className="max-w-full max-h-[70vh] object-contain mx-auto rounded-md shadow-sm" />;
        if (['pdf'].includes(ext)) return <iframe src={url} className="w-full h-[70vh] rounded-md border dark:border-gray-700" title="PDF Preview"></iframe>;
        if (['mp4', 'mov', 'avi'].includes(ext)) return <video controls src={url} className="w-full max-h-[70vh] rounded-md" />;
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                <FileSpreadsheet className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Preview tidak tersedia</h3>
                <Button onClick={() => window.open(url, '_blank')} variant="outline"><Download className="w-4 h-4 mr-2" /> Download File</Button>
            </div>
        );
    };

    const FileItem = ({ file }: { file: Upload }) => (
        <div className="group relative pl-3 border-l-2 border-indigo-500 bg-white dark:bg-gray-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 p-2 rounded-r-md transition-colors border border-gray-100 dark:border-gray-700 shadow-sm mb-2">
            <div className="flex justify-between items-start">
                <div className="overflow-hidden cursor-pointer w-full" onClick={() => setPreviewFile(file)}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{formatDate(file.created_at)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        {getFileIcon(file.file_name, "w-4 h-4 shrink-0 mt-0.5")}
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 truncate">{file.file_name || "Tanpa Nama"}</span>
                            {file.keterangan && <span className="text-[10px] text-gray-500 italic truncate flex items-center gap-1 mt-0.5"><LinkIcon size={8} /> {file.keterangan}</span>}
                        </div>
                    </div>
                </div>
                <button onClick={() => setPreviewFile(file)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye size={14} /></button>
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
            <div className="relative group min-w-[250px]">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-indigo-600 dark:text-indigo-400"><Building2 size={16} /></div>
                <select
                    className="appearance-none bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-8 py-2 font-semibold cursor-pointer transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                    value={meta.departemen_id || ''}
                    onChange={(e) => router.get(route('rtl.index'), { dept_id: e.target.value })}
                >
                    {meta.my_departments.map(d => <option key={`dept-${d.id}`} value={d.id}>{d.nama}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-700 dark:text-indigo-400"><ChevronRight size={16} className="rotate-90" /></div>
            </div>
        );
    };

    // --- FIX: YEAR SWITCHER SAFE RENDER ---
    const YearSwitcher = () => {
        // Jika available_years null/undefined, return null agar tidak error map()
        if (!meta.available_years || !Array.isArray(meta.available_years)) return null;

        // Jika hanya 1 tahun atau kosong, tidak perlu dropdown (opsional, tapi aman)
        if (meta.available_years.length === 0) return null;

        return (
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 dark:text-gray-400">
                    <Calendar size={14} />
                </div>
                <select
                    className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-24 pl-8 pr-6 py-1.5 font-semibold cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
                    value={meta.selected_year || ''}
                    onChange={(e) => router.get(route('rtl.index'), { tahun: e.target.value, dept_id: meta.departemen_id })}
                >
                    {meta.available_years.map(y => <option key={`year-${y}`} value={y}>{y}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500 dark:text-gray-400">
                    <ChevronRight size={12} className="rotate-90" />
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rencana Tindak Lanjut (RTL)" />

            <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">

                {/* HEADER */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 dark:from-indigo-400 dark:to-purple-400 flex items-center gap-2">
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
                        <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="space-y-1 min-w-[150px]">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Departemen Target</span>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-100"><DeptSwitcher /></div>
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
                                    data.map((standar, sIdx) => (
                                        <React.Fragment key={`std-group-${standar.id_standar || sIdx}`}>
                                            {standar.indikators.map((ind, iIdx) => (
                                                <tr key={`ind-row-${ind.id_indikator || iIdx}`} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors duration-200">

                                                    {/* KOLOM 1: STANDAR & INDIKATOR */}
                                                    <td className="p-5 align-top border-r border-gray-100 dark:border-gray-800">
                                                        {iIdx === 0 && (
                                                            <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-900/50">
                                                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase block mb-1">Standar</span>
                                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 whitespace-pre-line">{standar.pernyataan_standar}</p>
                                                            </div>
                                                        )}
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Indikator</span>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-line">{ind.pernyataan_indikator}</p>
                                                        {ind.cars.length > 1 && <Badge variant="destructive" className="mt-3 text-[10px] h-5">{ind.cars.length} Tunggakan</Badge>}
                                                    </td>

                                                    {/* KOLOM 2: TEMUAN (STACKED ROW) */}
                                                    <td className="p-0 align-top border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                                                        {ind.cars.map((car, cIdx) => (
                                                            <div key={`car-temuan-${car.id}`} className={`p-5 ${cIdx !== ind.cars.length - 1 ? 'border-b border-dashed border-gray-300 dark:border-gray-700' : ''}`}>
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Badge variant="outline" className="bg-white dark:bg-gray-900 border-gray-400 text-gray-700 font-bold text-[10px]">Tahun {car.tahun_audit}</Badge>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <div className="relative pl-3 border-l-2 border-red-500">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Temuan</span>
                                                                            <span className="text-[10px] text-red-500 font-mono bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded inline-block">Target: {formatDate(car.tanggal_pemenuhan)}</span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 italic mb-2">"{car.temuan}"</p>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <div className="bg-white dark:bg-gray-900 p-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                                                                            <span className="text-[9px] font-bold text-orange-500 uppercase block mb-1">Akar Masalah</span>
                                                                            <p className="text-xs text-gray-700 dark:text-gray-300">{car.akar_masalah || <span className="italic text-gray-400">Belum diisi</span>}</p>
                                                                        </div>
                                                                        <div className="bg-white dark:bg-gray-900 p-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                                                                            <span className="text-[9px] font-bold text-orange-500 uppercase block mb-1">Tindakan Koreksi</span>
                                                                            <p className="text-xs text-gray-700 dark:text-gray-300">{car.tindakan_koreksi || <span className="italic text-gray-400">Belum diisi</span>}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </td>

                                                    {/* KOLOM 3: BUKTI (STACKED ROW) */}
                                                    <td className="p-0 align-top border-r border-gray-100 dark:border-gray-800">
                                                        {ind.cars.map((car, cIdx) => (
                                                            <div key={`car-bukti-${car.id}`} className={`p-5 min-h-[250px] ${cIdx !== ind.cars.length - 1 ? 'border-b border-dashed border-gray-300 dark:border-gray-700' : ''}`}>
                                                                <div className="h-6 mb-3"></div> {/* Spacer */}
                                                                {car.pami_data?.uploads?.length > 0 ? (
                                                                    <div className="space-y-1">
                                                                        {car.pami_data.uploads.map((file, fIdx) => (
                                                                            <FileItem key={`file-rtl-${file.id || fIdx}`} file={file} />
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-lg">
                                                                        <FolderOpen size={20} className="text-gray-300 dark:text-gray-600" />
                                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Belum ada bukti</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </td>

                                                    {/* KOLOM 4: NILAI & AKSI (STACKED ROW) */}
                                                    <td className="p-0 align-top text-center w-[20%]">
                                                        {ind.cars.map((car, cIdx) => (
                                                            <div key={`car-aksi-${car.id}`} className={`p-5 flex flex-col gap-3 items-center min-h-[250px] ${cIdx !== ind.cars.length - 1 ? 'border-b border-dashed border-gray-300 dark:border-gray-700' : ''}`}>
                                                                <div className="h-6 mb-3"></div> {/* Spacer */}
                                                                <div className="w-full">
                                                                    <span className="text-[9px] text-gray-400 uppercase block mb-1">Nilai Audit</span>
                                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 text-[10px] w-full justify-center shadow-sm">
                                                                        {car.pami_data?.skor || '-'}
                                                                    </Badge>
                                                                </div>
                                                                <div className="w-full">
                                                                    <span className="text-[9px] text-gray-400 uppercase block mb-1">Status CAR</span>
                                                                    <Badge variant="outline" className={`text-[10px] w-full justify-center uppercase tracking-wide py-1 ${
                                                                        car.status === 'Open' ? 'border-red-200 text-red-600 bg-red-50 dark:bg-red-900/20' :
                                                                        car.status === 'Submitted' ? 'border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-900/20' :
                                                                        'border-green-200 text-green-600 bg-green-50 dark:bg-green-900/20'
                                                                    }`}>
                                                                        {car.status}
                                                                    </Badge>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className={`w-full text-xs gap-1 shadow-sm mt-1 text-white ${
                                                                        ['admin', 'superadmin', 'auditor'].includes(meta.role)
                                                                        ? "bg-indigo-600 hover:bg-indigo-700"
                                                                        : "bg-orange-600 hover:bg-orange-700"
                                                                    }`}
                                                                    onClick={() => openModalForCar(ind, car)}
                                                                >
                                                                    {['admin', 'superadmin', 'auditor'].includes(meta.role) ? <CheckCircle2 size={12} /> : <FileText size={12} />}
                                                                    {['admin', 'superadmin', 'auditor'].includes(meta.role) ? 'Verifikasi' : 'Respon'}
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* MODAL CAR */}
            {modalData && (
                <CarModal
                    isOpen={!!modalData}
                    onClose={() => setModalData(null)}
                    indikator={modalData}
                    userRole={meta.role}
                />
            )}

            {/* PREVIEW FILE MODAL */}
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

                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setPreviewFile(null)}>Tutup</Button>
                        {previewFile && previewFile.file_path && (
                            <Button onClick={() => window.open(route('pami.download', previewFile.id), '_blank')}>
                                <Download className="w-4 h-4 mr-2" /> Download Asli
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
