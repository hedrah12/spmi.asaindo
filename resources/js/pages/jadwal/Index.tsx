import React, { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card"; // Gunakan Card untuk konsistensi
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
    Trash2, Edit, Save, RotateCcw, Plus, Calendar, CheckCircle2, Eye, X,
    FileText, User as UserIcon, Search, LayoutDashboard, Layers
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Helper format tanggal Indonesia
const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric", month: "short", year: "numeric"
    });
};

export default function JadwalIndex({ data, masterData, filters }) {
    // --- STATE UTAMA ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // --- STATE MODAL DETAIL ---
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailItem, setDetailItem] = useState(null);

    // --- STATE FORM HEADER ---
    const [header, setHeader] = useState({
        tahun: new Date().getFullYear().toString(),
        no_sk: "",
        tgl_mulai: "",
        tgl_selesai: "",
    });

    // --- STATE FORM DETAIL (BUFFER) ---
    const [details, setDetails] = useState([]);
    const [tempDetail, setTempDetail] = useState({ user_id: "", id_departemen: "" });

    // Generate Tahun 2025-2030
    const yearList = Array.from({ length: 6 }, (_, i) => (2025 + i).toString());

    // --- FILTER DATA TABEL ---
    const filteredData = useMemo(() => {
        return data.filter(item => item.tahun.toString() === header.tahun);
    }, [data, header.tahun]);

    // --- LOGIC FORM ---
    const resetForm = () => {
        setHeader(prev => ({
            ...prev,
            no_sk: "", tgl_mulai: "", tgl_selesai: "",
        }));
        setDetails([]);
        setTempDetail({ user_id: "", id_departemen: "" });
        setIsEditMode(false);
        setSelectedId(null);
    };

    const addDetailToBuffer = () => {
        if (!tempDetail.user_id || !tempDetail.id_departemen) {
            return toast.error("Pilih Auditor dan Departemen terlebih dahulu");
        }
        const exists = details.some(d => d.user_id === tempDetail.user_id && d.id_departemen === tempDetail.id_departemen);
        if (exists) return toast.error("Mapping ini sudah ada di list");

        const user = masterData.users.find(u => String(u.id) === tempDetail.user_id);
        const dept = masterData.departemens.find(d => String(d.id_departemen) === tempDetail.id_departemen);

        setDetails([...details, {
            user_id: tempDetail.user_id,
            id_departemen: tempDetail.id_departemen,
            user_name: user?.name,
            dept_name: dept?.nama_departemen
        }]);
        setTempDetail({ user_id: "", id_departemen: "" });
    };

    const removeDetailRow = (index) => {
        const list = [...details];
        list.splice(index, 1);
        setDetails(list);
    };

    const handleEdit = (item) => {
        setIsEditMode(true);
        setSelectedId(item.id_jadwal);
        setHeader({
            tahun: item.tahun,
            no_sk: item.no_sk || "",
            tgl_mulai: item.tgl_mulai,
            tgl_selesai: item.tgl_selesai,
        });

        if (item.details && item.details.length > 0) {
            const mappedDetails = item.details.map(d => ({
                user_id: String(d.user_id),
                id_departemen: String(d.id_departemen),
                user_name: d.auditor?.name,
                dept_name: d.departemen?.nama_departemen
            }));
            setDetails(mappedDetails);
        } else {
            setDetails([]);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (details.length === 0) return toast.error("Minimal masukan 1 tim audit!");

        const payload = { ...header, details };
        const options = {
            onSuccess: () => {
                toast.success(isEditMode ? "Berhasil diperbarui" : "Berhasil disimpan");
                resetForm();
            },
            onError: () => toast.error("Gagal menyimpan data"),
            preserveScroll: true
        };

        if (isEditMode && selectedId) {
            router.put(route('jadwal.update', selectedId), payload, options);
        } else {
            router.post(route('jadwal.store'), payload, options);
        }
    };

    const handleDelete = (id) => {
        if (confirm("Hapus jadwal ini?")) {
            router.delete(route('jadwal.destroy', id), { onSuccess: () => toast.success("Terhapus") });
        }
    };

    const openDetailModal = (item) => {
        setDetailItem(item);
        setIsDetailOpen(true);
    };

    // Fungsi Render Hierarki (Styled)
    const renderHierarchyForDept = (deptId) => {
        const { lingkups = [], kriterias = [], standars = [] } = masterData;
        const deptStandars = standars.filter(s => String(s.id_departemen) === String(deptId));

        if (deptStandars.length === 0) {
            return <p className="text-sm text-slate-400 italic py-2">Tidak ada standar audit untuk departemen ini.</p>;
        }

        return lingkups.map(lingkup => {
            const relatedKriterias = kriterias.filter(k => String(k.id_lingkup) === String(lingkup.id_lingkup));
            const validKriterias = relatedKriterias.map(kriteria => {
                const myStandars = deptStandars.filter(s => String(s.id_kriteria) === String(kriteria.id_kriteria));
                if (myStandars.length === 0) return null;

                return (
                    <div key={kriteria.id_kriteria} className="ml-3 mt-2 mb-3 border-l-2 border-indigo-200 pl-3">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{kriteria.kriteria}</span>
                        </div>
                        <div className="space-y-2 mt-1">
                            {myStandars.map(st => (
                                <div key={st.id_standar} className="bg-white dark:bg-gray-800 p-2 rounded border border-slate-100 dark:border-gray-700 text-sm shadow-sm">
                                    <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">{st.pernyataan_standar}</div>
                                    {st.indikators && st.indikators.length > 0 && (
                                        <div className="mt-1 pt-1 border-t border-slate-50 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/50 p-1 rounded">
                                            <ul className="list-disc list-inside text-[14px] text-slate-500 dark:text-slate-400">
                                                {st.indikators.map(ind => (
                                                    <li key={ind.id_indikator}>{ind.pernyataan_indikator}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }).filter(Boolean);

            if (validKriterias.length === 0) return null;

            return (
                <div key={lingkup.id_lingkup} className="mb-3">
                    <h5 className="text-xs font-bold uppercase text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 p-1 rounded mb-1 flex items-center gap-2">
                        <Layers className="w-3 h-3" /> {lingkup.nama_lingkup}
                    </h5>
                    {validKriterias}
                </div>
            );
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Penjadwalan Audit", href: "/jadwal" }]}>
            <Head title="Jadwal Audit" />

            {/* --- CONTAINER BACKGROUND (STYLE PAMI) --- */}
            <div className="p-4 md:p-8 bg-gray-50 min-h-screen dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Penjadwalan Audit
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <LayoutDashboard size={16} />
                            <span>Manajemen Jadwal & Penugasan Auditor</span>
                        </div>
                    </div>

                    {/* CONTROL CARD (GLASSMORPHISM) */}
                    <Card className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-indigo-100 dark:border-gray-700 shadow-sm w-full xl:w-auto">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tahun:</span>
                            <Select value={header.tahun} onValueChange={(val) => setHeader({ ...header, tahun: val })}>
                                <SelectTrigger className="w-[100px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearList.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* --- 1. FORM INPUT (KIRI) --- */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="p-5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-sm rounded-xl">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-gray-700 pb-2">
                                {isEditMode ? <Edit className="w-4 h-4 text-orange-500" /> : <Plus className="w-4 h-4 text-indigo-500" />}
                                {isEditMode ? "Edit Jadwal" : "Buat Jadwal Baru"}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label className="text-slate-600 dark:text-slate-400">No. SK</Label>
                                    <Input
                                        value={header.no_sk}
                                        onChange={e => setHeader({ ...header, no_sk: e.target.value })}
                                        placeholder="Contoh: 001/SK/2025"
                                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-slate-600 dark:text-slate-400">Tgl Mulai</Label>
                                        <div className="relative">
                                            <DatePicker
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="dd/mm/yyyy"
                                                selected={header.tgl_mulai ? new Date(header.tgl_mulai) : null}
                                                onChange={(date) => setHeader({ ...header, tgl_mulai: date ? date.toISOString().split("T")[0] : "" })}
                                                className="w-full rounded-md border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-slate-600 dark:text-slate-400">Tgl Selesai</Label>
                                        <div className="relative">
                                            <DatePicker
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="dd/mm/yyyy"
                                                selected={header.tgl_selesai ? new Date(header.tgl_selesai) : null}
                                                onChange={(date) => setHeader({ ...header, tgl_selesai: date ? date.toISOString().split("T")[0] : "" })}
                                                className="w-full rounded-md border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Tambah Detail (Mapping) */}
                                <div className="bg-slate-50 dark:bg-gray-900/50 p-3 rounded-lg border border-slate-200 dark:border-gray-700 space-y-3">
                                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <UserIcon size={12} /> Tambah Tim Audit
                                    </Label>

                                    <Select value={tempDetail.id_departemen} onValueChange={(v) => setTempDetail({ ...tempDetail, id_departemen: v })}>
                                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"><SelectValue placeholder="Pilih Departemen" /></SelectTrigger>
                                        <SelectContent>
                                            {masterData.departemens.map(d => <SelectItem key={d.id_departemen} value={String(d.id_departemen)}>{d.nama_departemen}</SelectItem>)}
                                        </SelectContent>
                                    </Select>

                                    <Select value={tempDetail.user_id} onValueChange={(v) => setTempDetail({ ...tempDetail, user_id: v })}>
                                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"><SelectValue placeholder="Pilih Auditor" /></SelectTrigger>
                                        <SelectContent>
                                            {masterData.users.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>


                                    <Button type="button" onClick={addDetailToBuffer} variant="secondary" size="sm" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/40">
                                        <Plus className="w-4 h-4 mr-2" /> Tambah ke List
                                    </Button>
                                </div>

                                {/* List Buffer */}
                                {details.length > 0 && (
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                        {details.map((d, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2.5 text-xs border border-slate-100 dark:border-gray-700 rounded shadow-sm">
                                                <div>
                                                    <div className="font-bold text-slate-700 dark:text-slate-200">{d.dept_name}</div>
                                                    <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <UserIcon size={10} /> {d.user_name}
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeDetailRow(idx)} className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-gray-700">
                                    {isEditMode && (
                                        <Button type="button" variant="outline" onClick={resetForm} className="flex-1 dark:bg-gray-800 dark:text-white dark:border-gray-600">
                                            <RotateCcw className="w-4 h-4 mr-2" /> Batal
                                        </Button>
                                    )}
                                    <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                                        <Save className="w-4 h-4 mr-2" /> {isEditMode ? "Update" : "Simpan"}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* --- 2. TABEL DATA (KANAN) --- */}
                    <div className="lg:col-span-2">
                        {/* Table Card Style Pami */}
                        <Card className="overflow-hidden shadow-xl border-0 ring-1 ring-gray-200 dark:ring-gray-800 bg-white dark:bg-gray-900 rounded-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        {/* Gradient Header */}
                                        <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm">
                                            <th className="p-5 font-semibold">Info Jadwal</th>
                                            <th className="p-5 font-semibold">Tim Audit</th>
                                            <th className="p-5 font-semibold text-center rounded-tr-xl">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="p-12 text-center text-gray-500 dark:text-gray-400">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <FileText size={48} className="mb-3 opacity-20" />
                                                        <p>Belum ada jadwal di tahun {header.tahun}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map(item => (
                                                <tr key={item.id_jadwal} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors duration-200">
                                                    <td className="p-5 align-top">
                                                        <div className="font-bold text-indigo-900 dark:text-indigo-300 text-base">{item.no_sk || "Tanpa No SK"}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex flex-col gap-1">
                                                            <span className="flex items-center gap-2">
                                                                <Badge variant="outline" className="h-5 px-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">Mulai</Badge>
                                                                {formatDate(item.tgl_mulai)}
                                                            </span>
                                                            <span className="flex items-center gap-2">
                                                                <Badge variant="outline" className="h-5 px-1 bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800">Selesai</Badge>
                                                                {formatDate(item.tgl_selesai)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 align-top">
                                                        <div className="space-y-1.5">
                                                            {item.details.map((det) => (
                                                                <div key={det.id_jadwal_detail} className="flex items-center justify-between gap-2 text-xs bg-slate-50 dark:bg-gray-800/50 px-3 py-1.5 rounded border border-slate-100 dark:border-gray-700">
                                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{det.departemen?.nama_departemen}</span>
                                                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-slate-100 dark:border-gray-700 shadow-sm">
                                                                        <UserIcon className="w-3 h-3" /> {det.auditor?.name}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-5 align-top text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30" onClick={() => openDetailModal(item)} title="Lihat Detail">
                                                                <Eye size={16} />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/30" onClick={() => handleEdit(item)} title="Edit">
                                                                <Edit size={16} />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => handleDelete(item.id_jadwal)} title="Hapus">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* --- 3. MODAL DETAIL HIERARKI --- */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="md:max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 dark:border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                <FileText size={20} /> Detail Jadwal Audit
                            </DialogTitle>
                            <DialogDescription className="dark:text-gray-400">
                                No SK: <span className="font-bold text-slate-800 dark:text-white">{detailItem?.no_sk}</span> |
                                Tanggal: {formatDate(detailItem?.tgl_mulai)} - {formatDate(detailItem?.tgl_selesai)}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 space-y-4">
                            {detailItem?.details.map((det, index) => (
                                <div key={index} className="border border-indigo-100 dark:border-gray-700 rounded-lg p-4 bg-indigo-50/50 dark:bg-gray-800">
                                    {/* Header per Departemen */}
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-indigo-100 dark:border-gray-700 ">
                                        <div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Auditee</div>
                                            <div className="font-bold text-lg text-indigo-900 dark:text-indigo-300">{det.departemen?.nama_departemen}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Auditor</div>
                                            <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center justify-end gap-2 bg-white dark:bg-gray-700 px-2 py-1 rounded shadow-sm">
                                                <UserIcon className=" w-4 h-4 text-indigo-500 " /> {det.auditor?.name}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Render Hierarki Standar Khusus Dept Ini */}
                                    <div className=" bg-white dark:bg-gray-900 p-3 rounded border border-slate-100 dark:border-gray-700 shadow-sm whitespace-pre-line">
                                        {renderHierarchyForDept(det.id_departemen)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsDetailOpen(false)} className="dark:bg-gray-800 dark:text-white dark:border-gray-600">Tutup</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    );
}
