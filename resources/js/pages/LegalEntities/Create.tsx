import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface Props {
    representatives: {
        id: number;
        first_name: string;
        last_name: string;
        national_id: string;
    }[];
}

export default function LegalEntitiesCreate({ representatives }: Props) {
    const [formData, setFormData] = useState({
        rif: '',
        business_name: '',
        trade_name: '',
        legal_entity_type: '',
        registration_number: '',
        registration_date: '',
        fiscal_address_line_1: '',
        fiscal_address_line_2: '',
        fiscal_city: '',
        fiscal_state: '',
        fiscal_country: 'Venezuela',
        email_1: '',
        email_2: '',
        phone_number_1: '',
        phone_number_2: '',
        website: '',
        legal_representative_id: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inicio',
            href: route('search.index'),
        },
        {
            title: 'Entidades Legales',
            href: route('legal-entities.index'),
        },
        {
            title: 'Nueva Entidad',
            href: route('legal-entities.create'),
        },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route('legal-entities.store'), formData, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Entidad Legal" />

            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <h2 className="mb-4 text-xl font-semibold">Crear Entidad Legal</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Información Básica */}
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Información Básica</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="rif">RIF *</Label>
                                        <Input
                                            id="rif"
                                            name="rif"
                                            value={formData.rif}
                                            onChange={handleChange}
                                            placeholder="J-12345678-9"
                                            required
                                            className={`${errors.rif ? 'border-red-500' : ''}`}
                                        />
                                        {errors.rif && <p className="text-sm text-red-500">{errors.rif}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="business_name">Nombre Comercial *</Label>
                                        <Input
                                            id="business_name"
                                            name="business_name"
                                            value={formData.business_name}
                                            onChange={handleChange}
                                            placeholder="Empresa S.A."
                                            required
                                            className={`${errors.business_name ? 'border-red-500' : ''}`}
                                        />
                                        {errors.business_name && <p className="text-sm text-red-500">{errors.business_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="trade_name">Nombre Comercial (Marca)</Label>
                                        <Input
                                            id="trade_name"
                                            name="trade_name"
                                            value={formData.trade_name}
                                            onChange={handleChange}
                                            placeholder="Nombre de marca comercial"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="legal_entity_type">Tipo de Entidad Legal *</Label>
                                        <Select
                                            value={formData.legal_entity_type}
                                            onValueChange={(value) => handleSelectChange('legal_entity_type', value)}
                                            required
                                        >
                                            <SelectTrigger className={`${errors.legal_entity_type ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder="Seleccionar tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sociedad_anonima">Sociedad Anónima (S.A.)</SelectItem>
                                                <SelectItem value="compania_anonima">Compañía Anónima (C.A.)</SelectItem>
                                                <SelectItem value="sociedad_de_responsabilidad_limitada">
                                                    Sociedad de Responsabilidad Limitada (S.R.L.)
                                                </SelectItem>
                                                <SelectItem value="cooperativa">Cooperativa</SelectItem>
                                                <SelectItem value="fundacion">Fundación</SelectItem>
                                                <SelectItem value="asociacion_civil">Asociación Civil</SelectItem>
                                                <SelectItem value="otro">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.legal_entity_type && <p className="text-sm text-red-500">{errors.legal_entity_type}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Información de Registro */}
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Información de Registro</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="registration_number">Número de Registro</Label>
                                        <Input
                                            id="registration_number"
                                            name="registration_number"
                                            value={formData.registration_number}
                                            onChange={handleChange}
                                            placeholder="123456"
                                            className={`${errors.registration_number ? 'border-red-500' : ''}`}
                                        />
                                        {errors.registration_number && <p className="text-sm text-red-500">{errors.registration_number}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="registration_date">Fecha de Registro</Label>
                                        <Input
                                            id="registration_date"
                                            name="registration_date"
                                            type="date"
                                            value={formData.registration_date}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="legal_representative_id">Representante Legal</Label>
                                        <Select
                                            value={formData.legal_representative_id}
                                            onValueChange={(value) => handleSelectChange('legal_representative_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar representante" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {representatives.map((rep) => (
                                                    <SelectItem key={rep.id} value={String(rep.id)}>
                                                        {rep.first_name} {rep.last_name} ({rep.national_id})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Dirección Fiscal */}
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Dirección Fiscal</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="fiscal_address_line_1">Dirección Línea 1 *</Label>
                                        <Input
                                            id="fiscal_address_line_1"
                                            name="fiscal_address_line_1"
                                            value={formData.fiscal_address_line_1}
                                            onChange={handleChange}
                                            placeholder="Av. Principal, Edificio/Casa"
                                            required
                                            className={`${errors.fiscal_address_line_1 ? 'border-red-500' : ''}`}
                                        />
                                        {errors.fiscal_address_line_1 && <p className="text-sm text-red-500">{errors.fiscal_address_line_1}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="fiscal_address_line_2">Dirección Línea 2</Label>
                                        <Input
                                            id="fiscal_address_line_2"
                                            name="fiscal_address_line_2"
                                            value={formData.fiscal_address_line_2}
                                            onChange={handleChange}
                                            placeholder="Oficina 123, Referencia"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fiscal_city">Ciudad *</Label>
                                        <Input
                                            id="fiscal_city"
                                            name="fiscal_city"
                                            value={formData.fiscal_city}
                                            onChange={handleChange}
                                            placeholder="Caracas"
                                            required
                                            className={`${errors.fiscal_city ? 'border-red-500' : ''}`}
                                        />
                                        {errors.fiscal_city && <p className="text-sm text-red-500">{errors.fiscal_city}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fiscal_state">Estado *</Label>
                                        <Input
                                            id="fiscal_state"
                                            name="fiscal_state"
                                            value={formData.fiscal_state}
                                            onChange={handleChange}
                                            placeholder="Distrito Capital"
                                            required
                                            className={`${errors.fiscal_state ? 'border-red-500' : ''}`}
                                        />
                                        {errors.fiscal_state && <p className="text-sm text-red-500">{errors.fiscal_state}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Información de Contacto */}
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Información de Contacto</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email_1">Correo Electrónico Principal</Label>
                                        <Input
                                            id="email_1"
                                            name="email_1"
                                            type="email"
                                            value={formData.email_1}
                                            onChange={handleChange}
                                            placeholder="contacto@empresa.com"
                                            className={`${errors.email_1 ? 'border-red-500' : ''}`}
                                        />
                                        {errors.email_1 && <p className="text-sm text-red-500">{errors.email_1}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email_2">Correo Electrónico Secundario</Label>
                                        <Input
                                            id="email_2"
                                            name="email_2"
                                            type="email"
                                            value={formData.email_2}
                                            onChange={handleChange}
                                            placeholder="ventas@empresa.com"
                                            className={`${errors.email_2 ? 'border-red-500' : ''}`}
                                        />
                                        {errors.email_2 && <p className="text-sm text-red-500">{errors.email_2}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone_number_1">Teléfono Principal</Label>
                                        <Input
                                            id="phone_number_1"
                                            name="phone_number_1"
                                            value={formData.phone_number_1}
                                            onChange={handleChange}
                                            placeholder="+58 212 1234567"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone_number_2">Teléfono Secundario</Label>
                                        <Input
                                            id="phone_number_2"
                                            name="phone_number_2"
                                            value={formData.phone_number_2}
                                            onChange={handleChange}
                                            placeholder="+58 412 1234567"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="website">Sitio Web</Label>
                                        <Input
                                            id="website"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="https://www.empresa.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Crear Entidad Legal
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
