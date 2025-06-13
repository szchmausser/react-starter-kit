import { PageProps as InertiaPageProps } from '@inertiajs/core';

// Tipos base
export interface PageProps extends InertiaPageProps {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
        };
    };
    errors?: {
        [key: string]: string;
    };
}

export interface NavItem {
    title: string;
    icon: React.ComponentType;
    href: string;
    children?: NavItem[];
}

export interface TagModel {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface BreadcrumbItem {
    href: string;
    title: string;
    current?: boolean;
}

export interface CaseType {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedQueryResult<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    first_page_url: string | null;
    from: number;
    last_page: number;
    last_page_url: string | null;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
