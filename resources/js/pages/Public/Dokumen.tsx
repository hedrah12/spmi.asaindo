import React, { useState, useEffect } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import {
  FileText,
  ExternalLink,
  Search,
  Folder,
  ChevronRight,
  Home,
  ArrowRight,
  File
} from 'lucide-react'

// Layout & Components (Pastikan path import sesuai struktur project Anda)
import LandingLayout from '@/layouts/LandingLayout'
import { type SharedData } from '@/types'

interface DocItem {
  id: number
  name: string
  url?: string
  type: 'folder' | 'file'
  created_at: string
}

interface Props {
  items: DocItem[]
  currentFolder: DocItem | null
  ancestors: DocItem[]
}

export default function DokumenPage({
  items,
  currentFolder,
  ancestors,
}: Props) {
  const { setting } = usePage<SharedData>().props
  const primaryColor = setting?.warna || '#2563eb' // Ambil warna dari setting global
  const [search, setSearch] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animasi muncul saat load
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const filteredItems = items.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  )

  const navigateTo = (folderId: number | null) => {
    router.get('/dokumen', { folder: folderId }, { preserveState: true })
  }

  // --- Ikon Helper ---
  const getIcon = (type: 'folder' | 'file', size = 'w-6 h-6') => {
    if (type === 'folder') {
      return <Folder className={`${size}`} style={{ color: '#F59E0B' }} fill="#FEF3C7" />
    }
    return <FileText className={`${size}`} style={{ color: primaryColor }} />
  }

  return (
    <>
      <Head title="Dokumen Publik - Universitas Asa Indonesia" />

      {/* Gunakan Layout yang sama dengan Welcome agar Header/Footer konsisten */}
      <LandingLayout>

        {/* --- HERO SECTION (Minimalis) --- */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Background Blob Animation */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    Arsip <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` }}>Dokumen Publik</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    Akses berbagai dokumen resmi, panduan, dan regulasi akademik secara terbuka dan transparan.
                </p>
            </div>
        </section>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="min-h-[60vh] bg-white dark:bg-gray-950 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

            {/* --- TOOLBAR CARD --- */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-500">

                {/* Breadcrumbs */}
                <nav className="flex items-center flex-wrap gap-2 text-sm w-full md:w-auto overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => navigateTo(null)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        <span className="sr-only">Home</span>
                    </button>

                    {ancestors.map((crumb) => (
                        <React.Fragment key={crumb.id}>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <button
                                onClick={() => navigateTo(crumb.id)}
                                className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium whitespace-nowrap transition-colors"
                            >
                                {crumb.name}
                            </button>
                        </React.Fragment>
                    ))}

                    {currentFolder && (
                        <>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <span className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold whitespace-nowrap border border-indigo-100 dark:border-indigo-800">
                                {currentFolder.name}
                            </span>
                        </>
                    )}
                </nav>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border-none bg-gray-100 dark:bg-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all placeholder-gray-500"
                        placeholder="Cari nama dokumen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* --- CONTENT GRID --- */}
            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Folder className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Folder Kosong</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Belum ada dokumen atau folder di sini.</p>
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:underline"
                        >
                            Hapus pencarian
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {filteredItems.map((item) => (
                        item.type === 'folder' ? (
                            // --- FOLDER CARD ---
                            <button
                                key={item.id}
                                onClick={() => navigateTo(item.id)}
                                className="group relative bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Folder className="w-6 h-6 text-yellow-500 fill-yellow-100 dark:fill-yellow-900" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Folder</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                                </div>
                            </button>
                        ) : (
                            // --- FILE CARD ---
                            <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex flex-col bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`} style={{ backgroundColor: `${primaryColor}15` }}>
                                        <FileText className="w-6 h-6" style={{ color: primaryColor }} />
                                    </div>
                                    <div className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600 transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors mb-2">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3 mt-2">
                                        <span>Dokumen Publik</span>
                                        <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-500" />
                                    </div>
                                </div>
                            </a>
                        )
                    ))}
                </div>
            )}
          </div>
        </main>

      </LandingLayout>
    </>
  )
}
