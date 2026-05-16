import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { Subject } from "../../models/Subjects/Subject";
import { subjectService } from "../../services/subjectService";

const formatDateTime = (value?: string) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
};

const ViewSubject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubject = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            const data = await subjectService.getSubjectById(id);
            setSubject(data);
            setLoading(false);
        };

        fetchSubject();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-600">Cargando asignatura...</p>
                </div>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No se encontró la asignatura solicitada.</p>
                    <button
                        type="button"
                        onClick={() => navigate("/admin/subjects-list")}
                        className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-black transition hover:bg-green-700"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Breadcrumb pageName="Detalles de la asignatura" />
            <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Detalles de la asignatura</h2>
                </div>

                <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Código</p>
                        <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                            {subject.code}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</p>
                        <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                            {subject.name}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Créditos</p>
                        <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                            {subject.credits}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</p>
                        <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                            {subject.is_active ? "Activa" : "Inactiva"}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Descripción</p>
                        <p className="min-h-[90px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                            {subject.description || "-"}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Creada el</p>
                        <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                            {formatDateTime(subject.created_at)}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Última actualización</p>
                        <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                            {formatDateTime(subject.updated_at)}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Actualizado por</p>
                        <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                            {subject.updated_by || "-"}
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-5 dark:border-gray-700">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100">
                        <div className="mb-1 font-semibold">Información</div>
                        <p>
                            Para editar o archivar una asignatura, selecciónala desde la tabla y elige la acción correspondiente.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/40">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/subjects-list")}
                        className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-green-700"
                    >
                        Volver
                    </button>
                </div>
            </div>
        </>
    );
};

export default ViewSubject;