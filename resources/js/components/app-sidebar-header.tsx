import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import AppearanceDropdown from '@/components/appearance-dropdown';
import { router, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';


export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
  // 1. Mengambil data auth dari Global Props (Middleware HandleInertiaRequests)
  const { auth } = usePage<SharedData>().props;

  // Fallback ke array kosong/string kosong jika data belum siap
  const roles = auth.roles || [];
  const activeRole = auth.active_role || '';

  // 2. Handler untuk melakukan switching role ke Backend
  const handleRoleChange = (newRole: string) => {
    router.post('/switch-role', { role: newRole }, {
      preserveScroll: true, // Agar halaman tidak scroll ke atas saat reload
      onSuccess: () => {
        // Reload parsial: Hanya refresh data user & role tanpa reload seluruh halaman
        router.reload({ only: ['auth'] });
      },
    });
  };

  // Helper function untuk memformat teks (misal: "admin" -> "Admin")
  const formatRoleName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between px-6 md:px-4 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 ">
      {/* Left: Sidebar Trigger + Breadcrumb */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      {/* Right: Role Switcher + Theme */}
      <div className="flex items-center gap-4">

        {/* LOGIKA TAMPILAN ROLE SWITCHER:
            Hanya tampilkan Dropdown jika user memiliki LEBIH DARI 1 role.
            Jika cuma 1 role, tampilkan teks biasa (badge) agar UI lebih bersih.
        */}
        {roles.length > 1 ? (
          <Select value={activeRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[140px] h-9">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Pilih Role" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {formatRoleName(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          // Tampilan jika user hanya punya 1 role (Read-only)
          <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground bg-muted/50 rounded-md border border-transparent">
             <ShieldCheck className="h-4 w-4" />
             <span>{formatRoleName(activeRole)}</span>
          </div>
        )}

        {/* Theme Switcher Tetap Ada */}
        <AppearanceDropdown />
      </div>
    </header>
  );
}
