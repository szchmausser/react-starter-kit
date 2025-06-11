import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

export default function IndividualsCreate() {
    const [formData, setFormData] = useState({
        national_id: '',
        passport: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        second_last_name: '',
        birth_date: '',
        gender: '',
        civil_status: '',
        rif: '',
        email_1: '',
        email_2: '',
        phone_number_1: '',
        phone_number_2: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        country: 'Venezuela',
        nationality: 'Venezolana',
        occupation: '',
        educational_level: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Inicio',
            href: route('search.index'),
        },
        {
            title: 'Personas Naturales',
            href: route('individuals.index'),
        },
        {
            title: 'Nueva Persona',
            href: route('individuals.create'),
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

        router.post(route('individuals.store'), formData, {
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
            <Head title="Nueva Persona Natural" />

            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <h2 className="mb-4 text-xl font-semibold">Crear Nueva Persona Natural</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Información Básica */}
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Información Básica</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="national_id">Cédula de Identidad *</Label>
                                        <Input
                                            id="national_id"
                                            name="national_id"
                                            value={formData.national_id}
                                            onChange={handleChange}
                                            placeholder="V-12345678"
                                            required
                                            className={`${errors.national_id ? 'border-red-500' : ''}`}
                                        />
                                        {errors.national_id && <p className="text-sm text-red-500">{errors.national_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="passport">Pasaporte</Label>
                                        <Input
                                            id="passport"
                                            name="passport"
                                            value={formData.passport}
                                            onChange={handleChange}
                                            placeholder="ABC123456"
                                            className={`${errors.passport ? 'border-red-500' : ''}`}
                                        />
                                        {errors.passport && <p className="text-sm text-red-500">{errors.passport}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">Primer Nombre *</Label>
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            placeholder="Juan"
                                            required
                                            className={`${errors.first_name ? 'border-red-500' : ''}`}
                                        />
                                        {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="middle_name">Segundo Nombre</Label>
                                        <Input
                                            id="middle_name"
                                            name="middle_name"
                                            value={formData.middle_name}
                                            onChange={handleChange}
                                            placeholder="José"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Primer Apellido *</Label>
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            placeholder="Pérez"
                                            required
                                            className={`${errors.last_name ? 'border-red-500' : ''}`}
                                        />
                                        {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="second_last_name">Segundo Apellido</Label>
                                        <Input
                                            id="second_last_name"
                                            name="second_last_name"
                                            value={formData.second_last_name}
                                            onChange={handleChange}
                                            placeholder="García"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Información Personal */}
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Información Personal</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                                        <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Género</Label>
                                        <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar género" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Masculino</SelectItem>
                                                <SelectItem value="female">Femenino</SelectItem>
                                                <SelectItem value="other">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="civil_status">Estado Civil</Label>
                                        <Select value={formData.civil_status} onValueChange={(value) => handleSelectChange('civil_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar estado civil" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="single">Soltero(a)</SelectItem>
                                                <SelectItem value="married">Casado(a)</SelectItem>
                                                <SelectItem value="divorced">Divorciado(a)</SelectItem>
                                                <SelectItem value="widowed">Viudo(a)</SelectItem>
                                                <SelectItem value="cohabiting">Concubinato</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rif">RIF</Label>
                                        <Input
                                            id="rif"
                                            name="rif"
                                            value={formData.rif}
                                            onChange={handleChange}
                                            placeholder="J-12345678-9"
                                            className={`${errors.rif ? 'border-red-500' : ''}`}
                                        />
                                        {errors.rif && <p className="text-sm text-red-500">{errors.rif}</p>}
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
                                            placeholder="ejemplo@correo.com"
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
                                            placeholder="ejemplo2@correo.com"
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
                                            placeholder="+58 412 1234567"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone_number_2">Teléfono Secundario</Label>
                                        <Input
                                            id="phone_number_2"
                                            name="phone_number_2"
                                            value={formData.phone_number_2}
                                            onChange={handleChange}
                                            placeholder="+58 212 1234567"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dirección */}
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Dirección</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address_line_1">Dirección Línea 1</Label>
                                        <Input
                                            id="address_line_1"
                                            name="address_line_1"
                                            value={formData.address_line_1}
                                            onChange={handleChange}
                                            placeholder="Av. Principal, Edificio/Casa"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address_line_2">Dirección Línea 2</Label>
                                        <Input
                                            id="address_line_2"
                                            name="address_line_2"
                                            value={formData.address_line_2}
                                            onChange={handleChange}
                                            placeholder="Apto. 123, Referencia"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">Ciudad</Label>
                                        <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Caracas" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state">Estado</Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="Distrito Capital"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Información Adicional */}
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Información Adicional</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="nationality">Nacionalidad</Label>
                                        <Input
                                            id="nationality"
                                            name="nationality"
                                            value={formData.nationality}
                                            onChange={handleChange}
                                            placeholder="Venezolana"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="occupation">Profesión u Ocupación</Label>
                                        <Input
                                            id="occupation"
                                            name="occupation"
                                            value={formData.occupation}
                                            onChange={handleChange}
                                            placeholder="Abogado, Médico, etc."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="educational_level">Nivel Educativo</Label>
                                        <Input
                                            id="educational_level"
                                            name="educational_level"
                                            value={formData.educational_level}
                                            onChange={handleChange}
                                            placeholder="Universitario, Técnico, etc."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Crear Persona Natural
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
