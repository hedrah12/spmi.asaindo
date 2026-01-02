import React, { useRef, useState, useMemo, useCallback } from "react";
import { router, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card } from "@/components/ui/card"; // Gunakan Card
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    File as FileIcon, FileText, FileImage, FileSpreadsheet, FolderPlus,
    UploadCloud, Folder, Trash2, Pencil, MoreHorizontal,
    Home, Search, ChevronRight, Eye, FileMusic, FileVideo, Download, Loader2
} from "lucide-react";

// 🔹 TYPE DEFINITIONS
interface FileNode {
    id: number;
    name: string;
    url: string;
    mime_type: string;
    size: number;
    created_at: string;
    folder_id: number | null;
}

interface FolderNode {
    id: number;
    name: string;
    parent_id: number | null;
    created_at?: string;
}

interface SidebarItemProps {
    folder: FolderNode;
    allFolders: FolderNode[];
    selectedId: number | undefined;
    onSelect: (folder: FolderNode) => void;
    level?: number;
}

interface FileManagerProps {
    folders?: FolderNode[];
    files?: FileNode[];
}

// 🔹 UTILS
const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

function getFileIcon(mime: string, className = "w-6 h-6") {
    if (!mime) return <FileIcon className={`${className} text-gray-400`} />;
    const m = mime.toLowerCase();
    if (m.includes("pdf")) return <FileText className={`${className} text-red-500`} />;
    if (m.includes("image")) return <FileImage className={`${className} text-blue-500`} />;
    if (m.includes("sheet") || m.includes("excel") || m.includes("csv")) return <FileSpreadsheet className={`${className} text-green-600`} />;
    if (m.includes("word") || m.includes("document")) return <FileText className={`${className} text-blue-700`} />;
    if (m.includes("video")) return <FileVideo className={`${className} text-purple-600`} />;
    if (m.includes("audio")) return <FileMusic className={`${className} text-yellow-600`} />;
    return <FileIcon className={`${className} text-gray-500`} />;
}

// 🔹 COMPONENT: SIDEBAR TREE
const SidebarItem = ({ folder, allFolders, selectedId, onSelect, level = 0 }: SidebarItemProps) => {
    const safeFolders = allFolders || [];
    const sub = safeFolders.filter((f) => f.parent_id === folder.id);
    const isOpen = selectedId === folder.id;

    return (
        <div>
            <button
                onClick={() => onSelect(folder)}
                className={`group w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md mb-1
                transition-all truncate
                ${isOpen
                        ? "bg-indigo-100 text-indigo-700 font-bold dark:bg-indigo-900/40 dark:text-indigo-300"
                        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"}
                pl-[calc(var(--indent-level)*1rem+0.75rem)]`}
                style={{ "--indent-level": level } as React.CSSProperties}
                title={folder.name}
            >
                <Folder
                    className={`w-4 h-4 shrink-0 transition-colors ${isOpen
                        ? "fill-indigo-500 text-indigo-500"
                        : "fill-gray-300 text-gray-400 group-hover:fill-indigo-400 group-hover:text-indigo-400"
                        }`}
                />
                <span className="truncate">{folder.name}</span>
            </button>
            {sub.map((child: FolderNode) => (
                <SidebarItem key={child.id} folder={child} allFolders={safeFolders} selectedId={selectedId} onSelect={onSelect} level={level + 1} />
            ))}
        </div>
    );
};

// 🔹 MAIN COMPONENT
export default function FileManager({ folders = [], files = [] }: FileManagerProps) {
    // STATE
    const [selectedFolder, setSelectedFolder] = useState<FolderNode | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [modal, setModal] = useState<{ type: "create" | "rename" | null; target?: FolderNode | null }>({ type: null, target: null });
    const [inputName, setInputName] = useState("");

    // Preview State
    const [previewFile, setPreviewFile] = useState<FileNode | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🔹 BREADCRUMBS CALCULATION
    const folderPath = useMemo(() => {
        const path: FolderNode[] = [];
        let current = selectedFolder;
        const safeFolders = folders || [];

        while (current) {
            path.unshift(current);
            const parent = safeFolders.find(f => f.id === current?.parent_id);
            current = parent || null;
        }
        return path;
    }, [selectedFolder, folders]);

    // 🔹 FILTER DATA
    const filteredContent = useMemo(() => {
        const safeFolders = folders || [];
        const safeFiles = files || [];

        let folderList = safeFolders.filter(f => f.parent_id === (selectedFolder?.id || null));
        let fileList = safeFiles.filter(f => f.folder_id === (selectedFolder?.id || null));

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            folderList = safeFolders.filter(f => f.name.toLowerCase().includes(lowerQuery));
            fileList = safeFiles.filter(f => f.name.toLowerCase().includes(lowerQuery));
        }

        return { folders: folderList, files: fileList };
    }, [selectedFolder, folders, files, searchQuery]);

    // 🔹 ACTIONS
    const handleNavigate = (folder: FolderNode | null) => {
        if (isLoading) return;
        setSelectedFolder(folder);
        setSearchQuery("");
    };

    const handleUpload = useCallback((fileList: FileList | null) => {
        if (isLoading) return;
        if (!fileList || fileList.length === 0) return;

        setIsLoading(true);

        const form = new FormData();
        Array.from(fileList).forEach(f => form.append("files[]", f));

        if (selectedFolder) {
            form.append("folder_id", selectedFolder.id.toString());
        }

        const toastId = toast.loading("Mengupload file...");

        router.post("/file", form, {
            forceFormData: true,
            onSuccess: () => {
                toast.success("Upload berhasil!");
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            onError: (errors) => {
                console.error(errors);
                if (errors['files.0']) toast.error(errors['files.0']);
                else toast.error("Gagal mengupload file.");
            },
            onFinish: () => {
                toast.dismiss(toastId);
                setIsLoading(false);
            }
        });
    }, [selectedFolder, isLoading]);

    const handleDelete = (type: 'folder' | 'file', id: number) => {
        if (isLoading) return;
        if (!confirm(`Yakin ingin menghapus ${type} ini?`)) return;

        setIsLoading(true);

        router.delete(`/${type}/${id}`, {
            onSuccess: () => {
                toast.success(`${type === 'folder' ? 'Folder' : 'File'} berhasil dihapus`);
                if (type === 'folder' && selectedFolder?.id === id) setSelectedFolder(null);
                if (type === 'file' && previewFile?.id === id) setPreviewFile(null);
            },
            onError: () => toast.error("Gagal menghapus."),
            onFinish: () => setIsLoading(false)
        });
    };

    const submitModal = () => {
        if (isLoading) return;
        if (!inputName.trim()) return toast.error("Nama tidak boleh kosong");

        setIsLoading(true);

        if (modal.type === "create") {
            router.post("/folder", {
                name: inputName,
                parent_id: selectedFolder?.id || null
            }, {
                onSuccess: () => { toast.success("Folder dibuat"); setModal({ type: null, target: null }); },
                onError: () => toast.error("Gagal membuat folder"),
                onFinish: () => setIsLoading(false)
            });
        } else if (modal.type === "rename" && modal.target) {
            router.put(`/folder/${modal.target.id}`, { name: inputName }, {
                onSuccess: () => { toast.success("Folder diubah"); setModal({ type: null, target: null }); },
                onError: () => toast.error("Gagal mengubah nama"),
                onFinish: () => setIsLoading(false)
            });
        }
    };

    // 🔹 PREVIEW RENDERER
    const renderPreviewContent = (file: FileNode) => {
        const mime = file.mime_type.toLowerCase();
        if (mime.includes("image")) return <img src={file.url} alt={file.name} className="max-w-full max-h-[70vh] object-contain mx-auto rounded-md shadow-sm" />;
        if (mime.includes("pdf")) return <iframe src={file.url} className="w-full h-[70vh] rounded-md border" title="PDF Preview"></iframe>;
        if (mime.includes("video")) return <video controls src={file.url} className="w-full max-h-[70vh] rounded-md" />;
        if (mime.includes("audio")) return <audio controls src={file.url} className="w-full mt-10" />;
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <FileSpreadsheet className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Preview tidak tersedia</h3>
                <p className="text-sm text-gray-500 mb-6">File ini tidak dapat ditampilkan langsung di browser.</p>
                <Button onClick={() => window.open(file.url, '_blank')}>
                    <Download className="w-4 h-4 mr-2" /> Download File
                </Button>
            </div>
        );
    };

    // DRAG EVENTS
    const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
    }, [handleUpload]);

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Dokumen", href: "/media" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="File Manager" />

            {/* MAIN CONTAINER BACKGROUND GRADIENT */}
            <div className="flex h-[calc(100vh-65px)] bg-gray-50 dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 overflow-hidden relative"
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>

                {/* OVERLAY DRAG & DROP */}
                {isDragging && !isLoading && (
                    <div className="absolute inset-0 z-50 bg-indigo-500/20 backdrop-blur-sm border-4 border-indigo-500 border-dashed flex items-center justify-center m-4 rounded-xl pointer-events-none">
                        <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center animate-bounce">
                            <UploadCloud className="w-16 h-16 text-indigo-600 mb-2" />
                            <h3 className="text-xl font-bold text-indigo-700">Lepaskan file di sini</h3>
                        </div>
                    </div>
                )}

                {/* Loading Overlay Global */}
                {isLoading && (
                    <div className="absolute inset-0 z-[60] bg-white/50 dark:bg-black/50 backdrop-blur-[2px] flex items-center justify-center cursor-wait">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <span className="text-sm font-medium text-indigo-600">Memproses...</span>
                        </div>
                    </div>
                )}

                {/* SIDEBAR (GLASSMORPHISM) */}
                <div className="w-64 border-r border-indigo-100 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md flex flex-col hidden md:flex shrink-0">
                    <div className="p-4 flex-1 overflow-hidden flex flex-col">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Storage</div>
                        <nav className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                            <button
                                onClick={() => handleNavigate(null)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all
                                ${!selectedFolder
                                        ? "bg-indigo-100 text-indigo-700 font-bold dark:bg-indigo-900/40 dark:text-indigo-300"
                                        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"}`}
                            >
                                <Home className="w-4 h-4 shrink-0" /> My Document
                            </button>

                            {(folders || []).filter(f => f.parent_id === null).map(folder => (
                                <SidebarItem
                                    key={folder.id}
                                    folder={folder}
                                    allFolders={folders || []}
                                    selectedId={selectedFolder?.id}
                                    onSelect={handleNavigate}
                                />
                            ))}
                        </nav>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col min-w-0 bg-transparent">

                    {/* TOOLBAR (GLASSMORPHISM) */}
                    <div className="h-16 border-b border-indigo-100 dark:border-gray-700 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur shrink-0 z-10">

                        {/* LEFT : BREADCRUMB */}
                        <div className="flex items-center gap-2 overflow-hidden mr-4">
                            <button
                                onClick={() => handleNavigate(null)}
                                className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${!selectedFolder ? "text-indigo-600 font-bold" : "text-gray-500 dark:text-gray-400"}`}
                                title="Root Folder"
                            >
                                <Home className="w-5 h-5" />
                            </button>

                            {folderPath.map((crumb, idx) => (
                                <div key={crumb.id} className="flex items-center text-sm">
                                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1 shrink-0" />
                                    <button
                                        onClick={() => handleNavigate(crumb)}
                                        className={`truncate max-w-[120px] hover:underline ${idx === folderPath.length - 1 ? "font-semibold text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
                                    >
                                        {crumb.name}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* RIGHT : ACTIONS */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="relative w-40 lg:w-64 hidden sm:block">
                                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Cari..."
                                    className="pl-9 bg-white dark:bg-gray-900 border-indigo-100 dark:border-gray-700 focus:ring-indigo-500 transition-all rounded-full h-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white dark:bg-gray-800 border-indigo-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700 text-indigo-700 dark:text-gray-200"
                                onClick={() => {
                                    setInputName("");
                                    setModal({ type: "create" });
                                }}
                                disabled={isLoading}
                            >
                                <FolderPlus className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Folder</span>
                            </Button>

                            <Button
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700 shadow-md text-white"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                            >
                                <UploadCloud className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Upload</span>
                            </Button>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-transparent">

                        {filteredContent.folders.length === 0 && filteredContent.files.length === 0 && !searchQuery ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 animate-in fade-in duration-500">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-full mb-4 shadow-sm border border-dashed border-gray-200 dark:border-gray-700">
                                    <UploadCloud className="w-16 h-16 text-indigo-200 dark:text-gray-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Folder ini kosong</h3>
                                <p className="text-sm max-w-xs mx-auto mb-6 text-gray-500 dark:text-gray-500">Drag & drop file di sini atau gunakan tombol upload.</p>
                                <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>Pilih File dari Komputer</Button>
                            </div>
                        ) : (
                            <>
                                {/* SECTION: FOLDERS */}
                                {filteredContent.folders.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                            <Folder className="w-4 h-4" /> Folders ({filteredContent.folders.length})
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                            {filteredContent.folders.map(folder => (
                                                <div
                                                    key={folder.id}
                                                    onClick={() => handleNavigate(folder)}
                                                    className="group flex flex-col justify-between p-4 border border-indigo-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all h-32 relative shadow-sm"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <Folder className="w-10 h-10 text-yellow-400 fill-yellow-400 dark:text-yellow-500 dark:fill-yellow-500" />

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                                                                <DropdownMenuItem className="dark:text-gray-200 dark:focus:bg-gray-700" onClick={(e) => { e.stopPropagation(); setInputName(folder.name); setModal({ type: "rename", target: folder }); }}>
                                                                    <Pencil className="w-4 h-4 mr-2" /> Rename
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                                <DropdownMenuItem className="text-red-600 dark:text-red-400 dark:focus:bg-gray-700" onClick={(e) => { e.stopPropagation(); handleDelete('folder', folder.id); }}>
                                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate w-full" title={folder.name}>{folder.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SECTION: FILES */}
                                {filteredContent.files.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Files ({filteredContent.files.length})
                                        </h3>
                                        <Card className="rounded-xl overflow-hidden shadow-xl border-0 ring-1 ring-gray-200 dark:ring-gray-800 bg-white dark:bg-gray-900">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium">
                                                    <tr>
                                                        <th className="px-5 py-4">Name</th>
                                                        <th className="px-5 py-4 w-32 hidden sm:table-cell">Size</th>
                                                        <th className="px-5 py-4 w-28 text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {filteredContent.files.map(file => (
                                                        <tr key={file.id}
                                                            className="hover:bg-slate-50 dark:hover:bg-slate-900/50 group cursor-pointer transition-colors"
                                                            onClick={() => setPreviewFile(file)}
                                                        >
                                                            <td className="px-5 py-3 flex items-center gap-3">
                                                                {getFileIcon(file.mime_type, "w-8 h-8")}
                                                                <div className="flex flex-col overflow-hidden">
                                                                    <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                                                                        {file.name}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400 sm:hidden">{formatSize(file.size)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{formatSize(file.size)}</td>
                                                            <td className="px-5 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                                <div className="flex justify-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => setPreviewFile(file)} className="p-1.5 text-gray-500 hover:text-indigo-600 rounded hover:bg-indigo-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors" title="Preview"><Eye className="w-4 h-4" /></button>
                                                                    <button onClick={() => window.open(file.url, '_blank')} className="p-1.5 text-gray-500 hover:text-green-600 rounded hover:bg-green-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-green-400 transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                                                                    <button onClick={() => handleDelete('file', file.id)} className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-red-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </Card>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- HIDDEN INPUT --- */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={(e) => handleUpload(e.target.files)}
                disabled={isLoading}
            />

            {/* --- MODAL: CREATE / RENAME --- */}
            <Dialog open={modal.type !== null} onOpenChange={() => { if (!isLoading) setModal({ type: null, target: null }); }}>
                <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">{modal.type === "create" ? "Buat Folder Baru" : "Ganti Nama Folder"}</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            {modal.type === "create"
                                ? `Folder akan dibuat di dalam "${selectedFolder?.name || "My Document"}"`
                                : "Masukkan nama baru untuk folder ini."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-2">
                        <label htmlFor="folder-input" className="text-sm font-medium leading-none dark:text-gray-300">
                            Nama Folder
                        </label>
                        <Input
                            id="folder-input"
                            placeholder="Nama Folder"
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    submitModal();
                                }
                            }}
                            autoFocus
                            disabled={isLoading}
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setModal({ type: null, target: null })} disabled={isLoading} className="dark:bg-gray-800 dark:text-gray-200">Batal</Button>
                        <Button onClick={submitModal} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MODAL: FILE PREVIEW --- */}
            <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
                <DialogContent className="max-w-4xl w-full h-auto max-h-[90vh] flex flex-col p-0 overflow-hidden dark:bg-gray-900 dark:border-gray-700">
                    <DialogHeader className="p-4 border-b dark:border-gray-700 flex flex-row items-center justify-between space-y-0 bg-white dark:bg-gray-900">
                        <DialogTitle className="truncate pr-8 text-base dark:text-white">{previewFile?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto bg-gray-100 dark:bg-black/20 p-4 flex items-center justify-center min-h-[300px]">
                        {previewFile && renderPreviewContent(previewFile)}
                    </div>

                    <DialogFooter className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center sm:justify-between">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {previewFile && `${formatSize(previewFile.size)} • ${previewFile.mime_type}`}
                        </div>
                        <Button size="sm" onClick={() => previewFile && window.open(previewFile.url, '_blank')} className="dark:bg-gray-700 dark:text-white">
                            <Download className="w-4 h-4 mr-2" /> Download Asli
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
