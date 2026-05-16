import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Breadcrumb from '../../../components/Breadcrumb';
import FilterBar, { FilterValues } from '../../../components/FilterBar';
import GenericTable from '../../../components/GenericTable';
import { loadTeacherGroupsData, TeacherGroupRow } from '../../../utils/teacherTableData';

const initialFilters: FilterValues = {
    search: '',
    subject_id: 'all',
    semester_id: 'all',
};

const TeacherGroupList = () => {
    const { user } = useAuth();
    const [groups, setGroups] = useState<TeacherGroupRow[]>([]);
    const [subjects, setSubjects] = useState<{ id?: string | number; code: string; name: string }[]>([]);
    const [semesters, setSemesters] = useState<{ id?: string; name: string }[]>([]);
    const [filters, setFilters] = useState<FilterValues>(initialFilters);
    const [loading, setLoading] = useState(true);
    const [teacherId, setTeacherId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        const data = await loadTeacherGroupsData(user);
        setTeacherId(data.teacherId);
        setGroups(data.groups);
        setSubjects(data.subjects);
        setSemesters(data.semesters);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const tableData = useMemo(() => {
        const search = (filters.search ?? '').trim().toLowerCase();
        return groups.filter((group) => {
            if (filters.subject_id !== 'all' && String(group.subject_id) !== String(filters.subject_id)) {
                return false;
            }
            if (filters.semester_id !== 'all' && String(group.semester_id) !== String(filters.semester_id)) {
                return false;
            }
            if (search) {
                const haystack = `${group.name ?? ''} ${group.group_code ?? ''} ${group.subject_label}`.toLowerCase();
                if (!haystack.includes(search)) return false;
            }
            return true;
        });
    }, [filters, groups]);

    const filterConfigs = [
        {
            key: 'search',
            label: 'Buscar',
            type: 'text' as const,
            placeholder: 'Nombre o código de grupo...',
        },
        {
            key: 'subject_id',
            label: 'Asignatura',
            type: 'select' as const,
            options: [
                { value: 'all', label: 'Todas' },
                ...subjects.map((s) => ({
                    value: String(s.id),
                    label: `${s.code} — ${s.name}`,
                })),
            ],
        },
        {
            key: 'semester_id',
            label: 'Semestre',
            type: 'select' as const,
            options: [
                { value: 'all', label: 'Todos' },
                ...semesters.map((s) => ({ value: String(s.id), label: s.name })),
            ],
        },
    ];

    const columns = [
        { key: 'group_code', label: 'Código' },
        { key: 'name', label: 'Grupo' },
        { key: 'subject_label', label: 'Asignatura' },
        { key: 'semester_label', label: 'Semestre' },
        { key: 'capacity_label', label: 'Inscritos / Cupo' },
    ];

    return (
        <>
            <Breadcrumb pageName="Mis grupos" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Grupos asignados a tu perfil de docente.
                </p>
                <Link
                    to="/teachers/evaluations/list"
                    className="text-sm font-medium text-primary hover:underline"
                >
                    Ir a evaluaciones →
                </Link>
            </div>

            {!teacherId && !loading && (
                <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    No se encontró tu registro de docente. Verifica que tu usuario esté vinculado en el sistema.
                </p>
            )}

            <FilterBar
                filters={filterConfigs}
                values={filters}
                onChange={(key, value) => setFilters((c) => ({ ...c, [key]: value }))}
                onClear={() => setFilters(initialFilters)}
            />

            {loading ? (
                <p className="mt-4 text-gray-500">Cargando grupos...</p>
            ) : (
                <GenericTable
                    data={tableData}
                    columns={columns}
                    actions={[]}
                    onAction={() => {}}
                />
            )}
        </>
    );
};

export default TeacherGroupList;
