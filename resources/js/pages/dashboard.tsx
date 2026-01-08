import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import { BreadcrumbItem } from "@/types";

// --- ICONS ---
import {
    Activity, Users, CheckCircle2, AlertTriangle,
    Calendar, ArrowUpRight, Search, Shield,
    Briefcase, Clock, Download, ChevronRight,
    TrendingUp, AlertCircle, FileText
} from "lucide-react";

// --- CHARTS ---
import {
    ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- SHADCN COMPONENTS ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// ==========================================
// 1. WIDGET REUSABLE
// ==========================================
const StatWidget = ({ title, value, icon: Icon, desc, colorClass = "text-muted-foreground" }: any) => (
    <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-indigo-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`p-2 rounded-full bg-slate-50 ${colorClass}`}>
                <Icon className="h-4 w-4" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                {desc}
            </p>
        </CardContent>
    </Card>
);

// --- HEATMAP WIDGET ---
const HeatmapWidget = ({ data, columns }: { data: any[], columns: any[] }) => {
    const getColor = (val: number) => {
        if (val === 0) return 'bg-gray-100 text-gray-400';
        if (val < 2) return 'bg-red-100 text-red-700 font-bold';
        if (val < 3) return 'bg-yellow-100 text-yellow-700';
        return 'bg-emerald-100 text-emerald-700 font-bold';
    };

    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-500"/> Peta Mutu (Heatmap)
                </CardTitle>
                <CardDescription>Sebaran skor per Departemen dan Standar</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px] bg-slate-50 sticky left-0 z-10">Departemen</TableHead>
                                {columns.map((col: any) => (
                                    <TableHead key={col.key} className="text-center text-[10px] w-[80px] px-1 bg-slate-50">{col.label}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? data.map((row, idx) => (
                                <TableRow key={idx} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-xs bg-white sticky left-0 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        {row.name}
                                    </TableCell>
                                    {columns.map((col: any) => (
                                        <TableCell key={col.key} className="p-1 text-center">
                                            <div className={`h-8 w-full flex items-center justify-center rounded text-xs ${getColor(row[col.key])}`}>
                                                {row[col.key] > 0 ? row[col.key] : '-'}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">Belum ada data penilaian.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

// ==========================================
// 2. DASHBOARD PER ROLE
// ==========================================

const AdminDashboard = ({ data }: { data: any }) => {
    const stats = data.stats || {};
    const charts = data.charts || { radar: [], findings: [], heatmap_data: [], heatmap_columns: [] };

    return (
        <div className="space-y-6">
            {/* METRICS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatWidget title="Rata-rata Skor" value={stats.score_avg} icon={Activity} desc="Skor Global" colorClass="text-indigo-500" />
                <StatWidget title="Temuan Open" value={stats.rtl_open} icon={AlertCircle} desc="Butuh Tindak Lanjut" colorClass="text-red-500" />
                <StatWidget title="Auditor Aktif" value={stats.auditor_active} icon={Users} desc="Personil Terlibat" colorClass="text-blue-500" />
                <StatWidget title="Progres Audit" value={`${stats.progress}%`} icon={CheckCircle2} desc="Departemen Dinilai" colorClass="text-emerald-500" />
            </div>

            {/* CHARTS ROW 1: RADAR & PIE */}
            <div className="grid gap-4 md:grid-cols-7">
                {/* RADAR CHART */}
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Peta Kekuatan Standar</CardTitle>
                        <CardDescription>Analisis keseimbangan mutu antar standar</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <div className="h-[300px] w-full max-w-lg">
                            {charts.radar.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={charts.radar}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 4]} tick={false} axisLine={false} />
                                        <Radar name="Skor" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Belum ada data skor.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* PIE CHART */}
                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Distribusi Temuan</CardTitle>
                        <CardDescription>Proporsi kategori ketidaksesuaian</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        {charts.findings.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={charts.findings} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {charts.findings.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-sm text-muted-foreground flex flex-col items-center">
                                <Shield className="h-10 w-10 mb-2 opacity-20"/> Belum ada temuan.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS ROW 2: HEATMAP */}
            <HeatmapWidget data={charts.heatmap_data} columns={charts.heatmap_columns} />
        </div>
    );
};

const AuditorDashboard = ({ data }: { data: any }) => {
    const stats = data.stats || { assigned: 0, completed: 0 };
    const tasks = data.tasks || [];

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
                <Alert className="border-indigo-200 bg-indigo-50">
                    <Briefcase className="h-4 w-4 text-indigo-600" />
                    <AlertTitle className="text-indigo-800 font-semibold">Tugas Audit Saya</AlertTitle>
                    <AlertDescription className="text-indigo-700 text-sm mt-1">
                        Anda memiliki <strong>{stats.assigned - stats.completed} unit kerja</strong> yang belum selesai dinilai.
                    </AlertDescription>
                </Alert>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Daftar Penugasan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Departemen / Prodi</TableHead>
                                    <TableHead>Peran</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.length > 0 ? tasks.map((task: any, idx: number) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <div className="font-medium text-slate-800">{task.prodi}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {task.completed ? <span className="text-green-600 font-medium">Selesai</span> : <span className="text-amber-600">Belum Dinilai</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{task.role}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Link href={task.link_score}>
                                                <Button size="sm" className={task.completed ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}>
                                                    {task.completed ? 'Edit Skor' : 'Input Skor'} <ChevronRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Tidak ada tugas aktif.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="bg-slate-900 text-white border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2 text-base">
                            <Clock className="h-5 w-5 text-indigo-400" /> Progres Saya
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2 text-slate-300">
                                <span>Unit Selesai</span>
                                <span className="font-mono bg-slate-800 px-2 rounded">{stats.completed}/{stats.assigned}</span>
                            </div>
                            <Progress value={stats.assigned > 0 ? (stats.completed / stats.assigned) * 100 : 0} className="h-2 bg-slate-700" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const AuditeeDashboard = ({ data }: { data: any }) => {
    const stats = data.stats || { stage: '-', completeness: 0 };
    const findings = data.findings || [];
    const documents = data.documents || [];

    return (
        <div className="space-y-6">
            <Card className="border-l-4 border-l-blue-500 shadow-sm bg-gradient-to-r from-white to-slate-50">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl text-slate-800">Status Audit Mutu</CardTitle>
                            <CardDescription>Tahapan Saat Ini</CardDescription>
                        </div>
                        <Badge className="px-3 py-1 bg-indigo-100 text-indigo-700 border-none">{stats.stage}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mt-4 mb-2 flex justify-between text-sm text-muted-foreground font-medium">
                        <span>Penyelesaian Kewajiban</span>
                        <span>{stats.completeness}%</span>
                    </div>
                    <Progress value={stats.completeness} className="h-3" />
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card className="shadow-sm h-full">
                        <CardHeader><CardTitle>Dokumen Wajib</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Nama Dokumen</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {documents.map((doc: any, i: number) => (
                                        <TableRow key={i}>
                                            <TableCell className="flex items-center gap-2"><FileText className="h-4 w-4 text-slate-400"/> {doc.name}</TableCell>
                                            <TableCell className="text-right"><Badge variant="outline">{doc.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <Card className={`shadow-sm border h-full ${findings.length > 0 ? 'border-red-200 bg-red-50/30' : 'border-green-200 bg-green-50/30'}`}>
                        <CardHeader className="pb-3">
                            <CardTitle className={`text-base flex items-center gap-2 ${findings.length > 0 ? 'text-red-700' : 'text-green-700'}`}>
                                {findings.length > 0 ? <AlertTriangle className="h-5 w-5"/> : <CheckCircle2 className="h-5 w-5"/>}
                                {findings.length > 0 ? `Temuan (${findings.length})` : 'Aman'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            {findings.length > 0 ? (
                                <>
                                    <p className="text-sm text-red-600 mb-2">Terdapat ketidaksesuaian yang perlu direspon.</p>
                                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                                        {findings.map((f: any, idx: number) => (
                                            <div key={idx} className="bg-white p-3 rounded border border-red-100 shadow-sm text-xs">
                                                <div className="font-bold text-red-700 mb-1 uppercase">{f.type}</div>
                                                <p className="text-slate-700 line-clamp-2">{f.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-2">
                                        <Link href={findings[0]?.link_rtl || '#'}>
                                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-8 text-xs">Isi Tindak Lanjut (RTL)</Button>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-green-600"><p className="text-sm font-medium">Tidak ada temuan aktif.</p></div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard({ auth, dashboardData }: { auth: any, dashboardData: any }) {
    const safeData = dashboardData || {};
    const meta = safeData.meta || {};
    const currentRole = meta.role || auth.active_role || 'guest';
    const currentYear = meta.tahun || new Date().getFullYear();

    const breadcrumbs: BreadcrumbItem[] = [{ title: "Dashboard", href: "/dashboard" }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard AMI" />
            <RoleSelectionModal />

            <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 py-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            Sistem Penjaminan Mutu Internal <ChevronRight className="h-4 w-4 text-slate-300"/>
                            <Badge variant="outline" className="capitalize text-slate-700 bg-slate-50 border-slate-200">{currentRole} View</Badge>
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" className="hidden md:flex bg-white hover:bg-slate-50">
                            <Calendar className="mr-2 h-4 w-4 text-slate-500" /> Periode {currentYear}
                        </Button>
                    </div>
                </div>

                <Separator />

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="bg-slate-100 p-1">
                        <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                        <TabsTrigger value="analytics">Statistik Detail</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 animate-in fade-in-50 duration-500">
                        {(currentRole === 'admin' || currentRole === 'superadmin') && <AdminDashboard data={safeData} />}
                        {currentRole === 'auditor' && <AuditorDashboard data={safeData} />}
                        {currentRole === 'auditee' && <AuditeeDashboard data={safeData} />}

                        {!['admin', 'superadmin', 'auditor', 'auditee'].includes(currentRole) && (
                            <div className="flex h-[400px] shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                                <div className="text-center">
                                    <Shield className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-slate-900">Akses Dashboard Terbatas</h3>
                                    <p className="text-sm text-slate-500">Silakan pilih role yang sesuai.</p>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="analytics">
                        <div className="flex items-center justify-center h-64 text-muted-foreground border border-dashed rounded-lg bg-slate-50">
                            <div className="text-center">
                                <Activity className="h-8 w-8 mx-auto mb-2 opacity-20"/> Modul Analitik Mendalam (Coming Soon)
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
