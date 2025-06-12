import { Head } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
}

interface Props {
    user: User;
}

export default function UserShow({ user }: Props) {
    return (
        <>
            <Head title={`Detalle de Usuario: ${user.name}`} />
            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="mb-4 text-2xl font-semibold">Detalle de Usuario</h1>
                            <div className="mb-2">
                                <strong>Nombre:</strong> {user.name}
                            </div>
                            <div className="mb-2">
                                <strong>Email:</strong> {user.email}
                            </div>
                            <div className="mb-2">
                                <strong>Verificación de correo:</strong> {user.email_verified_at ? 'Verificado' : 'No verificado'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
