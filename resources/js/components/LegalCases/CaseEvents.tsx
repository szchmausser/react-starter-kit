import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { router, useForm } from '@inertiajs/react';
import { Edit } from 'lucide-react';
import React, { useState } from 'react';

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
    const [expanded, setExpanded] = useState<{ [id: number]: boolean }>({});
    const [expandedTitles, setExpandedTitles] = useState<{ [id: number]: boolean }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEvent) {
            router.put(
                route('case-events.update', [legalCase.id, editingEvent.id]),
                {
                    title,
                    description,
                    date,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        setTitle('');
                        setDescription('');
                        setDate('');
                        setEditingEvent(null);
                        reset();
                    },
                },
            );
        } else {
            router.post(
                route('case-events.store', legalCase.id),
                {
                    title,
                    description,
                    date,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        setTitle('');
                        setDescription('');
                        setDate('');
                        reset();
                    },
                },
            );
        }
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setTitle(event.title);
        setDescription(event.description);
        const dateValue = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
        setDate(dateValue);
        setIsDialogOpen(true);
    };

    const handleDelete = (eventId: number) => {
        if (confirm('¿Seguro que deseas eliminar este evento?')) {
            router.delete(route('case-events.destroy', [legalCase.id, eventId]), {
                preserveScroll: true,
            });
        }
    };

    const toggleExpand = (id: number) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleTitleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedTitles((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="overflow-hidden rounded-md border dark:border-zinc-700">
            <div
                className="flex cursor-pointer items-center justify-between bg-gray-100 px-4 py-2 font-medium select-none dark:bg-zinc-900"
                onClick={() => setCollapsed((v) => !v)}
            >
                <div className="flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-800 dark:text-gray-200">Cronología del expediente</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingEvent(null);
                            setIsDialogOpen(true);
                        }}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Nuevo Evento"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                        >
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <path d="M3 10h18"></path>
                            <rect width="18" height="16" x="3" y="4" rx="2"></rect>
                            <path d="M12 14v4"></path>
                            <path d="M10 16h4"></path>
                        </svg>
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title={collapsed ? 'Mostrar eventos' : 'Ocultar eventos'}
                        onClick={(e) => {
                            e.stopPropagation();
                            setCollapsed((v) => !v);
                        }}
                    >
                        {collapsed ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                <path
                                    fillRule="evenodd"
                                    d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                <path
                                    fillRule="evenodd"
                                    d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                                    clipRule="evenodd"
                                />
                                <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                            </svg>
                        )}
                    </Button>
                </div>
            </div>
            {!collapsed && (
                <div className="p-4 dark:bg-zinc-900">
                    {events.length > 0 ? (
                        <div className="space-y-4">
                            {events.map((event) => {
                                const isExpanded = expanded[event.id];
                                const isTitleExpanded = expandedTitles[event.id];
                                const preview = event.description.length > 300 ? event.description.slice(0, 300) + '...' : event.description;
                                return (
                                    <div
                                        key={event.id}
                                        className="flex flex-col gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
                                    >
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex min-w-0 flex-1 items-center">
                                                <div className="mr-3 flex-shrink-0 rounded-md bg-gray-100 p-2 dark:bg-zinc-800/70">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="h-5 w-5 text-teal-500 dark:text-green-500"
                                                    >
                                                        <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path>
                                                        <path d="M16 2v4"></path>
                                                        <path d="M8 2v4"></path>
                                                        <path d="M3 10h7"></path>
                                                        <path d="M21 16.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"></path>
                                                        <path d="M16.5 14.5v4"></path>
                                                        <path d="M14.5 16.5h4"></path>
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div
                                                        onClick={(e) => toggleTitleExpand(event.id, e)}
                                                        className={`-mx-2 -my-1 cursor-pointer rounded px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-700/70`}
                                                        title="Haz clic para expandir/contraer el título"
                                                    >
                                                        <span className={`block text-base font-semibold ${isTitleExpanded ? '' : 'truncate'}`}>
                                                            {event.title}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 self-end rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium dark:bg-zinc-700">
                                                <span className="text-gray-600 dark:text-gray-300">
                                                    {event.date
                                                        ? (() => {
                                                              const [year, month, day] = event.date.substring(0, 10).split('-');
                                                              return `${day}/${month}/${year}`;
                                                          })()
                                                        : 'Sin fecha'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="border-l-2 border-gray-200 py-1 pl-4 text-sm whitespace-pre-line text-gray-600 dark:border-gray-700 dark:text-gray-400">
                                            {isExpanded ? event.description : preview}
                                            {event.description.length > 300 && (
                                                <button
                                                    className="ml-2 text-xs text-blue-600 underline focus:outline-none dark:text-blue-400"
                                                    onClick={() => toggleExpand(event.id)}
                                                >
                                                    {isExpanded ? 'Ver menos' : 'Ver más'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="mt-1 flex flex-col gap-2 border-t border-gray-200 pt-2 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="mr-1 h-4 w-4 text-gray-400"
                                                >
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                                Registrado por: <span className="ml-1 font-medium">{event.user.name}</span>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(event)}
                                                    title="Editar"
                                                    className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                                >
                                                    <Edit className="h-6 w-6" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(event.id)}
                                                    title="Eliminar"
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="h-5 w-5"
                                                    >
                                                        <path d="M3 6h18"></path>
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                    </svg>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-10 dark:border-gray-700 dark:bg-zinc-800">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
                            >
                                <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path>
                                <path d="M16 2v4"></path>
                                <path d="M8 2v4"></path>
                                <path d="M3 10h7"></path>
                            </svg>
                            <p className="mb-2 text-center font-medium text-gray-500 dark:text-gray-400">No hay eventos registrados</p>
                            <p className="mb-4 text-center text-sm text-gray-400 dark:text-gray-500">
                                Haga clic en el botón + para añadir un nuevo evento a la cronología
                            </p>
                            <Button
                                onClick={() => {
                                    setEditingEvent(null);
                                    setIsDialogOpen(true);
                                }}
                                variant="outline"
                                className="bg-white dark:bg-zinc-800"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-2 h-4 w-4"
                                >
                                    <path d="M12 5v14"></path>
                                    <path d="M5 12h14"></path>
                                </svg>
                                Nuevo evento
                            </Button>
                        </div>
                    )}
                </div>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? 'Editar Evento' : 'Registrar Nuevo Evento'}</DialogTitle>
                        <DialogDescription>
                            {editingEvent
                                ? 'Modifique los detalles del evento seleccionado.'
                                : 'Complete los detalles del nuevo evento para el expediente.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Título</label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={255} />
                            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Descripción</label>
                            <textarea
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={6}
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Fecha</label>
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={processing}>
                                {editingEvent ? 'Actualizar' : 'Guardar Evento'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
