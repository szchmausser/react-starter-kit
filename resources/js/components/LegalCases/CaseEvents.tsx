import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { router, useForm } from '@inertiajs/react';

interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    user: {
        id: number;
        name: string;
    };
}

interface Props {
    legalCase: {
        id: number;
    };
    events: Event[];
}

export const CaseEvents: React.FC<Props> = ({ legalCase, events }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const { errors, processing, reset } = useForm();
    const [collapsed, setCollapsed] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEvent) {
            router.put(route('case-events.update', [legalCase.id, editingEvent.id]), {
                title,
                description,
                date,
            }, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setTitle('');
                    setDescription('');
                    setDate('');
                    setEditingEvent(null);
                    reset();
                },
            });
        } else {
            router.post(route('case-events.store', legalCase.id), {
                title,
                description,
                date,
            }, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setTitle('');
                    setDescription('');
                    setDate('');
                    reset();
                },
            });
        }
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setTitle(event.title);
        setDescription(event.description);
        setDate(event.date);
        setIsDialogOpen(true);
    };

    const handleDelete = (eventId: number) => {
        if (confirm('¿Seguro que deseas eliminar este evento?')) {
            router.delete(route('case-events.destroy', [legalCase.id, eventId]));
        }
    };

    return (
        <div className="border dark:border-zinc-700 rounded-md overflow-hidden">
            <div className="bg-gray-100 dark:bg-zinc-900 px-4 py-2 font-medium flex items-center justify-between cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                <span className="dark:text-gray-200">Historial de Eventos</span>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={e => { e.stopPropagation(); setEditingEvent(null); setIsDialogOpen(true); }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Nuevo Evento
                    </Button>
                    <span className="ml-2">{collapsed ? '▼' : '▲'}</span>
                </div>
            </div>
            {!collapsed && (
                <div className="p-4 dark:bg-zinc-900">
                    {events.length > 0 ? (
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{event.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-400 mt-1">Registrado por: {event.user.name}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(event)} title="Editar">
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0v3.586a2 2 0 002 2h3.586a2 2 0 002-2V13" /></svg>
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(event.id)} title="Eliminar">
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                            No hay eventos registrados
                        </p>
                    )}
                </div>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? 'Editar Evento' : 'Registrar Nuevo Evento'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Título</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                maxLength={255}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Descripción</label>
                            <textarea
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                maxLength={1000}
                                rows={4}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha</label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={processing}>{editingEvent ? 'Actualizar' : 'Guardar Evento'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}; 