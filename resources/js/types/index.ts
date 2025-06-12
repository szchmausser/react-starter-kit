export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface Individual {
    id: number;
    national_id: string;
    passport?: string | null;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    second_last_name?: string | null;
    birth_date?: string | null;
    gender?: 'male' | 'female' | 'other' | null;
    civil_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'cohabiting' | null;
    rif?: string | null;
    email_1?: string | null;
    email_2?: string | null;
    phone_number_1?: string | null;
    phone_number_2?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    nationality?: string | null;
    occupation?: string | null;
    educational_level?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface LegalEntity {
    id: number;
    rif: string;
    business_name: string;
    trade_name?: string | null;
    legal_entity_type: string;
    registration_number?: string | null;
    registration_date?: string | null;
    fiscal_address_line_1: string;
    fiscal_address_line_2?: string | null;
    fiscal_city: string;
    fiscal_state: string;
    fiscal_country?: string | null;
    email_1?: string | null;
    email_2?: string | null;
    phone_number_1?: string | null;
    phone_number_2?: string | null;
    website?: string | null;
    legal_representative_id?: number | null;
    legal_representative?: Individual | null;
    created_at?: string;
    updated_at?: string;
}

export interface Status {
    id: number;
    name: string;
    color: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CaseType {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface LegalCase {
    id: number;
    code: string;
    entry_date: string;
    sentence_date: string | null;
    closing_date: string | null;
    case_type_id: number;
    case_type: CaseType;
    individuals: Individual[];
    legal_entities: LegalEntity[];
    statuses: Status[];
    currentStatus?: {
        // Estado actual (opcional)
        id: number;
        name: string;
        reason?: string | null;
        created_at: string;
        model_type: string;
        model_id: number;
    };
    events: any[]; // TODO: Definir tipo específico para eventos
    importantDates: any[]; // TODO: Definir tipo específico para fechas importantes
    created_at: string;
    updated_at: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: React.ElementType | null;
    isActive?: boolean;
}

export interface TodoList {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    todos: Todo[];
}

export interface Todo {
    id: number;
    todo_list_id: number;
    title: string;
    is_completed: boolean;
    status_id?: number | null;
    status?: Status | null;
    due_date?: string | null;
    created_at: string;
    updated_at: string;
}
