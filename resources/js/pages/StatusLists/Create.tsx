import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('status-lists.store'));
    };

    return (
        <AppLayout>
            <Head title="Crear Estatus" />

            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <h2 className="mb-4 text-xl font-semibold">Crear Nuevo Estatus</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción (opcional)</Label>
                                <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Crear Estatus
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
