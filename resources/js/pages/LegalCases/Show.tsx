import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { FileText, Info, FileQuestion, Users, Gavel, UserCheck, ScrollText, Building, UserCog, Eye, UserPlus, Trash2, Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { CaseEvents } from '@/components/LegalCases/CaseEvents';

interface CaseType {
    id: number;
    name: string;
    description?: string;
}

interface Individual {
    id: number;
    national_id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    second_last_name?: string;
    pivot?: {
        individual_id: number;
        legal_case_id: number;
        role?: string;
    };
}

interface LegalEntity {
    id: number;
    rif: string;
    business_name: string;
    trade_name?: string;
    pivot?: {
        legal_entity_id: number;
        legal_case_id: number;
        role?: string;
    };
}

interface LegalCase {
    id: number;
    code: string;
    entry_date: string;
    sentence_date?: string;
    closing_date?: string;
    case_type: CaseType;
    individuals: Individual[];
    legal_entities: LegalEntity[];
}

interface Props {
    legalCase: LegalCase;
    events: any[];
}

export default function LegalCaseShow({ legalCase, events }: Props) {
    const [participantToRemove, setParticipantToRemove] = useState<{id: number, type: string, name: string} | null>(null);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
    const [statusHistory, setStatusHistory] = useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusReason, setStatusReason] = useState('');
    const [creatingStatus, setCreatingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [currentStatus, setCurrentStatus] = useState<string>('');
    const [showStatusHistory, setShowStatusHistory] = useState(false);
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Búsqueda',
            href: route('search.index'),
        },
        {
            title: 'Resultados',
            href: route('search.results'),
        },
        {
            title: `Expediente: ${legalCase.code}`,
            href: route('legal-cases.show', legalCase.id),
        },
    ];

    // Función para obtener el nombre completo de un individuo
    const getFullName = (individual: Individual): string => {
        return `${individual.first_name} ${individual.middle_name || ''} ${individual.last_name} ${individual.second_last_name || ''}`.trim();
    };

    // Función para obtener el nombre de la entidad legal
    const getEntityName = (entity: LegalEntity): string => {
        return entity.trade_name 
            ? `${entity.business_name} (${entity.trade_name})`
            : entity.business_name;
    };
    
    // Combinar todas las partes y agruparlas por rol
    const getAllParties = () => {
        const parties: {[key: string]: Array<{id: number, name: string, identifier: string, type: 'individual' | 'entity', entityObj: Individual | LegalEntity}>} = {};
        
        // Procesar individuos
        legalCase.individuals.forEach(individual => {
            const role = individual.pivot?.role || 'Sin rol asignado';
            if (!parties[role]) {
                parties[role] = [];
            }
            parties[role].push({
                id: individual.id, 
                name: getFullName(individual), 
                identifier: individual.national_id,
                type: 'individual',
                entityObj: individual
            });
        });
        
        // Procesar entidades legales
        legalCase.legal_entities.forEach(entity => {
            const role = entity.pivot?.role || 'Sin rol asignado';
            if (!parties[role]) {
                parties[role] = [];
            }
            parties[role].push({
                id: entity.id, 
                name: getEntityName(entity), 
                identifier: entity.rif,
                type: 'entity',
                entityObj: entity
            });
        });
        
        return parties;
    };
    
    // Obtener todas las partes agrupadas por rol
    const partiesByRole = getAllParties();
    
    // Orden de roles para mostrar en la interfaz
    const roleOrder = [
        'Juez', 
        'Solicitante', 
        'Abogado de Solicitante',
        'Demandado',
        'Abogado de Demandado',
        'Testigo',
        'Sin rol asignado'
    ];
    
    // Función para obtener el icono según el rol
    const getRoleIcon = (role: string) => {
        switch(role) {
            case 'Juez': 
                return <Gavel className="h-5 w-5 text-purple-500" aria-hidden="true" />;
            case 'Solicitante': 
                return <UserCheck className="h-5 w-5 text-blue-500" aria-hidden="true" />;
            case 'Abogado de Solicitante':
                return <UserCog className="h-5 w-5 text-blue-700" aria-hidden="true" />;
            case 'Demandado':
                return <Users className="h-5 w-5 text-orange-500" aria-hidden="true" />;
            case 'Abogado de Demandado':
                return <UserCog className="h-5 w-5 text-orange-700" aria-hidden="true" />;
            case 'Testigo':
                return <Eye className="h-5 w-5 text-green-500" aria-hidden="true" />;
            default:
                return <Users className="h-5 w-5 text-gray-500" aria-hidden="true" />;
        }
    };

    // Función para manejar la eliminación de un participante
    const confirmRemoveParticipant = (id: number, type: 'individual' | 'entity', name: string) => {
        setParticipantToRemove({ id, type, name });
        setIsRemoveDialogOpen(true);
    };
    
    const handleRemoveParticipant = () => {
        if (participantToRemove) {
            router.delete(route('case-participants.remove', legalCase.id), {
                data: {
                    type: participantToRemove.type,
                    id: participantToRemove.id
                }
            });
        }
        setIsRemoveDialogOpen(false);
    };

    useEffect(() => {
        fetch(route('legal-cases.statuses', legalCase.id))
            .then(res => res.json())
            .then(data => {
                setStatusHistory(data);
                setCurrentStatus(data[0]?.name || '');
            });
        fetch(route('legal-cases.available-statuses'))
            .then(res => res.json())
            .then(setAvailableStatuses);
    }, [legalCase.id]);

    const handleStatusChange = () => {
        const statusToSet = creatingStatus ? newStatus : selectedStatus;
        if (!statusToSet) {
            toast.error('Debes seleccionar o crear un estatus.');
            return;
        }
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        fetch(route('legal-cases.set-status', legalCase.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || ''
            },
            credentials: 'same-origin',
            body: JSON.stringify({ status: statusToSet, reason: statusReason })
        })
        .then(res => res.json())
        .then(() => {
            setStatusDialogOpen(false);
            setStatusReason('');
            setNewStatus('');
            setCreatingStatus(false);
            // Refrescar historial y estatus actual
            fetch(route('legal-cases.statuses', legalCase.id))
                .then(res => res.json())
                .then(data => {
                    setStatusHistory(data);
                    setCurrentStatus(data[0]?.name || '');
                });
            toast.success('Estatus actualizado');
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detalle del Expediente: ${legalCase.code}`} />
            <div className="p-4 sm:p-6">
                <div className="bg-white dark:bg-zinc-900 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-4 sm:p-6 text-gray-900 dark:text-gray-100">
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold text-center uppercase">DETALLE DEL EXPEDIENTE</h1>
                        </div>
                        
                        {/* Renderizar la tarjeta de Información General */}
                        <div className="mb-6 border dark:border-zinc-700 rounded-md overflow-hidden">
                            <div className="bg-gray-100 dark:bg-zinc-900 px-4 py-2 font-medium flex items-center">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" aria-hidden="true" />
                                <span className="dark:text-gray-200">Información General</span>
                            </div>
                            <div className="p-4 dark:bg-zinc-900">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <strong>Código de Expediente:</strong> {legalCase.code}
                                    </div>
                                    <div>
                                        <strong>Tipo de Caso:</strong> {legalCase.case_type.name}
                                    </div>
                                    <div>
                                        <strong>Fecha de Entrada:</strong> {formatDate(legalCase.entry_date)}
                                    </div>
                                    <div>
                                        <strong>Fecha de Sentencia:</strong> {formatDate(legalCase.sentence_date)}
                                    </div>
                                    <div>
                                        <strong>Fecha de Cierre:</strong> {formatDate(legalCase.closing_date)}
                                    </div>
                                    <div>
                                        <strong>Estado:</strong>
                                        <span
                                            className={`ml-2 px-2 py-1 text-sm rounded-full cursor-pointer inline-flex items-center gap-1 ${legalCase.closing_date ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'}`}
                                            onClick={() => setStatusDialogOpen(true)}
                                            title="Cambiar estatus"
                                        >
                                            {currentStatus || (legalCase.closing_date ? 'Cerrado' : 'Activo')}
                                            <Pencil className="h-4 w-4 ml-1 text-gray-400 hover:text-blue-500 transition-colors" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Sección para todas las partes relacionadas */}
                        <div className="mb-6">
                            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
                                <h2 className="text-xl font-bold text-center uppercase">PARTES RELACIONADAS</h2>
                                {!legalCase.closing_date && (
                                    <Button
                                        onClick={() => router.visit(route('case-participants.add-form', legalCase.id))}
                                        className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white mt-2 sm:mt-0"
                                        size="sm"
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Añadir Participante
                                    </Button>
                                )}
                            </div>
                            
                            {Object.keys(partiesByRole).length > 0 ? (
                                <div className="space-y-6">
                                    {roleOrder.map(role => {
                                        // Solo mostrar roles que tengan partes asignadas
                                        if (!partiesByRole[role] || partiesByRole[role].length === 0) return null;
                                        
                                        return (
                                            <div key={role} className="border dark:border-zinc-700 rounded-md overflow-hidden">
                                                <div className="bg-gray-100 dark:bg-zinc-900 px-4 py-2 font-medium flex items-center">
                                                    {getRoleIcon(role)}
                                                    <span className="ml-2 dark:text-gray-200">{role}</span>
                                                </div>
                                                <div className="divide-y divide-gray-200 dark:divide-zinc-800 dark:bg-zinc-900">
                                                    {partiesByRole[role].map(party => (
                                                        <div key={`${party.type}-${party.id}`} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between">
                                                            <div className="flex items-center">
                                                                {party.type === 'individual' ? 
                                                                    <UserCheck className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" aria-hidden="true" /> : 
                                                                    <Building className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" aria-hidden="true" />
                                                                }
                                                                <div>
                                                                    <p className="font-medium">{party.name}</p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {party.type === 'individual' ? 'Cédula:' : 'RIF:'} {party.identifier}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 sm:mt-0 flex gap-1">
                                                                <Button 
                                                                    onClick={() => router.visit(
                                                                        party.type === 'individual' 
                                                                            ? route('individuals.show', party.id) 
                                                                            : route('legal-entities.show', party.id)
                                                                    )} 
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    title="Ver detalles"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                
                                                                {!legalCase.closing_date && (
                                                                    <Button 
                                                                        onClick={() => confirmRemoveParticipant(party.id, party.type, party.name)}
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-red-500 hover:text-red-700"
                                                                        title="Eliminar participante"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 dark:bg-zinc-800 rounded-md">
                                    <p>No hay partes relacionadas con este expediente.</p>
                                    {!legalCase.closing_date && (
                                        <Button
                                            onClick={() => router.visit(route('case-participants.add-form', legalCase.id))}
                                            className="mt-4 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                                            size="sm"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Añadir Participante
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Tarjeta de historial de estatus (mover aquí) */}
                        <div className="mb-6 border dark:border-zinc-700 rounded-md overflow-hidden">
                            <div className="bg-gray-100 dark:bg-zinc-900 px-4 py-2 font-medium flex items-center justify-between cursor-pointer" onClick={() => setShowStatusHistory(v => !v)}>
                                <span className="dark:text-gray-200">Historial de Estatus</span>
                                <span className="ml-2">{showStatusHistory ? '▲' : '▼'}</span>
                            </div>
                            {showStatusHistory && (
                                <div className="p-4 dark:bg-zinc-900">
                                    <div className="flex flex-col gap-3">
                                        {statusHistory.map((s, idx) => (
                                            <div key={s.id || idx} className="bg-gray-50 dark:bg-zinc-800 rounded-md p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow-xs border border-gray-200 dark:border-zinc-700">
                                                <div className="flex-1">
                                                    <span className="block font-semibold text-base mb-1">{s.name}</span>
                                                    <span className="block text-gray-500 text-xs mb-1">{new Date(s.created_at).toLocaleString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                    {s.reason && <span className="block italic text-gray-400 text-xs">({s.reason})</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Módulo: Historial de Eventos */}
                        <div className="mb-6">
                            <CaseEvents legalCase={legalCase} events={events} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Diálogo de confirmación para eliminar participante */}
            <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Participante</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Está seguro que desea eliminar a <strong>{participantToRemove?.name}</strong> de este expediente?
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveParticipant} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Modal de cambio de estatus */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambiar Estatus del Expediente</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Selecciona un estatus existente o crea uno nuevo e indica el motivo del cambio.
                    </DialogDescription>
                    <div className="space-y-4">
                        {!creatingStatus ? (
                            <>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    value={selectedStatus}
                                    onChange={e => setSelectedStatus(e.target.value)}
                                >
                                    <option value="">Seleccione un estatus</option>
                                    {availableStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                <Button variant="link" onClick={() => setCreatingStatus(true)} className="text-xs p-0">+ Crear nuevo estatus</Button>
                            </>
                        ) : (
                            <div>
                                <Input placeholder="Nuevo estatus" value={newStatus} onChange={e => setNewStatus(e.target.value)} />
                                <Button variant="link" onClick={() => setCreatingStatus(false)} className="text-xs p-0">Seleccionar existente</Button>
                            </div>
                        )}
                        <Input placeholder="Motivo del cambio (opcional)" value={statusReason} onChange={e => setStatusReason(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleStatusChange} disabled={(!selectedStatus && !newStatus)}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
} 