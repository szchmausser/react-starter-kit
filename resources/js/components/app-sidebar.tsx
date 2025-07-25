import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { TodoFloatingPanel } from '@/components/ui/TodoFloatingPanel';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Building, Calendar, ChevronsUpDown, FileImage, Folder, LayoutGrid, Search, Tag, Users } from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Búsqueda',
        href: '/search',
        icon: Search,
    },
    {
        title: 'Expedientes Legales',
        href: route('legal-cases.index'),
        icon: Folder,
    },
    {
        title: 'Lapsos Procesales',
        href: route('legal-cases.important-dates.list'),
        icon: Calendar,
    },
    {
        title: 'Personas Naturales',
        href: route('individuals.index'),
        icon: Users,
    },
    {
        title: 'Entidades Legales',
        href: route('legal-entities.index'),
        icon: Building,
    },
    {
        title: 'Tipos de Caso',
        href: route('case-types.index'),
        icon: BookOpen,
    },
    {
        title: 'Estatus',
        href: route('status-lists.index'),
        icon: ChevronsUpDown,
    },
    {
        title: 'Etiquetas',
        href: route('tags.index'),
        icon: Tag,
    },
    {
        title: 'Biblioteca de Archivos',
        href: route('media-library.index'),
        icon: FileImage,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const [todoOpen, setTodoOpen] = useState(false);
    return (
        <>
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/dashboard" prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={mainNavItems} onOpenTodoPanel={() => setTodoOpen(true)} />
                </SidebarContent>

                <SidebarFooter>
                    <NavFooter items={footerNavItems} className="mt-auto" />
                    <NavUser />
                </SidebarFooter>
            </Sidebar>
            <TodoFloatingPanel open={todoOpen} onClose={() => setTodoOpen(false)} />
        </>
    );
}
