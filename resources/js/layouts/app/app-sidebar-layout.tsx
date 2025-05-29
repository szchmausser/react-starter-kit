import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AuthMiddleware } from '@/components/auth-middleware';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [], backButton }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[], backButton?: { show: boolean, onClick?: () => void, label?: string } }>) {
    return (
        <AuthMiddleware>
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} backButton={backButton} />
                    {children}
                </AppContent>
            </AppShell>
        </AuthMiddleware>
    );
}
