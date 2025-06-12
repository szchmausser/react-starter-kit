import { CaseEvents } from '@/components/LegalCases/CaseEvents';
import { TagRelationsModal } from '@/components/TagRelationsModal';
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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatDateSafe } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowDown,
    ArrowUp,
    BookOpen,
    Building,
    Calendar,
    ChevronsUpDown,
    Edit,
    Eye,
    FileText,
    Gavel,
    Info,
    Plus,
    Tag,
    Upload,
    UserCheck,
    UserCog,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

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

interface TagType {
    id: number;
    name: string | Record<string, string>;
    type: string | null;
    slug: string | Record<string, string>;
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

interface MediaItemSummary {
    id: number;
    name: string;
    mime_type: string;
    extension: string;
    human_readable_size: string;
    created_at: string;
    updated_at?: string;
}

interface Props {
    legalCase: LegalCase;
    events: any[];
    nextImportantDate?: {
        id: number;
        title: string;
        end_date: string;
    } | null;
    mediaItems?: MediaItemSummary[];
}

export default function LegalCaseShow({ legalCase, events, nextImportantDate, mediaItems = [] }: Props) {
    const [participantToRemove, setParticipantToRemove] = useState<{ id: number; type: string; name: string } | null>(null);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
    const [statusHistory, setStatusHistory] = useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = useState('placeholder');
    const [statusReason, setStatusReason] = useState('');
    const [creatingStatus, setCreatingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [currentStatus, setCurrentStatus] = useState<string>('');
    const [showStatusHistory, setShowStatusHistory] = useState(false);
    const [partiesCollapsed, setPartiesCollapsed] = useState(true);
    const [mediaCollapsed, setMediaCollapsed] = useState(true);

    // Estado para expandir/contraer títulos truncados
    const [expandedTitles, setExpandedTitles] = useState<{ [key: string]: boolean }>({});

    // Estado para manejo de etiquetas
    const [tags, setTags] = useState<TagType[]>([]);
    const [tagsCollapsed, setTagsCollapsed] = useState(false);
    const [allTags, setAllTags] = useState<TagType[]>([]);
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [newTagName, setNewTagName] = useState<string>('');
    const [tagDialogOpen, setTagDialogOpen] = useState(false);
    const [isLoadingTags, setIsLoadingTags] = useState(false);
    const [tagToRemove, setTagToRemove] = useState<{ name: string } | null>(null);
    const [isRemoveTagDialogOpen, setIsRemoveTagDialogOpen] = useState(false);

    // Estados para el modal de relaciones de etiquetas
    const [isTagRelationsModalOpen, setIsTagRelationsModalOpen] = useState(false);
    const [selectedTagForRelations, setSelectedTagForRelations] = useState<TagType | null>(null);
    const [tagRelationsData, setTagRelationsData] = useState<Record<string, any[]> | null>(null);
    const [isLoadingTagRelations, setIsLoadingTagRelations] = useState(false);

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
        return entity.trade_name ? `${entity.business_name} (${entity.trade_name})` : entity.business_name;
    };

    // Combinar todas las partes y agruparlas por rol
    const getAllParties = () => {
        const parties: {
            [key: string]: Array<{
                id: number;
                name: string;
                identifier: string;
                type: 'individual' | 'entity';
                entityObj: Individual | LegalEntity;
            }>;
        } = {};

        // Procesar individuos
        legalCase.individuals.forEach((individual) => {
            const role = individual.pivot?.role || 'Sin rol asignado';
            if (!parties[role]) {
                parties[role] = [];
            }
            parties[role].push({
                id: individual.id,
                name: getFullName(individual),
                identifier: individual.national_id,
                type: 'individual',
                entityObj: individual,
            });
        });

        // Procesar entidades legales
        legalCase.legal_entities.forEach((entity) => {
            const role = entity.pivot?.role || 'Sin rol asignado';
            if (!parties[role]) {
                parties[role] = [];
            }
            parties[role].push({
                id: entity.id,
                name: getEntityName(entity),
                identifier: entity.rif,
                type: 'entity',
                entityObj: entity,
            });
        });

        return parties;
    };

    // Obtener todas las partes agrupadas por rol
    const partiesByRole = getAllParties();

    // Orden de roles para mostrar en la interfaz
    const roleOrder = ['Juez', 'Solicitante', 'Abogado de Solicitante', 'Demandado', 'Abogado de Demandado', 'Testigo', 'Sin rol asignado'];

    // Función para obtener el icono según el rol
    const getRoleIcon = (role: string) => {
        switch (role) {
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

    // Función para alternar la expansión del título
    const toggleTitleExpand = (key: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedTitles((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
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
                    id: participantToRemove.id,
                },
            });
        }
        setIsRemoveDialogOpen(false);
    };

    // Función para obtener el nombre de la etiqueta según el idioma actual
    const getTagName = (tag: TagType): string => {
        if (!tag.name) return 'Sin nombre';

        if (typeof tag.name === 'string') return tag.name;

        // Si es un objeto, intentar obtener el valor en el idioma actual
        const locale = document.documentElement.lang || 'es';

        // Si tenemos el idioma actual, usarlo, sino el primer valor disponible
        if (tag.name[locale]) return tag.name[locale];

        // Caso fallback: tomar cualquier valor no nulo del objeto
        const values = Object.values(tag.name);
        const firstValue = values.find((val) => val && typeof val === 'string');
        return firstValue || 'Sin nombre';
    };

    // Función para generar un color basado en el ID o nombre de la etiqueta
    const getTagColor = (tag: TagType): { bg: string; text: string; border: string } => {
        // Lista de colores disponibles (en tonos claros/50)
        const colors = [
            { bg: 'bg-red-50 dark:bg-red-900', text: 'text-red-800 dark:text-red-100', border: 'border-red-200 dark:border-red-800' },
            { bg: 'bg-blue-50 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-100', border: 'border-blue-200 dark:border-blue-800' },
            { bg: 'bg-green-50 dark:bg-green-900', text: 'text-green-800 dark:text-green-100', border: 'border-green-200 dark:border-green-800' },
            {
                bg: 'bg-yellow-50 dark:bg-yellow-900',
                text: 'text-yellow-800 dark:text-yellow-100',
                border: 'border-yellow-200 dark:border-yellow-800',
            },
            {
                bg: 'bg-purple-50 dark:bg-purple-900',
                text: 'text-purple-800 dark:text-purple-100',
                border: 'border-purple-200 dark:border-purple-800',
            },
            { bg: 'bg-pink-50 dark:bg-pink-900', text: 'text-pink-800 dark:text-pink-100', border: 'border-pink-200 dark:border-pink-800' },
            {
                bg: 'bg-indigo-50 dark:bg-indigo-900',
                text: 'text-indigo-800 dark:text-indigo-100',
                border: 'border-indigo-200 dark:border-indigo-800',
            },
            {
                bg: 'bg-orange-50 dark:bg-orange-900',
                text: 'text-orange-800 dark:text-orange-100',
                border: 'border-orange-200 dark:border-orange-800',
            },
            { bg: 'bg-teal-50 dark:bg-teal-900', text: 'text-teal-800 dark:text-teal-100', border: 'border-teal-200 dark:border-teal-800' },
            { bg: 'bg-cyan-50 dark:bg-cyan-900', text: 'text-cyan-800 dark:text-cyan-100', border: 'border-cyan-200 dark:border-cyan-800' },
        ];

        // Si tiene tipo, usar eso para determinar el color
        if (tag.type) {
            // Generar un número basado en el tipo
            let hash = 0;
            for (let i = 0; i < tag.type.length; i++) {
                hash = (hash << 5) - hash + tag.type.charCodeAt(i);
                hash |= 0; // Convertir a entero de 32 bits
            }

            // Asegurarse de que el índice sea positivo
            const index = Math.abs(hash) % colors.length;
            return colors[index];
        }

        // Si no tiene tipo, usar el ID o el nombre
        const seed = tag.id || getTagName(tag);
        let hash = typeof seed === 'number' ? seed : 0;

        if (typeof seed === 'string') {
            for (let i = 0; i < seed.length; i++) {
                hash = (hash << 5) - hash + seed.charCodeAt(i);
                hash |= 0; // Convertir a entero de 32 bits
            }
        }

        // Asegurarse de que el índice sea positivo y dentro del rango
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Cargar etiquetas del expediente
    const loadTags = () => {
        setIsLoadingTags(true);
        fetch(route('legal-cases.tags', legalCase.id))
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Error HTTP: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setTags(data);
                setIsLoadingTags(false);
            })
            .catch((error) => {
                setIsLoadingTags(false);
                toast.error('Error al cargar etiquetas');
            });
    };

    // Cargar todas las etiquetas disponibles
    const loadAllTags = () => {
        // Usar la nueva ruta API
        fetch('/api/legal-cases/all-tags')
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Error HTTP: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setAllTags(data);
            })
            .catch((error) => {
                toast.error('Error al cargar el listado de etiquetas');
                // No cargamos etiquetas hardcodeadas
                setAllTags([]);
            });
    };

    // Agregar una etiqueta (existente o nueva)
    const handleAddTag = () => {
        // Determinar si estamos agregando una etiqueta existente o creando una nueva
        const isCreatingNewTag = selectedTag === '' && newTagName.trim() !== '';
        const tagToAdd = isCreatingNewTag ? newTagName.trim() : selectedTag;

        if (!tagToAdd) return;

        // Verificar si la etiqueta ya existe en el sistema
        const tagExists = allTags.some((tag) => {
            try {
                if (typeof tag.name === 'string') {
                    return tag.name.toLowerCase() === tagToAdd.toLowerCase();
                }
                if (typeof tag.name === 'object' && tag.name !== null) {
                    return Object.values(tag.name).some((name) => typeof name === 'string' && name.toLowerCase() === tagToAdd.toLowerCase());
                }
                return false;
            } catch (error) {
                console.error('Error al verificar etiqueta existente:', tag, error);
                return false;
            }
        });

        // Validación adicional para evitar duplicados
        if (tagExists) {
            try {
                const tagsAsociadas = tags.map((tag) => getTagName(tag).toLowerCase());
                if (tagsAsociadas.includes(tagToAdd.toLowerCase())) {
                    toast.error('Esta etiqueta ya está asociada al expediente');
                    return;
                }
            } catch (error) {
                console.error('Error al verificar etiquetas asociadas:', error);
            }
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        fetch(route('legal-cases.attach-tags', legalCase.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                tags: [tagToAdd],
                create_if_not_exists: isCreatingNewTag, // Solo crear si es una etiqueta nueva
            }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return res.json();
            })
            .then((data) => {
                loadTags();
                loadAllTags(); // Recargar todas las etiquetas para actualizar la lista
                setSelectedTag('');
                setNewTagName('');
                setTagDialogOpen(false);

                if (data.created) {
                    toast.success('Etiqueta creada y agregada correctamente');
                } else {
                    toast.success('Etiqueta agregada correctamente');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                toast.error('Error al agregar la etiqueta');
            });
    };

    // Confirmar eliminación de etiqueta
    const confirmRemoveTag = (tagName: string) => {
        setTagToRemove({ name: tagName });
        setIsRemoveTagDialogOpen(true);
    };

    // Eliminar una etiqueta
    const handleRemoveTag = () => {
        if (!tagToRemove) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        fetch(route('legal-cases.detach-tag', legalCase.id), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ tag: tagToRemove.name }),
        })
            .then((res) => res.json())
            .then(() => {
                loadTags();
                setIsRemoveTagDialogOpen(false);
                toast.success('Etiqueta eliminada correctamente');
            })
            .catch((error) => {
                toast.error('Error al eliminar la etiqueta');
                setIsRemoveTagDialogOpen(false);
            });
    };

    // Actualizar el estatus del expediente
    const handleStatusChange = () => {
        const statusToSet = creatingStatus ? newStatus : selectedStatus;
        if (!statusToSet || statusToSet === 'placeholder') {
            toast.error('Debes seleccionar o crear un estatus.');
            return;
        }
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        fetch(route('legal-cases.set-status', legalCase.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ status: statusToSet, reason: statusReason }),
        })
            .then((res) => res.json())
            .then(() => {
                // Si estamos creando un nuevo estado, añadirlo a la lista de estados disponibles
                if (creatingStatus && statusToSet && !availableStatuses.includes(statusToSet)) {
                    setAvailableStatuses((prevStatuses) => [...prevStatuses, statusToSet].sort());
                }

                setStatusDialogOpen(false);
                setStatusReason('');
                setNewStatus('');
                setCreatingStatus(false);
                setSelectedStatus('placeholder');

                // Refrescar historial y estatus actual
                fetch(route('legal-cases.statuses', legalCase.id))
                    .then((res) => res.json())
                    .then((data) => {
                        setStatusHistory(data);
                        setCurrentStatus(data[0]?.name || '');
                    });
                toast.success('Estatus actualizado');
            })
            .catch((error) => {
                console.error('Error al actualizar el estatus:', error);
                toast.error('Error al actualizar el estatus');
            });
    };

    useEffect(() => {
        fetch(route('legal-cases.statuses', legalCase.id))
            .then((res) => res.json())
            .then((data) => {
                setStatusHistory(data);
                setCurrentStatus(data[0]?.name || '');
            });
        fetch(route('legal-cases.available-statuses'))
            .then((res) => res.json())
            .then(setAvailableStatuses);

        // Cargar etiquetas al iniciar
        loadTags();
        loadAllTags();
    }, [legalCase.id]);

    // Funciones para hacer scroll
    const scrollAmount = 400; // píxeles por clic
    const handleScrollUp = () => {
        window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
    };
    const handleScrollDown = () => {
        window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    };

    useEffect(() => {
        const onPopState = () => {
            router.reload(); // Recarga todos los datos de la página
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    // Función para manejar la visualización de relaciones de una etiqueta
    const handleViewTagRelations = async (tag: TagType, e: React.MouseEvent) => {
        // Evitar que se expanda/contraiga el título
        e.stopPropagation();

        setSelectedTagForRelations(tag);
        setIsLoadingTagRelations(true);
        setTagRelationsData(null); // Limpiar relaciones anteriores
        setIsTagRelationsModalOpen(true);

        try {
            const response = await axios.get<Record<string, any[]>>(route('tags.relations', tag.id), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest', // Indicar que es una petición AJAX
                },
            });

            if (response.data && Object.keys(response.data).length > 0) {
                setTagRelationsData(response.data);
            } else {
                setTagRelationsData({});
            }
        } catch (error) {
            toast.error('No se pudieron cargar las relaciones');
            setTagRelationsData(null);
        } finally {
            setIsLoadingTagRelations(false);
        }
    };

    // Función para obtener el icono según el tipo de archivo
    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-blue-500"
                >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            );
        } else if (mimeType === 'application/pdf') {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-red-500"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15v-1h6v1" />
                    <path d="M11 18v-6" />
                    <path d="M9 12v-1h6v1" />
                </svg>
            );
        } else if (mimeType.startsWith('video/')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-purple-500"
                >
                    <path d="m10 7 5 3-5 3Z" />
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <path d="M12 17v4" />
                    <path d="M8 21h8" />
                </svg>
            );
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-blue-700"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-green-600"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else {
            return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    // Función para obtener un icono más grande para la vista de cuadrícula
    const getLargeFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-16 w-16 text-blue-500"
                >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            );
        } else if (mimeType === 'application/pdf') {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-16 w-16 text-red-500"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15v-1h6v1" />
                    <path d="M11 18v-6" />
                    <path d="M9 12v-1h6v1" />
                </svg>
            );
        } else if (mimeType.startsWith('video/')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-16 w-16 text-purple-500"
                >
                    <path d="m10 7 5 3-5 3Z" />
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <path d="M12 17v4" />
                    <path d="M8 21h8" />
                </svg>
            );
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-16 w-16 text-blue-700"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-16 w-16 text-green-600"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
        } else if (mimeType.includes('audio')) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-16 w-16 text-pink-500"
                >
                    <path d="M17.5 22h.5a2 2 0 0 0 2-2V7.7a2 2 0 0 0-1.5-1.94l-9-1.7A2 2 0 0 0 7 6v14a2 2 0 0 0 2 2h.5" />
                    <circle cx="14" cy="17" r="3" />
                    <circle cx="10" cy="17" r="3" />
                </svg>
            );
        } else {
            return <FileText className="h-16 w-16 text-gray-500" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detalle del Expediente: ${legalCase.code}`} />
            <div className="p-4 sm:p-6">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-zinc-900">
                    <div className="p-4 text-gray-900 sm:p-6 dark:text-gray-100">
                        <div className="mb-4">
                            <h1 className="text-center text-2xl font-bold uppercase">DETALLE DEL EXPEDIENTE</h1>
                        </div>

                        {/* Etiquetas con separador visual */}
                        <div className="relative mb-8">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center">
                                    <Tag className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <span className="font-medium text-gray-800 dark:text-gray-200">Etiquetas</span>
                                    {isLoadingTags && <span className="ml-2 animate-pulse text-sm text-gray-500">(Cargando...)</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => setTagDialogOpen(true)}
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500"
                                        title="Añadir Etiqueta"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => setTagsCollapsed((v) => !v)}
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        title={tagsCollapsed ? 'Mostrar etiquetas' : 'Ocultar etiquetas'}
                                    >
                                        {tagsCollapsed ? (
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

                            {!tagsCollapsed && (
                                <div className={`mt-2 ${tags.length > 0 ? 'pb-2' : ''} px-1`}>
                                    {!isLoadingTags && tags.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-500 italic dark:border-gray-700">
                                            No hay etiquetas asociadas a este expediente
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag) => {
                                                const { bg, text, border } = getTagColor(tag);
                                                const tagId = `tag-${tag.id}`;
                                                const tagName = getTagName(tag);
                                                return (
                                                    <div
                                                        key={tag.id}
                                                        className={`group inline-flex items-center gap-2 ${bg} ${text} rounded-full border px-3 py-1.5 text-sm ${border} transition-all hover:shadow-sm`}
                                                    >
                                                        <div className="flex items-center font-medium">
                                                            <span
                                                                onClick={(e) => handleViewTagRelations(tag, e)}
                                                                className={`${expandedTitles[tagId] ? '' : 'max-w-[120px] truncate sm:max-w-[200px]'} cursor-pointer`}
                                                                title="Haz clic para ver las relaciones de esta etiqueta"
                                                            >
                                                                {tagName}
                                                            </span>
                                                            <button
                                                                onClick={(e) => toggleTitleExpand(tagId, e)}
                                                                className="-m-1 ml-1.5 rounded-full p-1 text-current opacity-60 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
                                                                title="Expandir/contraer texto"
                                                            >
                                                                {expandedTitles[tagId] ? (
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width="16"
                                                                        height="16"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        className="lucide lucide-chevron-up"
                                                                    >
                                                                        <path d="m18 15-6-6-6 6" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width="16"
                                                                        height="16"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        className="lucide lucide-chevron-down"
                                                                    >
                                                                        <path d="m6 9 6 6 6-6" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                        {tag.type && (
                                                            <div className="flex items-center gap-1 opacity-70">
                                                                <div className={`h-2 w-2 rounded-full bg-current`}></div>
                                                                <span className="hidden text-xs sm:inline">{tag.type}</span>
                                                            </div>
                                                        )}
                                                        <div className="mx-0.5 h-4 w-px bg-current opacity-20"></div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                confirmRemoveTag(tagName);
                                                            }}
                                                            className="-m-1 rounded-full p-1 text-current opacity-70 transition-all hover:bg-red-100 hover:text-red-600 hover:opacity-100 focus:opacity-100 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                            title="Eliminar etiqueta"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Separador visual */}
                            <div className="mt-4 border-b border-gray-100 dark:border-gray-800"></div>
                        </div>

                        {/* Tarjeta de Información General con encabezado igual a las demás tarjetas */}
                        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                            {/* Encabezado de tarjeta estándar */}
                            <div className="flex items-center border-b border-gray-200 bg-gray-100 px-4 py-2 font-medium dark:border-zinc-800 dark:bg-zinc-900">
                                <Info className="mr-2 h-5 w-5 text-gray-600 hover:text-blue-800" aria-hidden="true" />
                                <span className="dark:text-gray-200">Información General del Expediente</span>
                            </div>
                            {/* Campos principales en columnas, estilo ficha legal */}
                            <div className="px-6 pt-6 pb-2">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div className="flex flex-col items-stretch rounded-md border border-gray-200 bg-gray-100 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                        <div className="mb-1 flex items-center gap-1.5">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400"
                                            >
                                                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                                                <path d="M18 14h-8"></path>
                                                <path d="M15 18h-5"></path>
                                                <path d="M10 6h8v4h-8V6Z"></path>
                                            </svg>
                                            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                                CÓDIGO DE EXPEDIENTE
                                            </span>
                                        </div>
                                        <span className="text-xl font-bold break-all text-gray-900 uppercase dark:text-gray-100">
                                            {legalCase.code}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-stretch rounded-md border border-gray-200 bg-gray-100 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                        <div className="mb-1 flex items-center gap-1.5">
                                            <BookOpen className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                                TIPO DE CASO
                                            </span>
                                        </div>
                                        <span className="text-xl font-bold break-all text-gray-900 uppercase dark:text-gray-100">
                                            {legalCase.case_type.name}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-stretch rounded-md border border-gray-200 bg-gray-100 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                        <div className="mb-1 flex items-center gap-1.5">
                                            <ChevronsUpDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                                ESTADO
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xl font-bold text-gray-900 uppercase dark:text-gray-100">
                                                {currentStatus ? currentStatus : legalCase.closing_date ? 'CERRADO' : 'NO DEFINIDO'}
                                            </span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-gray-600 hover:text-blue-800"
                                                onClick={() => setStatusDialogOpen(true)}
                                                title="Cambiar estatus"
                                            >
                                                <Edit className="h-6 w-6" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Línea divisoria */}
                            <div className="my-4 border-t border-gray-200 dark:border-zinc-700" />
                            {/* Fechas importantes en la parte inferior, en recuadros */}
                            <div className="grid grid-cols-1 gap-6 px-6 pb-6 md:grid-cols-4">
                                <div className="flex flex-col items-stretch rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                                    <div className="mb-1 flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            FECHA DE ENTRADA
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900 uppercase dark:text-gray-100">
                                        {formatDateSafe(legalCase.entry_date)}
                                    </span>
                                </div>
                                <div className="flex flex-col items-stretch rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                                    <div className="mb-1 flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            FECHA DE SENTENCIA
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900 uppercase dark:text-gray-100">
                                        {legalCase.sentence_date ? formatDateSafe(legalCase.sentence_date) : 'NO DEFINIDA'}
                                    </span>
                                </div>
                                <div className="flex flex-col items-stretch rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                                    <div className="mb-1 flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            FECHA DE CIERRE
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900 uppercase dark:text-gray-100">
                                        {legalCase.closing_date ? formatDateSafe(legalCase.closing_date) : 'NO DEFINIDA'}
                                    </span>
                                </div>
                                <div className="flex flex-col items-stretch rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                                    <div className="mb-1 flex items-center gap-1.5">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400"
                                        >
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" x2="12" y1="8" y2="12"></line>
                                            <line x1="12" x2="12.01" y1="16" y2="16"></line>
                                        </svg>
                                        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            PRÓXIMA FECHA IMPORTANTE
                                        </span>
                                    </div>
                                    {nextImportantDate ? (
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold text-gray-900 uppercase dark:text-gray-100">
                                                    {formatDateSafe(nextImportantDate.end_date)}
                                                </span>
                                                <span className="mt-1 text-base font-semibold text-gray-800 dark:text-gray-200">
                                                    {nextImportantDate.title}
                                                </span>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-gray-600 hover:text-blue-800"
                                                onClick={() => router.visit(route('legal-cases.important-dates.index', legalCase.id))}
                                                title="Editar fechas importantes"
                                            >
                                                <Calendar className="h-6 w-6" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-lg font-bold text-gray-900 uppercase dark:text-gray-100">NO DEFINIDA</span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-gray-600 hover:text-blue-800"
                                                onClick={() => router.visit(route('legal-cases.important-dates.index', legalCase.id))}
                                                title="Gestionar fechas importantes"
                                            >
                                                <Calendar className="h-6 w-6" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta: Sujetos procesales */}
                        <div className="mb-6 overflow-hidden rounded-md border dark:border-zinc-700">
                            <div
                                className="flex cursor-pointer items-center justify-between bg-gray-100 px-4 py-2 font-medium select-none dark:bg-zinc-900"
                                onClick={() => setPartiesCollapsed((v) => !v)}
                            >
                                <div className="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400"
                                    >
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">Sujetos procesales</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.visit(route('case-participants.add-form', legalCase.id));
                                        }}
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500"
                                        title="Añadir Participante"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4"
                                        >
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="8.5" cy="7" r="4"></circle>
                                            <line x1="20" y1="8" x2="20" y2="14"></line>
                                            <line x1="17" y1="11" x2="23" y2="11"></line>
                                        </svg>
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        title={partiesCollapsed ? 'Mostrar sujetos' : 'Ocultar sujetos'}
                                    >
                                        {partiesCollapsed ? (
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
                            {!partiesCollapsed && (
                                <div className="p-4 dark:bg-zinc-900">
                                    {Object.keys(partiesByRole).length > 0 ? (
                                        <div className="space-y-4">
                                            {roleOrder.map((role) => {
                                                if (!partiesByRole[role] || partiesByRole[role].length === 0) return null;
                                                return (
                                                    <div key={role} className="overflow-hidden rounded-md border dark:border-zinc-700">
                                                        <div className="flex items-center bg-gray-50 px-4 py-2 font-medium dark:bg-zinc-900">
                                                            {getRoleIcon(role)}
                                                            <span className="ml-2 dark:text-gray-200">{role}</span>
                                                        </div>
                                                        <div className="divide-y divide-gray-200 dark:divide-zinc-800 dark:bg-zinc-900">
                                                            {partiesByRole[role].map((party) => (
                                                                <div
                                                                    key={`${party.type}-${party.id}`}
                                                                    className="flex flex-col justify-between px-4 py-3 sm:flex-row sm:items-center"
                                                                >
                                                                    <div className="flex items-center">
                                                                        {party.type === 'individual' ? (
                                                                            <UserCheck
                                                                                className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400"
                                                                                aria-hidden="true"
                                                                            />
                                                                        ) : (
                                                                            <Building
                                                                                className="mr-2 h-4 w-4 text-green-500 dark:text-green-400"
                                                                                aria-hidden="true"
                                                                            />
                                                                        )}
                                                                        <div>
                                                                            <div
                                                                                onClick={(e) => toggleTitleExpand(`party-${party.id}`, e)}
                                                                                className={`-mx-2 -my-1 cursor-pointer rounded px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-700/70`}
                                                                                title="Haz clic para expandir/contraer el nombre"
                                                                            >
                                                                                <p
                                                                                    className={`font-medium ${expandedTitles[`party-${party.id}`] ? '' : 'max-w-[180px] truncate sm:max-w-full'}`}
                                                                                >
                                                                                    {party.name}
                                                                                </p>
                                                                            </div>
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                {party.type === 'individual' ? 'Cédula:' : 'RIF:'} {party.identifier}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2 flex w-full justify-end gap-1 sm:mt-0">
                                                                        <Button
                                                                            onClick={() =>
                                                                                router.visit(
                                                                                    party.type === 'individual'
                                                                                        ? route('individuals.show', party.id)
                                                                                        : route('legal-entities.show', party.id),
                                                                                )
                                                                            }
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            title="Ver detalles"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                        {!legalCase.closing_date && (
                                                                            <Button
                                                                                onClick={() =>
                                                                                    confirmRemoveParticipant(party.id, party.type, party.name)
                                                                                }
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="text-red-500 hover:text-red-700"
                                                                                title="Eliminar participante"
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
                                        <div className="rounded-md bg-gray-50 py-8 text-center dark:bg-zinc-800">
                                            <p>No hay partes relacionadas con este expediente.</p>
                                            {!legalCase.closing_date && (
                                                <Button
                                                    onClick={() => router.visit(route('case-participants.add-form', legalCase.id))}
                                                    className="mt-4 bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                                                    size="sm"
                                                >
                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                    Añadir Participante
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cronología del expediente */}
                        <div className="mb-6">
                            <CaseEvents legalCase={legalCase} events={events} />
                        </div>

                        {/* Tarjeta: Archivos Multimedia */}
                        <div className="mb-6 overflow-hidden rounded-md border dark:border-zinc-700">
                            <div
                                className="flex cursor-pointer items-center justify-between bg-gray-100 px-4 py-2 font-medium select-none dark:bg-zinc-900"
                                onClick={() => setMediaCollapsed((v) => !v)}
                            >
                                <div className="flex items-center">
                                    <FileText className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <span className="font-medium text-gray-800 dark:text-gray-200">Archivos Multimedia</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.visit(route('legal-cases.media.index', legalCase.id));
                                        }}
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500"
                                        title="Ver todos los archivos"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.visit(route('legal-cases.media.create', legalCase.id));
                                        }}
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500"
                                        title="Subir Archivo"
                                    >
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        title={mediaCollapsed ? 'Mostrar archivos' : 'Ocultar archivos'}
                                    >
                                        {mediaCollapsed ? (
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
                            {!mediaCollapsed && (
                                <div className="p-4 dark:bg-zinc-900">
                                    {mediaItems && mediaItems.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="overflow-hidden rounded-md border dark:border-zinc-700">
                                                <div className="flex items-center justify-between bg-gray-50 px-4 py-2 font-medium dark:bg-zinc-900">
                                                    <span className="dark:text-gray-200">Archivos Recientes</span>
                                                </div>

                                                <div className="divide-y divide-gray-200 dark:divide-zinc-800 dark:bg-zinc-900">
                                                    {mediaItems.slice(0, 5).map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex flex-col justify-between px-4 py-3 sm:flex-row sm:items-center"
                                                        >
                                                            <div className="flex items-center">
                                                                {getFileIcon(item.mime_type)}
                                                                <div className="ml-3">
                                                                    <p className="font-medium">{item.name}</p>
                                                                    <div className="flex flex-col text-xs text-gray-600 dark:text-gray-400">
                                                                        <div className="flex items-center gap-1">
                                                                            <span>{item.human_readable_size}</span>
                                                                            <span className="mx-1">•</span>
                                                                            <span className="whitespace-nowrap">
                                                                                <span className="font-medium">Creado:</span>{' '}
                                                                                {formatDateSafe(item.created_at)}
                                                                            </span>
                                                                        </div>
                                                                        {item.updated_at && item.updated_at !== item.created_at && (
                                                                            <div className="text-gray-500 dark:text-gray-500">
                                                                                <span className="font-medium">Actualizado:</span>{' '}
                                                                                {formatDateSafe(item.updated_at)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex justify-end sm:mt-0">
                                                                <Button
                                                                    onClick={() =>
                                                                        router.visit(route('legal-cases.media.show', [legalCase.id, item.id]))
                                                                    }
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                >
                                                                    Ver detalle
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-center">
                                                <Button
                                                    onClick={() => router.visit(route('legal-cases.media.create', legalCase.id))}
                                                    className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                                                    size="sm"
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Subir Nuevo Archivo
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-md bg-gray-50 py-8 text-center dark:bg-zinc-800">
                                            <p>No hay archivos multimedia asociados a este expediente.</p>
                                            <Button
                                                onClick={() => router.visit(route('legal-cases.media.create', legalCase.id))}
                                                className="mt-4 bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                                                size="sm"
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Subir Archivo
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Diálogo de confirmación para eliminar participante */}
            <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                <AlertDialogContent className="bg-white dark:bg-zinc-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Participante</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Está seguro que desea eliminar a <strong>{participantToRemove?.name}</strong> de este expediente? Esta acción no se puede
                            deshacer.
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
                <DialogContent className="bg-white dark:bg-zinc-900">
                    <DialogHeader>
                        <DialogTitle>Cambiar Estatus del Expediente</DialogTitle>
                        <div className="my-3 flex justify-center">
                            <div className="flex items-center justify-center rounded-md border border-gray-200 bg-gray-100 px-6 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                                <span className="text-center text-lg font-bold text-gray-900 uppercase dark:text-gray-100">
                                    {currentStatus ? currentStatus : legalCase.closing_date ? 'CERRADO' : 'NO DEFINIDO'}
                                </span>
                            </div>
                        </div>
                        <DialogDescription>Selecciona un estatus existente o crea uno nuevo e indica el motivo del cambio.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {!creatingStatus ? (
                            <>
                                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un estatus" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="placeholder">Seleccione un estatus</SelectItem>
                                        {availableStatuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="link" onClick={() => setCreatingStatus(true)} className="p-0 text-xs">
                                    + Crear nuevo estatus
                                </Button>
                            </>
                        ) : (
                            <div>
                                <Input
                                    id="new-status-input"
                                    placeholder="Nuevo estatus"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newStatus.trim()) {
                                            handleStatusChange();
                                        }
                                    }}
                                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-zinc-800"
                                    autoFocus
                                />
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setCreatingStatus(false);
                                        setNewStatus('');
                                    }}
                                    className="p-0 text-xs"
                                >
                                    Seleccionar existente
                                </Button>
                            </div>
                        )}
                        <Input placeholder="Motivo del cambio (opcional)" value={statusReason} onChange={(e) => setStatusReason(e.target.value)} />
                    </div>
                    {/* Histórico de cambios de estatus dentro del modal */}
                    <div className="mt-6">
                        <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Histórico de cambios de estatus</div>
                        <div className="flex max-h-48 flex-col gap-3 overflow-y-auto">
                            {statusHistory.length > 0 ? (
                                statusHistory.map((s, idx) => (
                                    <div
                                        key={s.id || idx}
                                        className="flex flex-col rounded-md border border-gray-200 bg-gray-50 p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700 dark:bg-zinc-800"
                                    >
                                        <div className="flex-1">
                                            <span className="mb-1 block text-base font-semibold">{s.name}</span>
                                            <span className="mb-1 block text-xs text-gray-500">
                                                {new Date(s.created_at).toLocaleString('es-VE', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                })}
                                            </span>
                                            {s.reason && <span className="block text-xs text-gray-400 italic">({s.reason})</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-500">No hay historial de estatus.</div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleStatusChange}
                            disabled={(!selectedStatus && !newStatus) || (selectedStatus === 'placeholder' && !newStatus)}
                        >
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal para agregar etiquetas */}
            <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                <DialogContent className="bg-white dark:bg-zinc-900">
                    <DialogHeader>
                        <DialogTitle>Agregar Etiqueta al Expediente</DialogTitle>
                        <DialogDescription>Selecciona una etiqueta existente o crea una nueva para agregar a este expediente.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="tag-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Seleccionar etiqueta existente
                            </label>
                            <select
                                id="tag-select"
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-100"
                                value={selectedTag}
                                onChange={(e) => {
                                    setSelectedTag(e.target.value);
                                    // Limpiar el campo de nueva etiqueta si se selecciona una existente
                                    if (e.target.value) {
                                        setNewTagName('');
                                    }
                                }}
                                disabled={allTags.length === 0}
                            >
                                {allTags.length > 0 ? (
                                    <>
                                        <option value="" className="bg-white text-gray-900 dark:bg-zinc-800 dark:text-gray-100">
                                            Selecciona una etiqueta
                                        </option>
                                        {allTags.map((tag) => {
                                            try {
                                                const displayName = getTagName(tag);
                                                return (
                                                    <option
                                                        key={tag.id}
                                                        value={displayName}
                                                        className="bg-white text-gray-900 dark:bg-zinc-800 dark:text-gray-100"
                                                    >
                                                        {displayName} {tag.type ? `(${tag.type})` : ''}
                                                    </option>
                                                );
                                            } catch (error) {
                                                console.error('Error al procesar etiqueta:', tag, error);
                                                return null; // Omitir esta etiqueta si hay un error
                                            }
                                        })}
                                    </>
                                ) : (
                                    <option value="" className="bg-white text-gray-900 dark:bg-zinc-800 dark:text-gray-100">
                                        No hay etiquetas disponibles
                                    </option>
                                )}
                            </select>
                        </div>

                        <div className="my-2 flex items-center">
                            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                            <span className="mx-2 text-xs text-gray-500 dark:text-gray-400">O</span>
                            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="new-tag" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Crear nueva etiqueta
                            </label>
                            <Input
                                id="new-tag"
                                type="text"
                                placeholder="Nombre de la nueva etiqueta"
                                value={newTagName}
                                onChange={(e) => {
                                    setNewTagName(e.target.value);
                                    // Limpiar la selección de etiqueta existente si se está escribiendo una nueva
                                    if (e.target.value.trim()) {
                                        setSelectedTag('');
                                    }
                                }}
                                className="border-gray-300 text-gray-900 dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {allTags.some(
                                    (tag) =>
                                        (typeof tag.name === 'string' && tag.name.toLowerCase() === newTagName.toLowerCase()) ||
                                        (typeof tag.name === 'object' &&
                                            Object.values(tag.name).some(
                                                (name) => typeof name === 'string' && name.toLowerCase() === newTagName.toLowerCase(),
                                            )),
                                ) && newTagName !== ''
                                    ? '⚠️ Ya existe una etiqueta con este nombre'
                                    : 'La etiqueta se creará y asignará al expediente'}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setTagDialogOpen(false);
                                setSelectedTag('');
                                setNewTagName('');
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleAddTag} disabled={!selectedTag && !newTagName.trim()}>
                            Agregar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo de confirmación para eliminar etiqueta */}
            <AlertDialog open={isRemoveTagDialogOpen} onOpenChange={setIsRemoveTagDialogOpen}>
                <AlertDialogContent className="bg-white dark:bg-zinc-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar etiqueta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Está seguro que desea eliminar la etiqueta <strong>{tagToRemove?.name}</strong> de este expediente? Esta acción no
                            eliminará la etiqueta del sistema, solo la desvinculará de este expediente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveTag} className="bg-red-600 text-white hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Botones flotantes para scroll vertical (gris 200, cuadrados) */}
            <div className="fixed right-3 bottom-3 z-50 flex flex-col gap-2">
                <button
                    onClick={handleScrollUp}
                    className="flex items-center justify-center rounded-md border border-gray-300 bg-gray-200 p-2 text-gray-700 shadow-lg transition-colors hover:bg-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    title="Desplazar hacia arriba"
                    aria-label="Desplazar hacia arriba"
                    style={{ width: 38, height: 38 }}
                >
                    <ArrowUp className="h-4 w-4" />
                </button>
                <button
                    onClick={handleScrollDown}
                    className="flex items-center justify-center rounded-md border border-gray-300 bg-gray-200 p-2 text-gray-700 shadow-lg transition-colors hover:bg-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    title="Desplazar hacia abajo"
                    aria-label="Desplazar hacia abajo"
                    style={{ width: 38, height: 38 }}
                >
                    <ArrowDown className="h-4 w-4" />
                </button>
            </div>

            {/* Modal de relaciones de etiquetas */}
            <TagRelationsModal
                isOpen={isTagRelationsModalOpen}
                onClose={() => setIsTagRelationsModalOpen(false)}
                tag={selectedTagForRelations}
                relations={tagRelationsData}
                isLoading={isLoadingTagRelations}
            />
        </AppLayout>
    );
}
