/**
 * Mis estudiantes (docente): alumnos inscritos en mis grupos, con búsqueda y filtro por grupo.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Breadcrumb from '../../../components/Breadcrumb';
import FilterBar, { FilterValues } from '../../../components/FilterBar';
import GenericTable from '../../../components/GenericTable';
import { loadTeacherStudentsData, TeacherStudentRow } from '../../../utils/teacher';

const initialFilters: FilterValues = {
    search: '',
    group_label: 'all',
    status: 'all',
};

const TeacherStudentList = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<TeacherStudentRow[]>([]);
    const [filters, setFilters] = useState<FilterValues>(initialFilters);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const { rows, error } = await loadTeacherStudentsData(user);
            setStudents(rows);
            setLoadError(error);
        } catch {
            setLoadError('No se pudieron cargar los estudiantes.');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const groupOptions = useMemo(() => {
        const labels = new Map<string, string>();
        students.forEach((s) => labels.set(s.group_label, s.group_label));
        return [{ value: 'all', label: 'Todos' }, ...Array.from(labels.keys()).map((g) => ({ value: g, label: g }))];
    }, [students]);

    const filterConfigs = useMemo(
        () => [
            {
                key: 'search',
                label: 'Buscar',
                type: 'text' as const,
                placeholder: 'Nombre, código o correo...',
            },
            {
                key: 'group_label',
                label: 'Grupo',
                type: 'select' as const,
                options: groupOptions,
            },
            {
                key: 'status',
                label: 'Inscripción',
                type: 'select' as const,
                options: [
                    { value: 'all', label: 'Todas' },
                    { value: 'Activa', label: 'Activas' },
                ],
            },
        ],
        [groupOptions]
    );

    const tableData = useMemo(() => {
        const search = (filters.search ?? '').trim().toLowerCase();
        return students.filter((row) => {
            if (filters.group_label && filters.group_label !== 'all' && row.group_label !== filters.group_label) {
                return false;
            }
            if (filters.status && filters.status !== 'all' && row.status !== filters.status) {
                return false;
            }
            if (search) {
                const haystack = `${row.student_name} ${row.student_code} ${row.student_email} ${row.subject_label}`.toLowerCase();
                if (!haystack.includes(search)) return false;
            }
            return true;
        });
    }, [filters, students]);

    const columns = [
        { key: 'student_code', label: 'Código' },
        { key: 'student_name', label: 'Estudiante' },
        { key: 'student_email', label: 'Correo' },
        { key: 'group_label', label: 'Grupo' },
        { key: 'subject_label', label: 'Asignatura' },
        { key: 'status', label: 'Estado' },
    ];

    return (
        <>
            <Breadcrumb pageName="Mis estudiantes" />

            <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Estudiantes inscritos en tus grupos asignados.
                </p>

                {loadError && (
                    <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        {loadError}
                    </p>
                )}

                {!loadError && !loading && students.length === 0 && (
                    <p className="rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-gray-600 dark:border-strokedark dark:bg-boxdark dark:text-gray-300">
                        No hay estudiantes en tus grupos o aún no tienes grupos asignados.
                    </p>
                )}

                <FilterBar
                    filters={filterConfigs}
                    values={filters}
                    onChange={(key, value) => setFilters((c) => ({ ...c, [key]: value }))}
                    onClear={() => setFilters(initialFilters)}
                />

                {loading ? (
                    <p className="mt-4 text-gray-500">Cargando estudiantes...</p>
                ) : (
                    <GenericTable data={tableData} columns={columns} actions={[]} onAction={() => {}} />
                )}
            </div>
        </>
    );
};

export default TeacherStudentList;
