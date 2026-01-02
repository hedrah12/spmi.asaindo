import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    AlertCircle,
    CheckCircle2,
    Link as LinkIcon,
    Loader2,
    FileText,
    Download,
    History,
    Calendar,
    UserCircle,
    Paperclip,
    Clock,
    ShieldCheck,
    Award,
    X
} from "lucide-react";

// Opsi Nilai (Samakan dengan Index.tsx)
const SCORE_OPTIONS = [
    "Melampaui Standar",
    "Sesuai Standar",
    "Ketidaksesuaian Observasi",
    "Ketidaksesuaian Minor",
    "Ketidaksesuaian Mayor"
];

export default function CarModal({ isOpen, onClose, indikator, userRole }) {
    if (!indikator?.car) return null;

    const car = indikator.car;
    const uploads = indikator.pami?.uploads?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || [];

    const isAuditor = ['auditor', 'superadmin', 'admin'].includes(userRole);
    const isAuditee = !isAuditor;

    const { data, setData, post, processing, reset } = useForm({
        car_id: car.id,
        akar_masalah: car.akar_masalah || '',
        tindakan_koreksi: car.tindakan_koreksi || '',
        link_bukti: car.link_bukti || '',
        file_bukti: null,
    });

    // --- UPDATE 1: Tambahkan 'skor' ke form verifikasi ---
    const formVerify = useForm({
        car_id: car.id,
        status: car.status || 'Open',
        skor: indikator.pami?.skor || ''
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            formVerify.setData({
                car_id: car.id,
                status: car.status,
                skor: indikator.pami?.skor || ''
            });
        }
    }, [isOpen, car, indikator]);

    const submitAuditee = (e) => {
        e.preventDefault();
        post(route('pami.car.respond'), {
            onSuccess: () => onClose(),
            forceFormData: true,
        });
    };

    const submitAuditor = (e) => {
        e.preventDefault();
        formVerify.post(route('pami.car.verify'), {
            onSuccess: () => onClose(),
        });
    };

    const renderTimelineItem = (file, index) => {
        const isLast = index === uploads.length - 1;
        return (
            <div key={file.id} className="relative pl-8 pb-8 group">
                {!isLast && (
                    <div className="absolute left-[11px] top-3 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors" />
                )}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-500 flex items-center justify-center z-10 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                </div>
                <div className="flex flex-col gap-2 -mt-1">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                <UserCircle size={12} className="text-gray-500 dark:text-gray-400" />
                                {file.uploaded_by_role === 'auditee' ? 'Auditee / User' : 'Auditor / Admin'}
                            </span>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(file.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 overflow-hidden">
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-lg shrink-0">
                                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <a href={route('pami.download', file.id)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate transition-colors">
                                        {file.file_name || "Lampiran Dokumen"}
                                    </a>
                                    {file.keterangan ?
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 italic">"{file.keterangan}"</p> :
                                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Tidak ada keterangan</p>
                                    }
                                </div>
                            </div>
                            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 text-gray-400 dark:text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300 dark:border-gray-700" onClick={() => window.open(route('pami.download', { id: file.id, dl: 1 }), '_blank')} title="Download File">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden flex flex-col h-[90vh] bg-gray-50/50 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800">

                {/* HEADER */}
                <DialogHeader className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl shadow-inner ${car.status === 'Close' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                                {car.status === 'Close'
                                    ? <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                                    : <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-500" />
                                }
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">Tindak Lanjut CAR</DialogTitle>
                                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                    <span className="font-mono text-gray-400 dark:text-gray-500">#{car.id}</span>
                                    <Badge variant={car.status === 'Close' ? 'outline' : 'destructive'} className={`text-[10px] px-2 h-5 ${car.status === 'Close' ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400' : ''}`}>
                                        {car.status}
                                    </Badge>
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-1">Skor Saat Ini</span>
                            <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800">
                                {indikator.pami?.skor || '-'}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950/50">
                    <div className="p-6 space-y-6">

                        {/* Detail Temuan */}
                        <section className="bg-white dark:bg-gray-900 rounded-xl border border-rose-100 dark:border-rose-900/30 shadow-sm overflow-hidden">
                            <div className="bg-rose-50/50 dark:bg-rose-900/10 px-5 py-3 border-b border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-400 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Uraian Ketidaksesuaian
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-rose-100 dark:border-rose-900/50 shadow-sm">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Target: <b>{car.tanggal_pemenuhan || '-'}</b></span>
                                </div>
                            </div>
                            <div className="p-5">
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{car.temuan}</p>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Riwayat */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md"><History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Riwayat Respon</h3>
                                    <Badge variant="secondary" className="ml-auto text-xs dark:bg-gray-800 dark:text-gray-300">{uploads.length}</Badge>
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 min-h-[300px]">
                                    {uploads.length > 0 ? <div className="mt-2 pl-1">{uploads.map(renderTimelineItem)}</div> :
                                        <div className="flex flex-col items-center justify-center h-full py-10 text-center space-y-3">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center"><Paperclip className="w-8 h-8 text-gray-300 dark:text-gray-600" /></div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-400">Belum ada dokumen</p>
                                        </div>}
                                </div>
                            </section>

                            {/* Form Kanan */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md"><ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{isAuditor ? 'Verifikasi Auditor' : 'Formulir Tindak Lanjut'}</h3>
                                </div>

                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
                                    <form onSubmit={isAuditee ? submitAuditee : submitAuditor} className="space-y-5">

                                        {/* Field untuk Auditee & Auditor */}
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Analisis Akar Masalah</Label>
                                                <Textarea
                                                    value={data.akar_masalah}
                                                    onChange={e => setData('akar_masalah', e.target.value)}
                                                    disabled={isAuditor || car.status === 'Close'}
                                                    placeholder="Mengapa ketidaksesuaian ini terjadi?"
                                                    className="resize-none min-h-[80px] text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-900"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tindakan Koreksi</Label>
                                                <Textarea
                                                    value={data.tindakan_koreksi}
                                                    onChange={e => setData('tindakan_koreksi', e.target.value)}
                                                    disabled={isAuditor || car.status === 'Close'}
                                                    placeholder="Apa yang dilakukan untuk memperbaiki?"
                                                    className="resize-none min-h-[80px] text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-900"
                                                />
                                            </div>
                                        </div>

                                        {/* --- AUDITEE INPUT --- */}
                                        {(!isAuditor && car.status !== 'Close') && (
                                            <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Link Referensi</Label>
                                                    <Input
                                                        value={data.link_bukti}
                                                        onChange={e => setData('link_bukti', e.target.value)}
                                                        placeholder="Link..."
                                                        className="h-9 text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Upload Bukti</Label>
                                                    <Input
                                                        type="file"
                                                        onChange={e => setData('file_bukti', e.target.files[0])}
                                                        className="bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* --- INPUT AUDITOR (STATUS & SKOR) --- */}
                                        {isAuditor && (
                                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30 mt-2 space-y-4">

                                                {/* Pilihan Status */}
                                                <div>
                                                    <Label className="text-indigo-900 dark:text-indigo-300 font-bold mb-2 block text-xs uppercase">Keputusan Verifikasi</Label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {['Open', 'Close'].map((statusOption) => (
                                                            <label key={statusOption} className={`
                                                                cursor-pointer rounded-lg border px-4 py-3 flex items-center justify-center gap-2 transition-all relative
                                                                ${formVerify.data.status === statusOption
                                                                    ? (statusOption === 'Close' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-rose-600 border-rose-600 text-white')
                                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}
                                                            `}>
                                                                <input type="radio" name="status" value={statusOption} checked={formVerify.data.status === statusOption} onChange={e => formVerify.setData('status', e.target.value)} className="hidden" />
                                                                {statusOption === 'Close' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                                <span className="font-semibold text-sm">{statusOption}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Input Skor Baru */}
                                                <div>
                                                    <Label className="text-indigo-900 dark:text-indigo-300 font-bold mb-2 flex items-center gap-2 text-xs uppercase">
                                                        <Award className="w-3 h-3 text-orange-500" /> Update Nilai / Skor Akhir
                                                    </Label>
                                                    <select
                                                        value={formVerify.data.skor}
                                                        onChange={e => formVerify.setData('skor', e.target.value)}
                                                        className="w-full text-sm border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2"
                                                    >
                                                        <option value="" disabled>-- Pilih Skor --</option>
                                                        {SCORE_OPTIONS.map((score) => (
                                                            <option key={score} value={score}>{score}</option>
                                                        ))}
                                                    </select>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 italic">
                                                        Ubah nilai jika hasil perbaikan sudah memenuhi standar.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            {isAuditee && car.status !== 'Close' && (
                                                <Button type="submit" disabled={processing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                                    {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Kirim Respon"}
                                                </Button>
                                            )}
                                            {isAuditor && (
                                                <Button type="submit" disabled={formVerify.processing} className="w-full bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-500 text-white shadow-sm">
                                                    {formVerify.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Verifikasi & Skor"}
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center w-full">
                    <div className="text-xs text-gray-400 dark:text-gray-500 italic">*Pastikan data tersimpan sebelum menutup</div>
                    <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300">Tutup</Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
