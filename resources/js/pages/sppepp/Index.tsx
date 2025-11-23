import React, { useRef, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  File,
  FileImage,
  FileSpreadsheet,
  FolderPlus,
  UploadCloud,
  Trash2,
  Pencil,
  MoreHorizontal,
  Folder
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageProps } from "@inertiajs/core";

// --- Tipe Data ---
interface FileNode {
  id: number;
  name: string;
  url: string;
  mime_type: string;
  folder_id: number | string | null;
}

interface FolderNode {
  id: number;
  name: string;
  parent_id: number | null;
  children?: FolderNode[];
}

interface SppeppPageProps extends PageProps {
  auth: {
    user: { name: string };
    active_role?: string;
  };
  stages: string[];
  folders: FolderNode[];
  files: FileNode[];
}

// --- Helper Icon ---
function getFileIcon(mime: string) {
  if (mime.includes("pdf")) return <FileText className="w-4 h-4 text-red-500" />;
  if (mime.includes("image")) return <FileImage className="w-4 h-4 text-blue-500" />;
  if (mime.includes("sheet") || mime.includes("excel")) return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
  return <File className="w-4 h-4 text-gray-500" />;
}

// --- Komponen Utama ---
export default function SppeppIndex({ stages, folders, files }: SppeppPageProps) {
  const { auth } = usePage<SppeppPageProps>().props;

  // 🔍 VALIDASI ROLE (Case Insensitive agar aman)
  const isSuperAdmin = auth.active_role?.toLowerCase() === 'superadmin';

  // State untuk Modal
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<'create' | 'upload' | 'edit' | null>(null);
  const [inputName, setInputName] = useState('');
  const [editTarget, setEditTarget] = useState<{id: number, name: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- ACTIONS ---

  const handleCreateFolder = () => {
    router.post('/media', {
      name: inputName,
      parent_id: activeFolderId
    }, {
      onSuccess: () => { toast.success('Subfolder created'); closeModals(); },
      preserveScroll: true
    });
  };

  const handleRenameFolder = () => {
    if (!editTarget) return;
    router.put(`/media/${editTarget.id}`, {
      name: inputName
    }, {
      onSuccess: () => { toast.success('Folder renamed'); closeModals(); },
      preserveScroll: true
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const formData = new FormData();
    Array.from(e.target.files).forEach(file => formData.append('files[]', file));
    if (activeFolderId) formData.append('folder_id', activeFolderId.toString());

    router.post('/files', formData, {
      forceFormData: true,
      onSuccess: () => { toast.success('File uploaded'); closeModals(); },
      preserveScroll: true
    });
  };

  const handleDeleteFolder = (id: number) => {
    router.delete(`/media/${id}`, {
      onSuccess: () => toast.success('Folder deleted'),
      preserveScroll: true
    });
  };

  const handleDeleteFile = (id: number) => {
    router.delete(`/files/${id}`, {
      onSuccess: () => toast.success('File deleted'),
      preserveScroll: true
    });
  };

  // Helper Buka Modal
  const openCreateModal = (parentId: number) => {
    setActiveFolderId(parentId);
    setInputName('');
    setModalType('create');
  };

  const openUploadModal = (folderId: number) => {
    setActiveFolderId(folderId);
    // Trigger input file langsung
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const openEditModal = (folder: FolderNode) => {
    setEditTarget({ id: folder.id, name: folder.name });
    setInputName(folder.name);
    setModalType('edit');
  };

  const closeModals = () => {
    setModalType(null);
    setActiveFolderId(null);
    setInputName('');
    setEditTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- SUB COMPONENT: Folder Tree (Recursive) ---
  const FolderTree = ({ folder, level = 0 }: { folder: FolderNode, level?: number }) => {
    const subFolders = folders.filter(f => f.parent_id === folder.id);
    const folderFiles = files.filter(f => String(f.folder_id) === String(folder.id));

    return (
      <div className="ml-4 mt-1 border-l border-gray-200 dark:border-gray-700 pl-3">
        {/* Header Folder (Nama & Action) - Hanya tampil utk Subfolder (Level > 0) */}
        {level > 0 && (
          <div className="flex items-center justify-between group py-1">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
               <Folder className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
               {folder.name}
            </div>

            {/* Action Menu untuk Subfolder (Hanya Superadmin) */}
            {isSuperAdmin && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openCreateModal(folder.id)}>
                      <FolderPlus className="w-4 h-4 mr-2" /> New Subfolder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openUploadModal(folder.id)}>
                      <UploadCloud className="w-4 h-4 mr-2" /> Upload File
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditModal(folder)}>
                      <Pencil className="w-4 h-4 mr-2" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteFolder(folder.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        )}

        {/* File List */}
        <div className="space-y-1 my-2">
          {folderFiles.map(file => (
            <div key={file.id} className="flex items-center justify-between group p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <a href={file.url} target="_blank" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600">
                  {getFileIcon(file.mime_type)} {file.name}
                </a>
                {isSuperAdmin && (
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
            </div>
          ))}
          {folderFiles.length === 0 && subFolders.length === 0 && (
             <span className="text-xs text-gray-400 italic block py-1 ml-2">Empty</span>
          )}
        </div>

        {/* Recursive Subfolders */}
        {subFolders.map(sub => (
          <FolderTree key={sub.id} folder={sub} level={level + 1} />
        ))}
      </div>
    );
  };

  // --- SUB COMPONENT: Accordion Section ---
  const PPEPPSection = ({ title }: { title: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Cari folder root yang namanya sesuai title
    const rootFolder = folders.find(f => f.name.toLowerCase() === title.toLowerCase() && f.parent_id === null);

    return (
      <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
        <div
          className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors ${isOpen ? "bg-red-50 dark:bg-red-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
             {isOpen ? <ChevronDown className="w-5 h-5 text-gray-500"/> : <ChevronRight className="w-5 h-5 text-gray-500"/>}
             <span className="font-bold text-lg text-gray-800 dark:text-gray-100">{title}</span>
          </div>

          {/* Actions Header (Superadmin Only) */}
          {isSuperAdmin && (
             <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {rootFolder ? (
                  // Jika folder ada -> Tampilkan tombol Upload & Subfolder
                  <>
                    <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-green-200 hover:bg-green-50 text-green-700" onClick={() => openUploadModal(rootFolder.id)}>
                       <UploadCloud className="w-3 h-3" /> Upload
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-blue-200 hover:bg-blue-50 text-blue-700" onClick={() => openCreateModal(rootFolder.id)}>
                       <FolderPlus className="w-3 h-3" /> Subfolder
                    </Button>
                  </>
                ) : (
                  // Jika folder belum ada -> Tombol Aktifkan
                  <Button
                    size="sm"
                    className="h-8 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => {
                       setInputName(title); // Otomatis set nama sesuai judul
                       setActiveFolderId(null); // Root level
                       setModalType('create');
                    }}
                  >
                    <FolderPlus className="w-3 h-3" /> Aktifkan Folder
                  </Button>
                )}
             </div>
          )}
        </div>

        {isOpen && (
          <div className="p-4 bg-white dark:bg-gray-900 animate-in slide-in-from-top-1">
            {rootFolder ? (
              <FolderTree folder={rootFolder} level={0} />
            ) : (
              <div className="text-center py-8 text-gray-400 italic border-2 border-dashed rounded-lg bg-gray-50">
                <p>Folder "{title}" belum dibuat.</p>
                {isSuperAdmin && (
                   <p className="text-xs mt-1 text-gray-500">Klik tombol "Aktifkan Folder" di atas untuk memulai.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Siklus PPEPP", href: "/sppepp" }]}>
      <Head title="Siklus PPEPP" />
      <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Siklus PPEPP</h1>
            <p className="text-gray-500">Dokumen Sistem Penjaminan Mutu Internal</p>
          </div>

          {/* List Tahapan */}
          <div className="space-y-2">
            {stages.map((stage) => (
              <PPEPPSection key={stage} title={stage} />
            ))}
          </div>
        </div>

        {/* --- MODALS --- */}

        {/* Input File Hidden untuk Upload */}
        <input
           type="file"
           ref={fileInputRef}
           className="hidden"
           multiple
           onChange={(e) => { handleUpload(e); }}
        />

        {/* Modal Create Folder */}
        <Dialog open={modalType === 'create'} onOpenChange={(open) => !open && closeModals()}>
          <DialogContent>
            <DialogHeader><DialogTitle>Folder Baru</DialogTitle></DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Nama Folder"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModals}>Batal</Button>
              <Button onClick={handleCreateFolder}>Buat</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Rename Folder */}
        <Dialog open={modalType === 'edit'} onOpenChange={(open) => !open && closeModals()}>
          <DialogContent>
            <DialogHeader><DialogTitle>Ganti Nama Folder</DialogTitle></DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Nama Baru"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModals}>Batal</Button>
              <Button onClick={handleRenameFolder}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  );
}
