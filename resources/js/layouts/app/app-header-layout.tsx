import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { AuthMiddleware } from '@/components/auth-middleware';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

export default function AppHeaderLayout({ children, breadcrumbs }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AuthMiddleware>
            <AppShell>
                <AppHeader breadcrumbs={breadcrumbs} />
                <AppContent>{children}</AppContent>
            </AppShell>
        </AuthMiddleware>
    );
}
