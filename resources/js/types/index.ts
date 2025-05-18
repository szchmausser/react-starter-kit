export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface Individual {
  id: number;
  national_id: string;
  passport?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  second_last_name?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  civil_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'cohabiting';
  rif?: string;
  email_1?: string;
  email_2?: string;
  phone_number_1?: string;
  phone_number_2?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country?: string;
  nationality?: string;
  occupation?: string;
  educational_level?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LegalEntity {
  id: number;
  rif: string;
  business_name: string;
  trade_name?: string;
  legal_entity_type: string;
  registration_number?: string;
  registration_date?: string;
  fiscal_address_line_1: string;
  fiscal_address_line_2?: string;
  fiscal_city: string;
  fiscal_state: string;
  fiscal_country?: string;
  email_1?: string;
  email_2?: string;
  phone_number_1?: string;
  phone_number_2?: string;
  website?: string;
  legal_representative_id?: number;
  legal_representative?: Individual;
  created_at?: string;
  updated_at?: string;
} 