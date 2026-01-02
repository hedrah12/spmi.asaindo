import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import {
    FileText, UploadCloud, History, CheckCircle2,
    AlertCircle, ChevronRight, FolderOpen, LayoutDashboard,
    FileWarning, Trash2, Loader2, Download, Calendar,
    Eye, FileImage, FileSpreadsheet, FileVideo, FileMusic, File as FileIcon, X,
    Link as LinkIcon, Plus, ExternalLink
} from "lucide-react";

import CarModal from './CarModal';

// --- KONFIGURASI ---
const SCORE_OPTIONS = [
    "Melampaui Standar",
    "Sesuai Standar",
    "Ketidaksesuaian Observasi",
    "Ketidaksesuaian Minor",
    "Ketidaksesuaian Mayor"
];

const NEGATIVE_SCORES = [
    "Ketidaksesuaian Observasi",
    "Ketidaksesuaian Minor",
    "Ketidaksesuaian Mayor"
];

// --- TYPES ---
interface CarData {
    id: number;
    ketidaksesuaian: string;
    temuan: string | null;
    akar_masalah: string | null;
    tindakan_koreksi: string | null;
    tanggal_pemenuhan: string | null;
    status: string;
}

interface PamiUpload {
    id: number;
    file_path: string | null;
    file_name: string | null;
    keterangan: string | null;
    mime_type?: string;
    size?: number;
    created_at: string;
}

interface Pami {
    id: number;
    skor: string | null;
    uploads: PamiUpload[];
}

interface Indikator {
    id_indikator: number;
    pernyataan_indikator: string;
    pami: Pami | null;
    car: CarData | null;
}

interface Standar {
    id_standar: number;
    pernyataan_standar: string;
    kriteria: { kriteria: string };
    indikators: Indikator[];
}

interface Props {
    auth: any;
    pamiData: Standar[];
    meta: {
        role: string;
        is_auditor: boolean;
        is_auditee: boolean;
        id_jadwal: number;
        departemen_id: number;
        nama_departemen: string;
        has_schedule: boolean;
        debug_message: string | null;
        my_departments?: { id: number; nama: string; id_jadwal?: number }[];
        available_years: string[] | number[];
        selected_year: string | number;
    };
}

// --- HELPER ICON FILE (Dari File Manager) ---
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

export default function PamiIndex({ auth, pamiData, meta }: Props) {
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

    // --- STATES MODALS ---
    const [selectedCarIndikator, setSelectedCarIndikator] = useState<Indikator | null>(null);
    const [isCarModalOpen, setIsCarModalOpen] = useState(false);



    // 2. State Konfirmasi Nilai
    const [scoreConfirm, setScoreConfirm] = useState<{ score: string, id_indikator: number } | null>(null);

    // ➕ STATE AUTO CAR
    const [autoCarForm, setAutoCarForm] = useState({
        temuan: "",
        tanggal_pemenuhan: ""
    });

    // 3. State Preview File
    const [previewFile, setPreviewFile] = useState<PamiUpload | null>(null);

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Audit Mutu Internal", href: "/pami" },
    ];

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };


    // ➕ HANDLE PILIH SKOR
    const handleScoreClick = (score: string, indikator: Indikator) => {
        const isNegative = NEGATIVE_SCORES.includes(score);

        if (!isNegative) {
            setScoreConfirm({ score, id_indikator: indikator.id_indikator });
            executeScoring();
            return;
        }

        setAutoCarForm({
            temuan: indikator.car?.temuan || "",
            tanggal_pemenuhan: indikator.car?.tanggal_pemenuhan || ""
        });

        setScoreConfirm({
            score,
            id_indikator: indikator.id_indikator
        });
    };



    // B. Trigger Proses Nilai (Setelah Konfirmasi)
    const executeScoring = () => {
        if (!scoreConfirm) return;

        const { score, id_indikator } = scoreConfirm;
        const isNegative = NEGATIVE_SCORES.includes(score);

        if (isNegative) {
            if (!autoCarForm.temuan.trim())
                return alert("Uraian temuan wajib diisi");
            if (!autoCarForm.tanggal_pemenuhan)
                return alert("Target tanggal pemenuhan wajib diisi");
        }

        setProcessingId(id_indikator);

        const payload: any = {
            id_jadwal: meta.id_jadwal,
            id_indikator,
            skor: score
        };

        if (isNegative) {
            payload.temuan = autoCarForm.temuan;
            payload.tanggal_pemenuhan = autoCarForm.tanggal_pemenuhan;
        }

        router.post(route('pami.store'), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessingId(null);
                setScoreConfirm(null);
                setAutoCarForm({ temuan: "", tanggal_pemenuhan: "" });
            },
            onError: () => {
                setProcessingId(null);
                alert("Gagal menyimpan penilaian");
            }
        });
    };


    const handleDeleteFile = (fileId: number) => {
        if (!confirm("Hapus file bukti ini?")) return;
        setDeletingFileId(fileId);

        // PERBAIKAN: Ganti 'file.destroy' menjadi 'pami.file.delete'
        router.delete(route('pami.file.delete', fileId), {
            preserveScroll: true,
            onSuccess: () => setDeletingFileId(null),
            onError: () => {
                setDeletingFileId(null);
                alert("Gagal menghapus file");
            }
        });
    };

    // --- CAR LOGIC ---
    const openCarModal = (indikator: Indikator) => {
        setSelectedCarIndikator(indikator);
        setIsCarModalOpen(true);
    };

    // --- PREVIEW RENDERER (Diadaptasi dari File Manager) ---
    const renderPreviewContent = (file: PamiUpload) => {
        // A. Jika hanya Keterangan / Link (Tanpa File Fisik)
        if (!file.file_path) {
            return (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6">
                    <LinkIcon className="w-16 h-16 text-indigo-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">Ini adalah Keterangan / Tautan</h3>
                    <div className="mt-4 p-4 bg-gray-50 rounded border w-full max-w-lg overflow-y-auto max-h-[200px]">
                        <p className="text-sm text-gray-700 break-all whitespace-pre-line">{file.keterangan}</p>
                    </div>
                    {file.keterangan && (file.keterangan.startsWith('http') || file.keterangan.startsWith('www')) && (
                        <Button className="mt-6" onClick={() => window.open(file.keterangan || '#', '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" /> Buka Tautan
                        </Button>
                    )}
                </div>
            )
        }

        // B. Jika Ada File Fisik -> Gunakan Route pami.download
        // PENTING: Gunakan route() agar melewati Controller (fix error 403)
        const url = route('pami.download', file.id);

        const ext = file.file_name?.split('.').pop()?.toLowerCase() || '';

        // 1. Gambar
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))
            return <img src={url} alt={file.file_name || 'File'} className="max-w-full max-h-[70vh] object-contain mx-auto rounded-md shadow-sm" />;

        // 2. PDF
        if (['pdf'].includes(ext))
            return <iframe src={url} className="w-full h-[70vh] rounded-md border" title="PDF Preview"></iframe>;

        // 3. Video
        if (['mp4', 'mov', 'avi'].includes(ext))
            return <video controls src={url} className="w-full max-h-[70vh] rounded-md" />;

        // 4. Audio
        if (['mp3', 'wav'].includes(ext))
            return <audio controls src={url} className="w-full mt-10" />;

        // 5. File Lain (Word, Excel, dll) -> Tampilkan Tombol Download
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <FileSpreadsheet className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Preview tidak tersedia</h3>
                <p className="text-sm text-gray-500 mb-4">File ini tidak dapat ditampilkan langsung di browser.</p>
                <Button onClick={() => window.open(url, '_blank')}>
                    <Download className="w-4 h-4 mr-2" /> Download File
                </Button>
            </div>
        );
    };

    // --- COMPONENT: DROPDOWN & SWITCHERS ---
    const YearSwitcher = () => (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500">
                <Calendar size={14} />
            </div>
            <select
                className="appearance-none bg-white border border-gray-300 text-gray-700 text-xs rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-24 pl-8 pr-6 py-1.5 font-semibold cursor-pointer transition-all hover:bg-gray-50"
                value={meta.selected_year}
                onChange={(e) => {
                    router.get(route('pami.index'), {
                        tahun: e.target.value,
                        dept_id: meta.departemen_id
                    }, { preserveState: false });
                }}
            >
                {meta.available_years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
                <ChevronRight size={12} className="rotate-90" />
            </div>
        </div>
    );

    const DeptSwitcher = () => {
        if (!meta.my_departments || meta.my_departments.length <= 1) {
            return (
                <span className="text-lg font-bold text-gray-800 dark:text-white tracking-tight">
                    {meta.nama_departemen}
                </span>
            );
        }
        return (
            <div className="relative">
                <select
                    className="appearance-none bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-8 font-semibold cursor-pointer transition-all hover:bg-indigo-100"
                    value={meta.departemen_id || ''}
                    onChange={(e) => {
                        router.get(route('pami.index'), {
                            dept_id: e.target.value,
                            tahun: meta.selected_year
                        }, { preserveState: false });
                    }}
                >
                    {meta.my_departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.nama}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-700">
                    <ChevronRight size={16} className="rotate-90" />
                </div>
            </div>
        );
    };

    // --- COMPONENT: DOCUMENT ITEM ---
    // Digunakan oleh Auditee dan Auditor untuk menampilkan file
    // --- COMPONENT: DOCUMENT ITEM ---
    const FileItem = ({ file, canDelete }: { file: PamiUpload, canDelete: boolean }) => (
        <div className="group relative pl-3 border-l-2 border-indigo-500 bg-white hover:bg-indigo-50/50 p-2 rounded-r-md transition-colors border shadow-sm">
            <div className="flex justify-between items-start">
                <div className="overflow-hidden cursor-pointer w-full" onClick={() => setPreviewFile(file)}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] text-gray-400 font-mono">
                            {formatDate(file.created_at)}
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        {getFileIcon(file.file_name, "w-4 h-4 shrink-0 mt-0.5")}
                        <div className="flex flex-col overflow-hidden">
                            {file.file_name && (
                                <span className="text-xs font-semibold text-gray-700 hover:text-indigo-600 truncate transition-colors">
                                    {file.file_name}
                                </span>
                            )}
                            {file.keterangan && (
                                <span className="text-[10px] text-gray-500 italic truncate flex items-center gap-1 mt-0.5">
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
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Preview File"
                    >
                        <Eye size={14} />
                    </button>
                    {canDelete && (
                        <button
                            onClick={() => handleDeleteFile(file.id)}
                            disabled={deletingFileId === file.id}
                            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Hapus File"
                        >
                            {deletingFileId === file.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // --- RENDERER KHUSUS AUDITEE ---
    const RenderDokumenAuditee = ({ indikator }: { indikator: Indikator }) => {
        const uploads = indikator.pami?.uploads || [];
        const sortedUploads = [...uploads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // State Modal Upload
        const [isOpen, setIsOpen] = useState(false);

        // Form Upload menggunakan Inertia useForm
        const { data, setData, post, processing, reset, errors } = useForm({
            id_jadwal: meta.id_jadwal,
            id_indikator: indikator.id_indikator,
            bukti: null as File | null,
            keterangan: '',
        });

        const handleSubmitBukti = (e: React.FormEvent) => {
            e.preventDefault();
            // Validasi Sederhana
            if (!data.bukti && !data.keterangan) {
                return alert("Mohon isi File ATAU Keterangan/Link.");
            }

            post(route('pami.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
                preserveScroll: true,
                forceFormData: true,
            });
        };

        return (
            <div className="flex flex-col gap-3">
                {/* Tombol Buka Modal Upload */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full h-20 text-xs border-dashed border-indigo-300 text-indigo-600 bg-indigo-50 hover:bg-indigo-100">
                            <Plus size={14} className="mr-1" /> Upload Dokumen
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle>Upload Dokumen</DialogTitle>
                            <DialogDescription>
                                Upload dokumen atau masukkan tautan/keterangan singkat.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmitBukti} className="space-y-4 py-2">
                            {/* Input 1: File */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-700">1. Upload File (Opsional)</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative">
                                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                            <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                                            <p className="text-[10px] text-gray-500 text-center px-2">
                                                {data.bukti ? data.bukti.name : "Klik untuk upload (PDF, Doc, Img)"}
                                            </p>
                                        </div>
                                        {/* Tombol Reset File */}
                                        {data.bukti && (
                                            <div className="absolute top-1 right-1 bg-red-100 rounded-full p-1 hover:bg-red-200 z-10" onClick={(e) => { e.preventDefault(); setData('bukti', null); }}>
                                                <X size={12} className="text-red-600" />
                                            </div>
                                        )}
                                        <input type="file" className="hidden"
                                            onChange={(e) => setData('bukti', e.target.files ? e.target.files[0] : null)}
                                        />
                                    </label>
                                </div>
                                {errors.bukti && <span className="text-[10px] text-red-500">{errors.bukti}</span>}
                            </div>

                            <div className="relative flex items-center py-1">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-2 text-[10px] text-gray-400 uppercase font-bold">Dan / Atau</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            {/* Input 2: Text */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-700">2. Tautan / Keterangan (Opsional)</Label>
                                <Textarea
                                    placeholder="Contoh: Link GDrive, atau catatan ..."
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    className="text-sm min-h-[80px]"
                                />
                                {errors.keterangan && <span className="text-[10px] text-red-500">{errors.keterangan}</span>}
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={processing} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                    {processing ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                                    Simpan Bukti
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* List File yang sudah diupload */}
                {sortedUploads.length > 0 && (
                    <div className="space-y-2">
                        <Badge variant="outline" className="w-fit text-[10px] bg-green-50 text-green-700 border-green-200 mb-1">TERBARU</Badge>
                        <FileItem file={sortedUploads[0]} canDelete={true} />

                        {/* History */}
                        {sortedUploads.length > 1 && (
                            <details className="group/history text-xs mt-1">
                                <summary className="flex items-center gap-1.5 text-gray-500 cursor-pointer hover:text-indigo-600 transition-colors list-none select-none font-medium">
                                    <History size={12} />
                                    <span>Riwayat ({sortedUploads.length - 1})</span>
                                    <ChevronRight size={12} className="group-open/history:rotate-90 transition-transform" />
                                </summary>
                                <div className="mt-2 pl-2 space-y-2 border-l border-dashed border-gray-300 ml-1.5">
                                    {sortedUploads.slice(1).map(file => (
                                        <FileItem key={file.id} file={file} canDelete={true} />
                                    ))}
                                </div>
                            </details>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // --- RENDERER KHUSUS AUDITOR ---
    const RenderDokumenAuditor = ({ indikator }: { indikator: Indikator }) => {
        const uploads = indikator.pami?.uploads || [];
        const sortedUploads = [...uploads].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (sortedUploads.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50/50 text-gray-400">
                    <FileText size={20} className="mb-2 opacity-50" />
                    <span className="text-[10px] text-center font-medium">
                        Belum ada bukti pemenuhan
                    </span>
                    <span className="text-[10px] text-gray-400">
                        Wajib diisi sebelum dinilai
                    </span>

                </div>
            );
        }

        return (
            <div className="flex flex-col gap-3">
                {/* FILE TERBARU */}
                <div>
                    <Badge
                        variant="outline"
                        className="w-fit text-[10px] bg-blue-50 text-blue-700 border-blue-200 mb-1"
                    >
                        TERBARU
                    </Badge>
                    <FileItem file={sortedUploads[0]} canDelete={false} />
                </div>

                {/* RIWAYAT */}
                {sortedUploads.length > 1 && (
                    <details className="group/history text-xs">
                        <summary className="flex items-center gap-1.5 text-gray-500 cursor-pointer hover:text-indigo-600 transition-colors list-none select-none font-medium">
                            <History size={12} />
                            <span>Riwayat ({sortedUploads.length - 1})</span>
                            <ChevronRight
                                size={12}
                                className="group-open/history:rotate-90 transition-transform"
                            />
                        </summary>

                        <div className="mt-2 pl-2 space-y-2 border-l border-dashed border-gray-300 ml-1.5">
                            {sortedUploads.slice(1).map(file => (
                                <FileItem
                                    key={file.id}
                                    file={file}
                                    canDelete={false}
                                />
                            ))}
                        </div>
                    </details>
                )}
            </div>
        );
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Mutu Internal" />

            {/* --- CAR MODAL --- */}
            <CarModal
                isOpen={isCarModalOpen}
                onClose={() => setIsCarModalOpen(false)}
                indikator={selectedCarIndikator}
                userRole={meta.is_auditor ? 'auditor' : 'auditee'}
            />


            {/* --- KONFIRMASI NILAI MODAL --- */}
            <Dialog open={!!scoreConfirm} onOpenChange={(open) => !open && setScoreConfirm(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="text-indigo-600" />
                            Konfirmasi Penilaian
                        </DialogTitle>
                        <DialogDescription>
                            Anda akan memberikan nilai:
                            <span className="font-bold"> {scoreConfirm?.score}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {scoreConfirm && NEGATIVE_SCORES.includes(scoreConfirm.score) && (
                        <div className="space-y-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="text-sm font-semibold text-red-700 flex gap-2 items-center">
                                <AlertCircle size={16} />
                                Wajib isi data CAR
                            </div>

                            <div>
                                <Label className="text-xs">Uraian Temuan *</Label>
                                <Textarea
                                    value={autoCarForm.temuan}
                                    onChange={(e) =>
                                        setAutoCarForm({ ...autoCarForm, temuan: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <Label className="text-xs">Target Tanggal Pemenuhan *</Label>
                                <Input
                                    type="date"
                                    value={autoCarForm.tanggal_pemenuhan}
                                    onChange={(e) =>
                                        setAutoCarForm({ ...autoCarForm, tanggal_pemenuhan: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setScoreConfirm(null)}>
                            Batal
                        </Button>
                        <Button onClick={executeScoring} disabled={!!processingId}>
                            {processingId && <Loader2 className="animate-spin mr-2" />}
                            Simpan Penilaian
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* --- PREVIEW FILE MODAL --- */}
            <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
                <DialogContent className="max-w-4xl w-full h-auto max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white">
                    <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 bg-white">
                        <DialogTitle className="truncate pr-8 text-base flex items-center gap-2">
                            {previewFile && getFileIcon(previewFile.file_name)}
                            {previewFile?.file_name}
                        </DialogTitle>
                        <button onClick={() => setPreviewFile(null)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-900">
                            <X className="w-5 h-5" />
                        </button>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center min-h-[300px]">
                        {previewFile && renderPreviewContent(previewFile)}
                    </div>

                    <DialogFooter className="p-4 border-t bg-white">
                        <Button variant="secondary" onClick={() => setPreviewFile(null)}>Tutup</Button>
                        {previewFile && (
                            <Button onClick={() => window.open(route('pami.download', previewFile.id), '_blank')}>
                                <Download className="w-4 h-4 mr-2" /> Download Asli
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MAIN UI --- */}
            <div className="p-4 md:p-8 bg-gray-50 min-h-screen dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">

                {/* HEADER */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Audit Mutu Internal
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <LayoutDashboard size={16} />
                            <span>Panel Akses:</span>
                            <Badge variant={meta.role === 'auditor' ? 'default' : (meta.role === 'auditee' ? 'secondary' : 'destructive')} className="uppercase">
                                {meta.role}
                            </Badge>
                        </div>
                    </div>

                    <Card className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-indigo-100 dark:border-gray-700 shadow-sm">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Tahun Audit</span>
                            <YearSwitcher />
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="space-y-1 min-w-[150px]">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Departemen Target</span>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                <DeptSwitcher />
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status Jadwal</span>
                            <div className="flex items-center gap-2 text-xs">
                                {meta.has_schedule ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 px-2 py-0.5"><CheckCircle2 size={12} className="fill-green-500 text-white" /> Aktif</Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 px-2 py-0.5"><AlertCircle size={12} className="fill-red-500 text-white" /> N/A</Badge>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {!meta.has_schedule && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-800 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-bold text-sm">Perhatian</h3>
                            <p className="text-sm opacity-90">{meta.debug_message || "Data Penugasan Tidak Ditemukan."}</p>
                        </div>
                    </div>
                )}

                <Card className="overflow-hidden shadow-xl border-0 ring-1 ring-gray-200 dark:ring-gray-800 bg-white dark:bg-gray-900 rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm">
                                    <th className="p-5 text-left font-semibold w-[32%] rounded-tl-xl">Standar / Kriteria</th>
                                    <th className="p-5 text-left font-semibold w-[35%]">Indikator</th>
                                    <th className="p-5 text-center font-semibold w-[15%]">Dokumen</th>
                                    <th className="p-5 text-center font-semibold w-[18%] rounded-tr-xl">
                                        <div className="flex flex-col items-center">
                                            <span>{meta.is_auditor ? 'Penilaian' : 'Hasil Audit'}</span>
                                            <span className="text-[10px] opacity-80">
                                                Status & Tindak Lanjut
                                            </span>
                                        </div>
                                    </th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                {pamiData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FolderOpen size={48} className="mb-3 opacity-20" />
                                                <p className="font-medium">Tidak ada data audit untuk tahun {meta.selected_year}.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pamiData.map((standar) => (
                                        <React.Fragment key={standar.id_standar}>
                                            {standar.indikators.map((indikator: any, idx: number) => {
                                                const currentScore = indikator.pami?.skor;
                                                const isNegative = currentScore && NEGATIVE_SCORES.includes(currentScore);
                                                const hasCar = !!indikator.car;

                                                return (
                                                    <tr
                                                        key={indikator.id_indikator}
                                                        className={`group transition-colors duration-200
        ${isNegative
                                                                ? 'border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-900/10'
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                                                            }
    `}
                                                    >

                                                        {idx === 0 && (
                                                            <td className="p-5 align-top bg-gray-50/60 dark:bg-gray-800/40 border-r border-gray-100 dark:border-gray-800" rowSpan={standar.indikators.length}>
                                                                <div className="sticky top-4">
                                                                    <div className="font-bold text-gray-800 dark:text-gray-100 mb-2 leading-tight ">{standar.kriteria?.kriteria}</div>
                                                                    <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 shadow-sm whitespace-pre-line">
                                                                        {standar.pernyataan_standar}
                                                                    </div>

                                                                </div>
                                                            </td>
                                                        )}
                                                        <td className="p-5 align-top text-gray-700 dark:text-gray-300 leading-relaxed border-r border-gray-100 dark:border-gray-800 whitespace-pre-line">{indikator.pernyataan_indikator}</td>
                                                        <td className="p-5 align-top bg-gray-50/20 dark:bg-gray-800/40">
                                                            {meta.is_auditee
                                                                ? <RenderDokumenAuditee indikator={indikator} />
                                                                : <RenderDokumenAuditor indikator={indikator} />
                                                            }
                                                        </td>
                                                        <td className="p-5 align-top text-center">
                                                            <div className="flex flex-col gap-3">

                                                                {/* STATUS PENILAIAN */}
                                                                <div
                                                                    className={`rounded-lg border p-3 text-left transition
        ${isNegative
                                                                            ? 'border-l-4 border-l-red-500 bg-red-50/40'
                                                                            : 'bg-gray-50'
                                                                        }
    `}
                                                                >
                                                                    {/* LABEL */}
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <p className="text-[11px] font-medium text-gray-500">
                                                                            Status Audit
                                                                        </p>

                                                                        {isNegative && (
                                                                            <span className="text-[10px] font-medium text-red-600">
                                                                                Perlu Tindak Lanjut
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* SELECT / BADGE */}
                                                                    {meta.is_auditor ? (
                                                                        <div className="relative">
                                                                            <select
                                                                                className={`appearance-none w-full rounded-md border px-3 py-2 pr-9 text-xs font-medium
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                    transition
                    ${isNegative
                                                                                        ? 'bg-red-50 border-red-300 text-red-700'
                                                                                        : 'bg-white border-gray-300 text-gray-700'
                                                                                    }
                `}
                                                                                value={currentScore || ''}
                                                                                onChange={(e) =>
                                                                                    handleScoreClick(e.target.value, indikator)
                                                                                }
                                                                            >
                                                                                <option value="">Masukkan Nilai</option>
                                                                                {SCORE_OPTIONS.map((opt) => (
                                                                                    <option key={opt} value={opt}>
                                                                                        {opt}
                                                                                    </option>
                                                                                ))}
                                                                            </select>

                                                                            {/* ICON DROPDOWN */}
                                                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                                                                <svg
                                                                                    className="h-4 w-4"
                                                                                    viewBox="0 0 20 20"
                                                                                    fill="currentColor"
                                                                                >
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                                                                                        clipRule="evenodd"
                                                                                    />
                                                                                </svg>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        currentScore ? (
                                                                            <Badge
                                                                                variant={isNegative ? "destructive" : "secondary"}
                                                                                className="text-xs px-3 py-1"
                                                                            >
                                                                                {currentScore}
                                                                            </Badge>
                                                                        ) : (
                                                                            <span className="text-xs text-gray-400">
                                                                                Belum Dinilai
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>


                                                                {/* ✅ TOMBOL CAR (PAKAI DIV, BUKAN TD) */}
                                                                {indikator.car && (
                                                                    <div className="mt-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => openCarModal(indikator)}
                                                                            className={`w-full text-xs gap-1
        ${indikator.car.status === 'Close'
                                                                                    ? 'border-green-600 text-green-600 hover:bg-green-50'
                                                                                    : 'border-red-500 text-red-600 hover:bg-red-50'
                                                                                }
    `}
                                                                        >

                                                                            {indikator.car.status === 'Close'
                                                                                ? <CheckCircle2 size={12} />
                                                                                : <AlertCircle size={12} />
                                                                            }
                                                                            {meta.is_auditor
                                                                                ? (indikator.car.status === 'Close' ? "CAR Verified" : "Verifikasi CAR")
                                                                                : (indikator.car.status === 'Close' ? "Selesai" : "Lihat / Edit CAR")
                                                                            }
                                                                        </Button>
                                                                    </div>
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
        </AppLayout>
    );
}
