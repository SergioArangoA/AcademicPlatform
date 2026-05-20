/**
 * Escalas del docente: listado de escalas por criterio/rúbrica, con filtros.
 * Sirve para revisar lo definido en Definir escalas sin entrar rúbrica por rúbrica.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumb';
import FilterBar from '../../../components/FilterBar';
import { FilterValues } from '../../../models/Components/FilterConfig';
import GenericTable from '../../../components/GenericTable';
import { useAuth } from '../../../context/AuthContext';
import { loadTeacherScalesData } from '../../../utils/teacher';
import { TeacherScaleRow } from '../../../models/Utils/TeacherScaleRow';

const initialFilters: FilterValues = {
    search: '',
    rubric_id: 'all',
    rubric_status: 'all',
};

const ListScales = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [rows, setRows] = useState<TeacherScaleRow[]>([]);
    const [rubrics, setRubrics] = useState<{ id?: string; title?: string }[]>([]);
    const [filters, setFilters] = useState<FilterValues>(initialFilters);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const data = await loadTeacherScalesData(user);
            setRows(data.rows);
            setRubrics(data.rubrics);
            setLoadError(data.error);
        } catch {
            setLoadError('No se pudieron cargar las escalas.');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const rubricOptions = useMemo(
        () => [
            { value: 'all', label: 'Todas las rúbricas' },
            ...rubrics
                .filter((r) => r.id != null)
                .map((r) => ({ value: String(r.id), label: r.title ?? `Rúbrica ${r.id}` })),
        ],
        [rubrics]
    );

    const filterConfigs = useMemo(
        () => [
            {
                key: 'search',
                label: 'Buscar',
                type: 'text' as const,
                placeholder: 'Rúbrica, criterio o nivel...',
            },
            {
                key: 'rubric_id',
                label: 'Rúbrica',
                type: 'select' as const,
                options: rubricOptions,
            },
            {
                key: 'rubric_status',
                label: 'Estado rúbrica',
                type: 'select' as const,
                options: [
                    { value: 'all', label: 'Todos' },
                    { value: 'Publicada', label: 'Publicadas' },
                    { value: 'Borrador', label: 'Borrador' },
                ],
            },
        ],
        [rubricOptions]
    );

    const tableData = useMemo(() => {
        const search = (filters.search ?? '').trim().toLowerCase();
        return rows.filter((row) => {
            if (filters.rubric_id !== 'all' && row.rubric_id !== filters.rubric_id) {
                return false;
            }
            if (filters.rubric_status !== 'all' && row.rubric_status !== filters.rubric_status) {
                return false;
            }
            if (search) {
                const haystack =
                    `${row.rubric_title} ${row.criterion_name} ${row.scale_name} ${row.scale_description}`.toLowerCase();
                if (!haystack.includes(search)) return false;
            }
            return true;
        });
    }, [filters, rows]);

    const columns = [
        { key: 'rubric_title', label: 'Rúbrica' },
        { key: 'criterion_name', label: 'Criterio' },
        { key: 'scale_name', label: 'Nivel' },
        { key: 'scale_description', label: 'Descripción' },
        { key: 'scale_value', label: 'Valor' },
        { key: 'rubric_status', label: 'Estado' },
    ];

    const handleAction = (name: string, item: Record<string, unknown>) => {
        const row = item as unknown as TeacherScaleRow;
        if (name === 'define' && row.rubric_id) {
            navigate(`/teachers/rubrics/${row.rubric_id}/escalas`);
        }
    };

    return (
        <>
            <Breadcrumb pageName="Escalas" />

            <div className="flex flex-col gap-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Niveles de desempeño definidos en tus rúbricas (CU-09).
                    </p>
                    <Link
                        to="/teachers/rubrics/list"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        Ir a mis rúbricas →
                    </Link>
                </div>

                {loadError && (
                    <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        {loadError}
                    </p>
                )}

                {!loadError && !loading && rows.length === 0 && (
                    <p className="rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-gray-600 dark:border-strokedark dark:bg-boxdark dark:text-gray-300">
                        No hay escalas registradas. Crea una rúbrica y define niveles en{' '}
                        <Link to="/teachers/rubrics/create" className="text-primary hover:underline">
                            nueva rúbrica
                        </Link>
                        .
                    </p>
                )}

                <FilterBar
                    filters={filterConfigs}
                    values={filters}
                    onChange={(key, value) => setFilters((c) => ({ ...c, [key]: value }))}
                    onClear={() => setFilters(initialFilters)}
                />

                {loading ? (
                    <p className="mt-4 text-gray-500">Cargando escalas...</p>
                ) : (
                    <GenericTable
                        data={tableData}
                        columns={columns}
                        actions={[{ name: 'define', label: 'Editar' }]}
                        onAction={handleAction}
                    />
                )}
            </div>
        </>
    );
};

export default ListScales;
