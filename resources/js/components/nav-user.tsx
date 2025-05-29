import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronsUpDown } from 'lucide-react';
import { useEffect } from 'react';

export function NavUser() {
    const { user, isAuthenticated, redirectToLogin } = useAuth();
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    // Verificar autenticación al montar el componente
    useEffect(() => {
        try {
            if (!isAuthenticated()) {
                redirectToLogin();
            }
        } catch (error) {
            console.error('Error al verificar autenticación en NavUser:', error);
        }
    }, []);

    // Si no hay usuario, mostrar un componente simplificado
    if (!user) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group"
                        onClick={() => {
                            try {
                                redirectToLogin();
                            } catch (error) {
                                window.location.href = '/login';
                            }
                        }}
                    >
                        <UserInfo user={null} />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group">
                            <UserInfo user={user} />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                    >
                        <UserMenuContent user={user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
