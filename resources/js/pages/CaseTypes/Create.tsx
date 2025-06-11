import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('case-types.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Crear Tipo de Caso" />

            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <h2 className="mb-4 text-xl font-semibold">Crear Nuevo Tipo de Caso</h2>

                        <form onSubmit={submit} className="mt-6 space-y-6">
                            <div>
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    className="mt-1 block w-full"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Crear Tipo de Caso
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
