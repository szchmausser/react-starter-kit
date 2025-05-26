import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { toast } from 'sonner';

interface Props {}

const Page = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tags.store'), {
            onSuccess: () => {
                toast.success('Etiqueta creada exitosamente');
                reset();
            },
            onError: () => {
                toast.error('Error al crear la etiqueta');
            },
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Crear Etiqueta" />

            <div className="container mx-auto py-6">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Crear Nueva Etiqueta</CardTitle>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => router.visit(route('tags.index'))}
                                >
                                    Volver al listado
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Ej: Importante, Urgente, Pendiente"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type">Tipo (opcional)</Label>
                                        <Input
                                            id="type"
                                            value={data.type}
                                            onChange={e => setData('type', e.target.value)}
                                            placeholder="Ej: prioridad, estado, categoría"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            El tipo ayuda a agrupar etiquetas similares
                                        </p>
                                        {errors.type && (
                                            <p className="text-sm text-red-500">{errors.type}</p>
                                        )}
                                    </div>
                                </div>

                                <CardFooter className="px-0 pb-0 flex justify-end gap-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => router.visit(route('tags.index'))}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Guardando...' : 'Guardar etiqueta'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

Page.layout = (page: React.ReactNode) => <AppSidebarLayout>{page}</AppSidebarLayout>;

export default Page;
