import React from "react";
import { usePage, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import { BreadcrumbItem } from "@/types";

// --- ICONS (Lucide React) ---
import {
    Activity, Users, FileText, CheckCircle2, AlertTriangle,
    Calendar, ArrowUpRight, Search, MoreHorizontal, Shield,
    Briefcase, Clock, FileCheck, Download, ChevronRight
} from "lucide-react";

// --- CHARTS (Recharts) ---
import {
    AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

// --- SHADCN COMPONENTS (Dari folder components/ui anda) ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// ==========================================
// 1. DATA DUMMY (Untuk Visualisasi)
// ==========================================

const chartData = [
    { name: 'Jan', score: 2.4 }, { name: 'Feb', score: 3.1 }, { name: 'Mar', score: 3.5 },
    { name: 'Apr', score: 3.2 }, { name: 'May', score: 3.8 }, { name: 'Jun', score: 3.9 },
];

const documentList = [
    { name: "Laporan Evaluasi Diri (LED)", status: "Selesai", date: "12 Agt 2025" },
    { name: "Dokumen Kurikulum (RPS)", status: "Revisi", date: "14 Agt 2025" },
    { name: "Data Dosen Tetap", status: "Pending", date: "-" },
    { name: "Bukti Fisik Sarpras", status: "Pending", date: "-" },
];

// ==========================================
// 2. WIDGETS KECIL (Reusable)
// ==========================================

// Widget Statistik Utama
const StatWidget = ({ title, value, icon: Icon, desc, trend }: any) => (
    <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">
                {trend && <span className="text-emerald-600 font-medium mr-1">{trend}</span>}
                {desc}
            </p>
        </CardContent>
    </Card>
);

// ==========================================
// 3. TAMPILAN PER ROLE
// ==========================================

// --- ADMIN (Pimpinan/LPM) ---
const AdminDashboard = () => (
    <div className="space-y-6">
        {/* Row 1: Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatWidget title="Total Audit" value="24" icon={FileText} desc="Periode 2025/2026" trend="+4" />
            <StatWidget title="Rata-rata Skor" value="3.52" icon={Activity} desc="Predikat: Sangat Baik" trend="+0.2" />
            <StatWidget title="Prodi Selesai" value="12/24" icon={CheckCircle2} desc="50% Target tercapai" />
            <StatWidget title="Auditor Aktif" value="18" icon={Users} desc="Sedang bertugas" />
        </div>

        <div className="grid gap-4 md:grid-cols-7">
            {/* Row 2: Chart (Kiri - Besar) */}
            <Card className="col-span-4 shadow-sm">
                <CardHeader>
                    <CardTitle>Tren Mutu Internal</CardTitle>
                    <CardDescription>Perkembangan skor rata-rata prodi (6 Bulan Terakhir)</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} domain={[0, 4]} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#0ea5e9', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Row 2: Activity Feed (Kanan - Kecil) */}
            <Card className="col-span-3 shadow-sm">
                <CardHeader>
                    <CardTitle>Aktivitas Terbaru</CardTitle>
                    <CardDescription>Log kegiatan user hari ini</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} />
                                        <AvatarFallback>US</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            User {i} <span className="text-muted-foreground font-normal">mengunggah LED</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">S1 Informatika • 2 jam lalu</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        {/* Row 3: Main Table */}
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Status Audit Program Studi</CardTitle>
                    <CardDescription>Monitoring progres audit per prodi</CardDescription>
                </div>
                <Button size="sm" variant="outline">Lihat Semua</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Program Studi</TableHead>
                            <TableHead>Fakultas</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Skor Sementara</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">S1 Sistem Informasi</TableCell>
                            <TableCell>Ilmu Komputer</TableCell>
                            <TableCell><Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Desk Eval</Badge></TableCell>
                            <TableCell>3.10</TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">S1 Manajemen</TableCell>
                            <TableCell>Ekonomi</TableCell>
                            <TableCell><Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Selesai</Badge></TableCell>
                            <TableCell className="font-bold text-emerald-600">3.65</TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
);

// --- AUDITOR (Dosen/Reviewer) ---
const AuditorDashboard = () => (
    <div className="grid gap-6 md:grid-cols-3">
        {/* Kolom Kiri: Main Tasks (2/3 lebar) */}
        <div className="md:col-span-2 space-y-6">

            {/* Alert Jadwal */}
            <Alert className="border-indigo-200 bg-indigo-50">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                <AlertTitle className="text-indigo-700">Tugas Visitasi Hari Ini!</AlertTitle>
                <AlertDescription className="text-indigo-600 text-sm">
                    Anda dijadwalkan melakukan visitasi lapangan ke <strong>Prodi D3 Perhotelan</strong> pukul 09:00 WIB.
                </AlertDescription>
            </Alert>

            {/* Tabel Penugasan */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Daftar Penugasan Audit</CardTitle>
                    <CardDescription>Kelola audit yang ditugaskan kepada Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Prodi</TableHead>
                                <TableHead>Peran</TableHead>
                                <TableHead>Tahap</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">S1 Teknik Sipil</TableCell>
                                <TableCell>Ketua</TableCell>
                                <TableCell><Badge>Desk Eval</Badge></TableCell>
                                <TableCell>22 Agt 2025</TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm">Review</Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">S1 Akuntansi</TableCell>
                                <TableCell>Anggota</TableCell>
                                <TableCell><Badge variant="secondary">Visitasi</Badge></TableCell>
                                <TableCell>25 Agt 2025</TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline">Detail</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        {/* Kolom Kanan: Sidebar Tools (1/3 lebar) */}
        <div className="space-y-6">
            <Card className="bg-slate-900 text-white">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="h-5 w-5" /> Statistik
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1 text-slate-300">
                            <span>Audit Selesai</span>
                            <span>12/15</span>
                        </div>
                        <Progress value={80} className="h-2 bg-slate-700" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Panduan & Template</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <Button variant="outline" className="w-full justify-start text-sm">
                        <Download className="mr-2 h-4 w-4" /> Template Berita Acara
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-sm">
                        <Download className="mr-2 h-4 w-4" /> Kode Etik Auditor
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
);

// --- AUDITEE (Prodi/Unit) ---
const AuditeeDashboard = () => (
    <div className="space-y-6">
        {/* Progress Tracker */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">Persiapan Audit Mutu Internal</CardTitle>
                        <CardDescription>Siklus Tahun 2025 - S1 Teknik Informatika</CardDescription>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1">Tahap 2: Desk Evaluation</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-4 mb-2 flex justify-between text-sm text-muted-foreground">
                    <span>Kelengkapan Dokumen</span>
                    <span>75%</span>
                </div>
                <Progress value={75} className="h-3" />
            </CardContent>
        </Card>

        {/* Layout Split: Upload & Status */}
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
                <Card className="shadow-sm h-full">
                    <CardHeader>
                        <CardTitle>Dokumen Wajib</CardTitle>
                        <CardDescription>List dokumen yang harus dipenuhi sebelum visitasi.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Dokumen</TableHead>
                                    <TableHead>Tanggal Upload</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documentList.map((doc, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" /> {doc.name}
                                        </TableCell>
                                        <TableCell>{doc.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={doc.status === 'Selesai' ? 'default' : doc.status === 'Revisi' ? 'destructive' : 'secondary'}>
                                                {doc.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {doc.status === 'Pending' ? (
                                                <Button size="sm" variant="outline">Upload</Button>
                                            ) : (
                                                <Button size="sm" variant="ghost">Lihat</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div>
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Temuan Awal (Desk Eval)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="text-sm font-bold">Koreksi Mayor</AlertTitle>
                            <AlertDescription className="text-xs mt-1">
                                Data dukung kerjasama internasional belum dilampirkan bukti MoU.
                            </AlertDescription>
                        </Alert>
                        <Alert className="bg-amber-50 text-amber-900 border-amber-200">
                            <AlertTitle className="text-sm font-bold">Saran</AlertTitle>
                            <AlertDescription className="text-xs mt-1">
                                Mohon update profil lulusan pada Bab 1.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Buka Lembar Evaluasi</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
);

// ==========================================
// 4. MAIN LAYOUT
// ==========================================

export default function Dashboard({ auth }: { auth: any }) {
    const currentRole = auth.active_role ? auth.active_role.toLowerCase() : "guest";

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <RoleSelectionModal />

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

                {/* Header Area */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 py-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                        <p className="text-muted-foreground">
                            Selamat datang, {auth.user.name}. Role aktif: <span className="capitalize font-semibold text-foreground">{currentRole}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">
                            <Calendar className="mr-2 h-4 w-4" /> 2025
                        </Button>
                        <Button>Download Laporan</Button>
                    </div>
                </div>

                <Separator className="my-2" />

                {/* Main Content Area */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
                        <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">

                        {/* Logic Render Dashboard per Role */}
                        {(currentRole === 'admin' || currentRole === 'superadmin') && <AdminDashboard />}
                        {currentRole === 'auditor' && <AuditorDashboard />}
                        {currentRole === 'auditee' && <AuditeeDashboard />}

                        {/* Fallback Jika Role Belum Dipilih */}
                        {!['admin', 'superadmin', 'auditor', 'auditee'].includes(currentRole) && (
                            <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
                                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                                    <Shield className="h-10 w-10 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">Tidak ada akses role</h3>
                                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                        Anda belum memilih role atau akun Anda belum dikonfigurasi.
                                    </p>
                                    <Button size="sm" onClick={() => window.location.reload()}>Refresh</Button>
                                </div>
                            </div>
                        )}

                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
