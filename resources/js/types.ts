import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { ComponentProps } from 'react';

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
