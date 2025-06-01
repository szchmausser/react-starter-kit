import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    FileIcon,
    PlusIcon,
    SearchIcon,
    FilterIcon,
    DownloadIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ImageIcon,
    FileTextIcon,
    VideoIcon,
    MusicIcon,
    ArchiveIcon,
    PresentationIcon,
    FileSpreadsheetIcon,
    CalendarIcon,
    XIcon
} from 'lucide-react';

interface Media {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    human_readable_size: string;
    collection_name: string;
    disk: string;
    created_at: string;
    updated_at: string;
    uuid: string | null;
    file_url?: string;
    thumbnail?: string;
    preview_url?: string;
    extension?: string;
    description?: string | null;
    category?: string | null;
    type_name?: string;
    type_icon?: string;
    custom_properties?: any;
}

interface MediaLibraryIndexProps {
    mediaItems: {
        data: Media[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        collection?: string;
        date_type?: 'created' | 'updated';
        start_date?: string;
        end_date?: string;
    };
    collections: string[];
}

export default function MediaLibraryIndex({ mediaItems, filters, collections }: MediaLibraryIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCollection, setSelectedCollection] = useState(filters.collection || '');
    const [dateType, setDateType] = useState<'created' | 'updated'>(filters.date_type || 'created');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [showDateFilter, setShowDateFilter] = useState(!!filters.start_date || !!filters.end_date);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/' },
        { title: 'Biblioteca de Archivos', href: route('media-library.index') }
    ];

    const handleSearch = (value: string) => {
        setSearch(value);

        const params = selectedCollection === '_all'
            ? { search: value }
            : { search: value, collection: selectedCollection };

        router.get(
            route('media-library.index'),
            params,
            { preserveState: true, replace: true }
        );
    };

    const handleCollectionChange = (value: string) => {
        setSelectedCollection(value);

        const params = value === '_all'
            ? { search }
            : { search, collection: value };

        router.get(
            route('media-library.index'),
            params,
            { preserveState: true, replace: true }
        );
    };

    const handleDateFilterApply = () => {
        const params = {
            search,
            collection: selectedCollection !== '_all' ? selectedCollection : undefined,
            date_type: dateType,
            start_date: startDate || undefined,
            end_date: endDate || undefined
        };

        router.get(
            route('media-library.index'),
            params,
            { preserveState: true, replace: true }
        );
    };

    const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');

        const params = {
            search,
            collection: selectedCollection !== '_all' ? selectedCollection : undefined
        };

        router.get(
            route('media-library.index'),
            params,
            { preserveState: true, replace: true }
        );
    };

    const deleteMedia = (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
            router.delete(route('media-library.destroy', id));
        }
    };

    const getFileIcon = (media: Media) => {
        if (!media.type_icon) return <FileIcon className="h-6 w-6 text-gray-400" />;

        switch (media.type_icon) {
            case 'image':
                return <ImageIcon className="h-6 w-6 text-blue-500" />;
            case 'file-text':
                return <FileTextIcon className="h-6 w-6 text-red-500" />;
            case 'video':
                return <VideoIcon className="h-6 w-6 text-purple-500" />;
            case 'music':
                return <MusicIcon className="h-6 w-6 text-pink-500" />;
            case 'file-spreadsheet':
                return <FileSpreadsheetIcon className="h-6 w-6 text-green-500" />;
            case 'file-presentation':
                return <PresentationIcon className="h-6 w-6 text-orange-500" />;
            case 'file-archive':
                return <ArchiveIcon className="h-6 w-6 text-yellow-500" />;
            default:
                return <FileIcon className="h-6 w-6 text-gray-500" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Biblioteca de Archivos" />

            <div className="p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Biblioteca de Archivos</h1>
                    <div className="flex space-x-2">
                        <Link href={route('media-library.clean-orphaned-files')}>
                            <Button variant="outline">
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Limpiar Archivos Huérfanos
                            </Button>
                        </Link>
                        <Link href={route('media-library.create')}>
                            <Button>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Nuevo Archivo
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Buscar y Filtrar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-grow">
                                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="search"
                                        placeholder="Buscar por nombre o descripción..."
                                        className="pl-8"
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                <div className="w-full sm:w-64">
                                    <Select
                                        value={selectedCollection}
                                        onValueChange={handleCollectionChange}
                                    >
                                        <SelectTrigger>
                                            <div className="flex items-center">
                                                <FilterIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                <SelectValue placeholder="Filtrar por colección" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_all">Todas las colecciones</SelectItem>
                                            {collections.map((collection) => (
                                                <SelectItem key={collection} value={collection}>
                                                    {collection.charAt(0).toUpperCase() + collection.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDateFilter(!showDateFilter)}
                                    className="flex items-center"
                                >
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    {showDateFilter ? 'Ocultar filtro de fechas' : 'Filtrar por fechas'}
                                </Button>

                                {(filters.start_date || filters.end_date) && (
                                    <div className="flex items-center">
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <span>
                                                {filters.date_type === 'created' ? 'Creado' : 'Actualizado'}:
                                                {filters.start_date && ` desde ${filters.start_date}`}
                                                {filters.end_date && ` hasta ${filters.end_date}`}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 p-0 ml-1"
                                                onClick={clearDateFilter}
                                            >
                                                <XIcon className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {showDateFilter && (
                                <Card className="border border-dashed">
                                    <CardContent className="p-4">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-sm font-medium mb-2">Tipo de fecha</h3>
                                                <RadioGroup
                                                    value={dateType}
                                                    onValueChange={(value: 'created' | 'updated') => setDateType(value)}
                                                    className="flex space-x-4"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="created" id="created" />
                                                        <Label htmlFor="created">Fecha de creación</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="updated" id="updated" />
                                                        <Label htmlFor="updated">Fecha de actualización</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="start-date" className="text-sm">Fecha inicial</Label>
                                                    <Input
                                                        id="start-date"
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="end-date" className="text-sm">Fecha final</Label>
                                                    <Input
                                                        id="end-date"
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button
                                                    size="sm"
                                                    onClick={handleDateFilterApply}
                                                    disabled={!startDate && !endDate}
                                                >
                                                    Aplicar filtro
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Archivo</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Colección</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Tamaño</TableHead>
                                        <TableHead className="hidden md:table-cell">Creado</TableHead>
                                        <TableHead className="hidden md:table-cell">Actualizado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mediaItems.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No se encontraron archivos
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        mediaItems.data.map((media) => (
                                            <TableRow key={media.id}>
                                                <TableCell className="w-12">
                                                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                                                        {media.mime_type && media.mime_type.startsWith('image/') ? (
                                                            <img
                                                                src={media.thumbnail || media.file_url}
                                                                alt={media.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                                                {getFileIcon(media)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{media.name}</div>
                                                    {media.description && (
                                                        <div className="text-sm text-gray-500">
                                                            {media.description.length > 50
                                                                ? `${media.description.substring(0, 50)}...`
                                                                : media.description}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {media.collection_name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{media.type_name || media.mime_type}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{media.human_readable_size}</span>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <span
                                                        className="text-sm cursor-help"
                                                        title={new Date(media.created_at).toLocaleString('es-ES')}
                                                    >
                                                        {new Date(media.created_at).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <span
                                                        className="text-sm cursor-help"
                                                        title={new Date(media.updated_at).toLocaleString('es-ES')}
                                                    >
                                                        {new Date(media.updated_at).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Link href={route('media-library.show', media.id)}>
                                                            <Button size="sm" variant="outline">
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => window.open(route('media-library.download', media.id), '_blank')}
                                                        >
                                                            <DownloadIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-500"
                                                            onClick={() => deleteMedia(media.id)}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Paginación */}
                {mediaItems.data.length > 0 && mediaItems.last_page > 1 && (
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Mostrando {mediaItems.from} a {mediaItems.to} de {mediaItems.total} resultados
                        </div>
                        <div className="flex space-x-2">
                            {mediaItems.links.map((link, i) => (
                                <div key={i}>
                                    {link.url === null ? (
                                        <span className="px-4 py-2 text-gray-400">{link.label}</span>
                                    ) : (
                                        <Link
                                            href={link.url}
                                            className={`px-4 py-2 rounded ${link.active
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
} 