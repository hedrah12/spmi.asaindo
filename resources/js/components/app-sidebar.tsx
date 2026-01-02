import { useState } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { usePage, Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import { NavUser } from '@/components/nav-user';
import { iconMapper } from '@/lib/iconMapper';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
    id: number;
    title: string;
    route: string | null;
    icon: string;
    children?: MenuItem[];
}

function RenderMenu({ items, level = 0 }: { items: MenuItem[]; level?: number }) {
    const { url: currentUrl } = usePage();

    // State untuk dropdown, default terbuka jika anak aktif
    const [openMenus, setOpenMenus] = useState<{ [key: number]: boolean }>(() => {
        const initialState: { [key: number]: boolean } = {};

        const checkActive = (menuList: MenuItem[]) => {
            menuList.forEach((menu) => {
                if (!menu) return;
                const children = Array.isArray(menu.children) ? menu.children.filter(Boolean) : [];
                if (children.length > 0) {
                    const isChildActive = children.some(
                        (child) =>
                            child.route && currentUrl.startsWith(child.route) ||
                            (child.children && child.children.some(grand => grand.route && currentUrl.startsWith(grand.route)))
                    );
                    initialState[menu.id] = isChildActive;
                    checkActive(children); // cek rekursif untuk level lebih dalam
                }
            });
        };

        checkActive(items);
        return initialState;
    });

    const toggleMenu = (id: number) => {
        setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <>
            {items.map((menu) => {
                if (!menu) return null;
                const Icon = iconMapper(menu.icon || 'Folder') as LucideIcon;
                const children = Array.isArray(menu.children) ? menu.children.filter(Boolean) : [];
                const hasChildren = children.length > 0;
                const isActive = menu.route && currentUrl.startsWith(menu.route);
                const isOpen = !!openMenus[menu.id];
                const indentClass = level > 0 ? `pl-${4 + level * 3}` : '';

                const activeClass = isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';

                if (!menu.route && !hasChildren) return null;

                return (
                    <SidebarMenuItem key={menu.id}>
                        {hasChildren ? (
                            <>
                                <SidebarMenuButton
                                    onClick={() => toggleMenu(menu.id)}
                                    className={cn(
                                        `group flex items-center justify-between rounded-md transition-colors ${indentClass}`,
                                        activeClass,
                                        level === 0 ? 'py-3 px-4 my-1' : 'py-2 px-3'
                                    )}
                                >
                                    <div className="flex items-center">
                                        <Icon className="size-4 mr-3 opacity-80 group-hover:opacity-100" />
                                        <span>{menu.title}</span>
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            'size-4 opacity-50 group-hover:opacity-70 transition-transform',
                                            isOpen ? 'rotate-0' : '-rotate-90' // tertutup: kanan, terbuka: bawah
                                        )}
                                    />
                                </SidebarMenuButton>
                                {isOpen && (
                                    <SidebarMenu className="ml-2 border-l border-muted pl-2">
                                        <RenderMenu items={children} level={level + 1} />
                                    </SidebarMenu>
                                )}
                            </>
                        ) : (
                            <SidebarMenuButton
                                asChild
                                className={cn(
                                    `group flex items-center rounded-md transition-colors ${indentClass}`,
                                    activeClass,
                                    level === 0 ? 'py-3 px-4 my-1' : 'py-2 px-3'
                                )}
                            >
                                <Link href={menu.route || '#'}>
                                    <Icon className="size-4 mr-3 opacity-80 group-hover:opacity-100" />
                                    <span>{menu.title}</span>
                                    {level > 0 && (
                                        <ChevronRight className="ml-auto size-4 opacity-0 group-hover:opacity-50" />
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                );
            })}
        </>
    );
}

export function AppSidebar() {
    const { menus = [] } = usePage().props as { menus?: MenuItem[] };
    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <SidebarHeader className="px-4 py-3 border-b">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size=" " asChild className="hover:bg-transparent">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                <SidebarMenu>
                    <RenderMenu items={menus} />
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="px-4 py-3 border-t">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
