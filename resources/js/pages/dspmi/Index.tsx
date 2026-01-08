import React, { useRef, useState, useMemo, useCallback } from "react";
import { router, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    File as FileIcon, FileText, FileImage, FileSpreadsheet, FolderPlus,
    UploadCloud, Folder, Trash2, Pencil, MoreHorizontal,
    Home, Search, ChevronRight, Eye, FileMusic, FileVideo, Download, Loader2,
    HelpCircle, AlertTriangle, Info, X
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
                className={`group w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md mb-0.5 transition-colors duration-200
                ${isOpen
                        ? "bg-indigo-600 text-white font-medium shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}
                pl-[calc(var(--indent-level)*1rem+0.75rem)]`}
                style={{ "--indent-level": level } as React.CSSProperties}
                title={folder.name}
            >
                <Folder
                    className={`w-4 h-4 shrink-0 transition-colors ${isOpen
                        ? "fill-white text-white"
                        : "fill-indigo-100 text-indigo-500 group-hover:text-indigo-600"
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

    const [modal, setModal] = useState<{ type: "create" | "rename" | null; target?: FolderNode | null }>({ type: null, target: null });
    const [inputName, setInputName] = useState("");

    const [deleteConfig, setDeleteConfig] = useState<{ type: 'folder' | 'file'; id: number; name: string } | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    const [previewFile, setPreviewFile] = useState<FileNode | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🔹 BREADCRUMBS
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
            preserveScroll: true,
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
                setIsDragging(false);
            }
        });
    }, [selectedFolder, isLoading]);

    // Request Delete (Trigger Modal with setTimeout fix)
    const requestDelete = (type: 'folder' | 'file', id: number, name: string) => {
        if (isLoading) return;
        // Jeda sedikit agar dropdown menutup sempurna sebelum dialog buka
        setTimeout(() => {
            setDeleteConfig({ type, id, name });
        }, 150);
    };

    // Confirm Delete
    const confirmDelete = () => {
        if (!deleteConfig) return;

        setIsLoading(true);
        const { type, id } = deleteConfig;

        router.delete(`/${type}/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${type === 'folder' ? 'Folder' : 'File'} berhasil dihapus`);
                if (type === 'folder' && selectedFolder?.id === id) setSelectedFolder(null);
                if (type === 'file' && previewFile?.id === id) setPreviewFile(null);
                setDeleteConfig(null);
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
                preserveScroll: true,
                onSuccess: () => { toast.success("Folder dibuat"); setModal({ type: null, target: null }); },
                onError: () => toast.error("Gagal membuat folder"),
                onFinish: () => setIsLoading(false)
            });
        } else if (modal.type === "rename" && modal.target) {
            router.put(`/folder/${modal.target.id}`, { name: inputName }, {
                preserveScroll: true,
                onSuccess: () => { toast.success("Folder diubah"); setModal({ type: null, target: null }); },
                onError: () => toast.error("Gagal mengubah nama"),
                onFinish: () => setIsLoading(false)
            });
        }
    };

    // 🔹 PREVIEW RENDERER (IMPROVED)
    const renderPreviewContent = (file: FileNode) => {
        const mime = file.mime_type.toLowerCase();

        // 1. IMAGE
        if (mime.includes("image")) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-[url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.2B7k0j7x7x7x7x7x7x7x7w%26pid%3DApi&f=1')] bg-repeat bg-[length:20px_20px]">
                    <img src={file.url} alt={file.name} className="max-w-full max-h-[65vh] object-contain shadow-lg" />
                </div>
            );
        }

        // 2. PDF
        if (mime.includes("pdf")) {
            return (
                <iframe src={file.url} className="w-full h-[70vh] rounded-md border-none" title="PDF Preview"></iframe>
            );
        }

        // 3. VIDEO
        if (mime.includes("video")) {
            return (
                <div className="w-full flex items-center justify-center bg-black/90 h-[60vh] rounded-md">
                    <video controls src={file.url} className="max-w-full max-h-full rounded-md" />
                </div>
            );
        }

        // 4. AUDIO
        if (mime.includes("audio")) {
            return (
                <div className="w-full h-[40vh] flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                    <FileMusic className="w-20 h-20 text-yellow-500 mb-4 animate-pulse" />
                    <h3 className="text-lg font-medium text-gray-700 mb-4">{file.name}</h3>
                    <audio controls src={file.url} className="w-3/4" />
                </div>
            );
        }

        // 5. DEFAULT / UNKNOWN
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="bg-white dark:bg-gray-700 p-6 rounded-full shadow-sm mb-4">
                    {getFileIcon(file.mime_type, "w-16 h-16")}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Preview Tidak Tersedia</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                    File tipe <b>{file.mime_type}</b> tidak dapat ditampilkan langsung di browser. Silakan unduh untuk melihatnya.
                </p>
                <Button onClick={() => window.open(file.url, '_blank')} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Download className="w-4 h-4 mr-2" /> Download File Sekarang
                </Button>
            </div>
        );
    };

    // DRAG EVENTS
    const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); if (!isLoading) setIsDragging(true); }, [isLoading]);
    const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (isLoading) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
    }, [handleUpload, isLoading]);

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Dokumen", href: "/media" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="File Manager" />

            <div className="flex h-[calc(100vh-65px)] bg-white dark:bg-gray-950 overflow-hidden relative border-t border-gray-200 dark:border-gray-800"
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>

                {/* OVERLAY DRAG & DROP */}
                {isDragging && !isLoading && (
                    <div className="absolute inset-0 z-50 bg-indigo-50/90 dark:bg-indigo-950/90 border-4 border-indigo-500 border-dashed flex items-center justify-center m-4 rounded-xl pointer-events-none">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce border border-gray-100 dark:border-gray-700">
                            <UploadCloud className="w-20 h-20 text-indigo-600 mb-4" />
                            <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Lepaskan file di sini</h3>
                        </div>
                    </div>
                )}

                {/* LOADING OVERLAY (NO BLUR, SOLID OPACITY) */}
                {isLoading && (
                    <div className="absolute inset-0 z-[60] bg-white/80 dark:bg-gray-950/80 flex items-center justify-center cursor-wait">
                        <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-indigo-100 dark:border-gray-800">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Sedang memproses...</span>
                        </div>
                    </div>
                )}

                {/* SIDEBAR */}
                <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col hidden md:flex shrink-0">
                    <div className="p-4 flex-1 overflow-hidden flex flex-col">
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Storage</div>
                        <nav className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                            <button
                                onClick={() => handleNavigate(null)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors duration-200
                                ${!selectedFolder
                                        ? "bg-indigo-600 text-white font-medium shadow-sm"
                                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                            >
                                <Home className={`w-4 h-4 shrink-0 ${!selectedFolder ? "text-white" : "text-gray-500"}`} />
                                My Document
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
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-950">

                    {/* TOOLBAR */}
                    <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-900 shrink-0 z-10">

                        <div className="flex items-center gap-2 overflow-hidden mr-4">
                            <button
                                onClick={() => handleNavigate(null)}
                                className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${!selectedFolder ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-500 dark:text-gray-400"}`}
                                title="Root Folder"
                            >
                                <Home className="w-5 h-5" />
                            </button>

                            {folderPath.map((crumb, idx) => (
                                <div key={crumb.id} className="flex items-center text-sm">
                                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-1 shrink-0" />
                                    <button
                                        onClick={() => handleNavigate(crumb)}
                                        className={`truncate max-w-[120px] px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${idx === folderPath.length - 1 ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
                                    >
                                        {crumb.name}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <div className="relative w-40 lg:w-64 hidden sm:block">
                                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Cari..."
                                    className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-indigo-500 transition-all rounded-full h-9 text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Tombol Help */}
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                onClick={() => setShowHelp(true)}
                                title="Bantuan"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </Button>

                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>

                            <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                                onClick={() => {
                                    setInputName("");
                                    setModal({ type: "create" });
                                }}
                                disabled={isLoading}
                            >
                                <FolderPlus className="w-4 h-4 mr-1.5" />
                                <span className="hidden sm:inline">Folder</span>
                            </Button>

                            <Button
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                            >
                                <UploadCloud className="w-4 h-4 mr-1.5" />
                                <span className="hidden sm:inline">Upload</span>
                            </Button>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-gray-50/50 dark:bg-gray-950">

                        {filteredContent.folders.length === 0 && filteredContent.files.length === 0 && !searchQuery ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 animate-in fade-in duration-500">
                                <div className="bg-white dark:bg-gray-900 p-8 rounded-full mb-4 shadow-sm border border-dashed border-gray-200 dark:border-gray-800">
                                    <FolderPlus className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Folder ini kosong</h3>
                                <p className="text-sm max-w-xs mx-auto mb-6 text-gray-500 dark:text-gray-500 mt-2">Mulai dengan membuat folder baru atau mengupload file.</p>
                                <Button variant="default" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                                    Upload File Sekarang
                                </Button>
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
                                                    className="group flex flex-col justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all duration-200 h-28 relative shadow-sm"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <Folder className="w-10 h-10 text-indigo-100 fill-indigo-500 dark:text-indigo-900 dark:fill-indigo-600" />

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40 dark:bg-gray-800 dark:border-gray-700">
                                                                <DropdownMenuItem className="dark:text-gray-200 cursor-pointer" onClick={(e) => { e.stopPropagation(); setInputName(folder.name); setModal({ type: "rename", target: folder }); }}>
                                                                    <Pencil className="w-4 h-4 mr-2" /> Rename
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                                                <DropdownMenuItem
                                                                    className="text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        requestDelete('folder', folder.id, folder.name);
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate w-full mt-2" title={folder.name}>{folder.name}</span>
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
                                        <Card className="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                                    <tr>
                                                        <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                                                        <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300 w-32 hidden sm:table-cell">Size</th>
                                                        <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-300 w-32 text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {filteredContent.files.map(file => (
                                                        <tr key={file.id}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 group cursor-pointer transition-colors duration-150"
                                                            onClick={() => setPreviewFile(file)}
                                                        >
                                                            <td className="px-6 py-3 flex items-center gap-4">
                                                                {getFileIcon(file.mime_type, "w-8 h-8")}
                                                                <div className="flex flex-col overflow-hidden">
                                                                    <span className="text-gray-800 dark:text-gray-200 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                                                                        {file.name}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400 sm:hidden mt-0.5">{formatSize(file.size)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{formatSize(file.size)}</td>
                                                            <td className="px-6 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                                <div className="flex justify-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => setPreviewFile(file)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors" title="Preview"><Eye className="w-4 h-4" /></button>
                                                                    <button onClick={() => window.open(file.url, '_blank')} className="p-2 text-gray-500 hover:text-green-600 rounded-md hover:bg-green-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-green-400 transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                                                                    <button
                                                                        onClick={() => requestDelete('file', file.id, file.name)}
                                                                        className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400 transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
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
            <Dialog open={modal.type !== null} onOpenChange={(isOpen) => { if (!isOpen && !isLoading) setModal({ type: null, target: null }); }}>
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
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MODAL: CONFIRM DELETE --- */}
            <Dialog open={!!deleteConfig} onOpenChange={(isOpen) => { if (!isOpen && !isLoading) setDeleteConfig(null); }}>
                <DialogContent className="dark:bg-gray-900 dark:border-gray-700 sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <DialogTitle className="dark:text-white">Konfirmasi Hapus</DialogTitle>
                                <DialogDescription className="dark:text-gray-400 mt-1">
                                    Apakah Anda yakin ingin menghapus {deleteConfig?.type === 'folder' ? 'folder' : 'file'}: <br />
                                    <span className="font-bold text-gray-800 dark:text-gray-200">"{deleteConfig?.name}"</span>?
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    {deleteConfig?.type === 'folder' && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 rounded-md text-xs text-red-600 dark:text-red-400 flex gap-2">
                            <Info className="w-4 h-4 shrink-0" />
                            <span>Menghapus folder akan menghapus semua file di dalamnya secara permanen.</span>
                        </div>
                    )}
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteConfig(null)} disabled={isLoading} className="dark:bg-gray-800 dark:text-gray-200">Batal</Button>
                        <Button onClick={confirmDelete} disabled={isLoading} variant="destructive">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MODAL: HELP / PANDUAN --- */}
            <Dialog open={showHelp} onOpenChange={setShowHelp}>
                <DialogContent className="dark:bg-gray-900 dark:border-gray-700 sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 dark:text-white text-xl">
                            <HelpCircle className="w-6 h-6 text-indigo-600" /> Panduan Penggunaan
                        </DialogTitle>
                        <DialogDescription>
                            Berikut adalah cara menggunakan File Manager ini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2 font-semibold text-gray-800 dark:text-gray-200">
                                <UploadCloud className="w-4 h-4 text-indigo-500" /> Upload File
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Klik tombol <b>Upload</b> di pojok kanan atas, atau <b>Drag & Drop</b> file langsung dari komputer Anda ke area layar.
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2 font-semibold text-gray-800 dark:text-gray-200">
                                <FolderPlus className="w-4 h-4 text-indigo-500" /> Buat Folder
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Gunakan tombol <b>Folder</b> untuk membuat folder baru guna mengorganisir dokumen Anda.
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2 font-semibold text-gray-800 dark:text-gray-200">
                                <MoreHorizontal className="w-4 h-4 text-indigo-500" /> Aksi Folder
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Klik icon titik tiga pada folder untuk <b>Mengganti Nama (Rename)</b> atau <b>Menghapus</b> folder tersebut.
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2 font-semibold text-gray-800 dark:text-gray-200">
                                <Eye className="w-4 h-4 text-indigo-500" /> Preview File
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Klik langsung pada baris file untuk melihat <b>Preview</b> dokumen (Gambar, PDF, Audio/Video).
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setShowHelp(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">Mengerti</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- PREVIEW MODAL --- */}
            <Dialog open={previewFile !== null} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-none">
                    <DialogHeader className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-row items-center justify-between space-y-0">
                        <DialogTitle className="text-base truncate flex items-center gap-2 dark:text-white">
                            {previewFile && getFileIcon(previewFile.mime_type, "w-5 h-5")}
                            {previewFile?.name}
                        </DialogTitle>
                        <Button variant="ghost" size="icon" onClick={() => setPreviewFile(null)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                            <X className="w-5 h-5" />
                        </Button>
                    </DialogHeader>
                    <div className="p-4 flex items-center justify-center bg-gray-100 dark:bg-black min-h-[400px]">
                        {previewFile && renderPreviewContent(previewFile)}
                    </div>
                    <DialogFooter className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
                        <Button onClick={() => previewFile && window.open(previewFile.url, '_blank')} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Download className="w-4 h-4 mr-2" /> Download File
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
