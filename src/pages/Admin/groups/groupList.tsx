/**
 * Listado de grupos para el admin.
 * Desde aquí se entra a crear uno nuevo o editar; muestro cupos libres según matrículas.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/Breadcrumb";
import FilterBar, { FilterValues } from "../../../components/FilterBar";
import GenericTable from "../../../components/GenericTable";
import { Semester } from "../../../models/Semesters/Semester";
import { Subject } from "../../../models/Subjects/Subject";
import { Teacher } from "../../../models/Teachers/Teacher";
import { groupService, GroupWithMeta } from "../../../services/groupService";
import { semesterService } from "../../../services/semesterService";
import { subjectService } from "../../../services/subjectService";
import { teacherService } from "../../../services/teacherService";

const initialFilters: FilterValues = {
    search: "",
    subject_id: "all",
    semester_id: "all",
    has_capacity: "all",
};

type GroupRow = GroupWithMeta & {
    subject_label: string;
    semester_label: string;
    teacher_label: string;
    capacity_label: string;
};

const GroupList = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<GroupWithMeta[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [filters, setFilters] = useState<FilterValues>(initialFilters);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const [groupsData, subjectsData, semestersData, teachersData] = await Promise.all([
                groupService.getGroupsWithMeta(),
                subjectService.getSubjects(),
                semesterService.getSemesters(),
                teacherService.searchTeacher(""),
            ]);
            setGroups(Array.isArray(groupsData) ? groupsData : []);
            setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
            setSemesters(Array.isArray(semestersData) ? semestersData : []);
            setTeachers(Array.isArray(teachersData) ? teachersData : []);
        } catch (error) {
            console.error("Error al cargar grupos:", error);
            setLoadError("No se pudieron cargar los grupos. Verifica que el backend esté activo.");
            setGroups([]);
            setSubjects([]);
            setSemesters([]);
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const subjectMap = useMemo(() => {
        const map = new Map<string, Subject>();
        subjects.forEach((s) => {
            if (s.id) map.set(String(s.id), s);
        });
        return map;
    }, [subjects]);

    const semesterMap = useMemo(() => {
        const map = new Map<string, Semester>();
        semesters.forEach((s) => {
            if (s.id) map.set(String(s.id), s);
        });
        return map;
    }, [semesters]);

    const teacherMap = useMemo(() => {
        const map = new Map<string, Teacher>();
        teachers.forEach((t) => map.set(String(t.id), t));
        return map;
    }, [teachers]);

    const tableData: GroupRow[] = useMemo(() => {
        const search = (filters.search ?? "").trim().toLowerCase();

        return groups
            .filter((group) => {
                if (filters.subject_id !== "all" && String(group.subject_id) !== String(filters.subject_id)) {
                    return false;
                }
                if (filters.semester_id !== "all" && String(group.semester_id) !== String(filters.semester_id)) {
                    return false;
                }
                if (filters.has_capacity === "yes" && (group.available_capacity ?? 0) <= 0) return false;
                if (filters.has_capacity === "no" && (group.available_capacity ?? 0) > 0) return false;

                if (search) {
                    const haystack = `${group.name ?? ""} ${group.group_code ?? ""}`.toLowerCase();
                    if (!haystack.includes(search)) return false;
                }
                return true;
            })
            .map((group) => {
                const subject = group.subject_id ? subjectMap.get(String(group.subject_id)) : undefined;
                const semester = group.semester_id ? semesterMap.get(String(group.semester_id)) : undefined;
                const teacher = group.teacher_id ? teacherMap.get(String(group.teacher_id)) : undefined;

                return {
                    ...group,
                    subject_label: subject ? `${subject.code} — ${subject.name}` : "—",
                    semester_label: semester?.name ?? "—",
                    teacher_label: teacher
                        ? [teacher.first_name, teacher.last_name].filter(Boolean).join(" ")
                        : "Sin asignar",
                    capacity_label: `${group.enrolled_count ?? 0} / ${group.capacity ?? 0} (disp. ${group.available_capacity ?? 0})`,
                };
            });
    }, [filters, groups, semesterMap, subjectMap, teacherMap]);

    const filterConfigs = [
        {
            key: "search",
            label: "Buscar",
            type: "text" as const,
            placeholder: "Nombre o código...",
        },
        {
            key: "subject_id",
            label: "Asignatura",
            type: "select" as const,
            options: [
                { value: "all", label: "Todas" },
                ...subjects.map((s) => ({ value: String(s.id), label: `${s.code} — ${s.name}` })),
            ],
        },
        {
            key: "semester_id",
            label: "Semestre",
            type: "select" as const,
            options: [
                { value: "all", label: "Todos" },
                ...semesters.map((s) => ({ value: String(s.id), label: s.name })),
            ],
        },
        {
            key: "has_capacity",
            label: "Cupo disponible",
            type: "select" as const,
            options: [
                { value: "all", label: "Todos" },
                { value: "yes", label: "Con cupo" },
                { value: "no", label: "Sin cupo" },
            ],
        },
    ];

    const columns = [
        { key: "group_code", label: "Código" },
        { key: "name", label: "Nombre" },
        { key: "subject_label", label: "Asignatura" },
        { key: "semester_label", label: "Semestre" },
        { key: "capacity_label", label: "Inscritos / Cupo" },
        { key: "teacher_label", label: "Docente" },
    ];

    const handleFilterChange = (key: string, value: string) => {
        setFilters((current) => ({ ...current, [key]: value }));
    };

    const handleClearFilters = () => setFilters(initialFilters);

    const handleAction = (name: string, item: Record<string, unknown>) => {
        const groupId = String(item.id ?? "");
        if (!groupId) return;

        if (name === "edit") {
            navigate(`/admin/groups/edit/${groupId}`);
        }
    };

    return (
        <>
            <Breadcrumb pageName="Gestión de grupos" />
            <div className="flex flex-col gap-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Grupos del backend: crear, editar y revisar cupos disponibles.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/admin/groups/create")}
                    className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-green-700"
                >
                    Nuevo grupo
                </button>
            </div>

            {loadError && (
                <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                    {loadError}
                </p>
            )}

            <div className="mb-4">
                <FilterBar
                    filters={filterConfigs}
                    values={filters}
                    onChange={handleFilterChange}
                    onClear={handleClearFilters}
                />
            </div>

            {loading ? (
                <p className="text-gray-500">Cargando grupos...</p>
            ) : (
                <GenericTable
                    data={tableData}
                    columns={columns}
                    actions={[{ name: "edit", label: "Editar" }]}
                    onAction={handleAction}
                />
            )}
            </div>
        </>
    );
};

export default GroupList;
