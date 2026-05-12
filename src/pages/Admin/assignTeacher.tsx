import { useCallback, useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import FilterBar, { FilterValues } from "../../components/FilterBar";
import GenericTable from "../../components/GenericTable";
import { Semester } from "../../models/Semesters/Semester";
import { Teacher } from "../../models/Teachers/Teacher";
import { groupService } from "../../services/groupService";
import { semesterService } from "../../services/semesterService";
import { teacherService } from "../../services/teacherService";
import { mapTableAssignTeacher } from "../../utils/mapTableAssignTeacher";
import { AssignTeacherTableRow } from "../../models/Teachers/AssignTeacherTableRow";

const initialFilters: FilterValues = {
    search: "",
    subject: "all",
    career: "all",
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const AssignTeacher = () => {
    const [semesterRows, setSemesterRows] = useState<Semester[]>([]);
    const [teacherRows, setTeacherRows] = useState<Teacher[]>([]);
    const [groupRows, setGroupRows] = useState<AssignTeacherTableRow[]>([]);
    const [filters, setFilters] = useState<FilterValues>(initialFilters);
    const [selectedSemesterId, setSelectedSemesterId] = useState("");
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [isAssigningTeacher, setIsAssigningTeacher] = useState(false);

    const loadCatalogs = useCallback(async () => {
        setIsLoadingCatalogs(true);
        try {
            const [semesters, teachers] = await Promise.all([
                semesterService.getSemesters(),
                teacherService.searchTeacher(""),
            ]);

            setSemesterRows(semesters);
            setTeacherRows(teachers);

            const activeSemester = semesters.find((semester) => semester.is_active) ?? semesters[0];
            if (activeSemester) {
                setSelectedSemesterId(String(activeSemester.id));
            }
        } finally {
            setIsLoadingCatalogs(false);
        }
    }, []);

    const loadGroups = useCallback(async () => {
        if (!selectedSemesterId) {
            setGroupRows([]);
            return;
        }

        setIsLoadingGroups(true);
        try {
            const groups = await mapTableAssignTeacher(selectedSemesterId);
            console.log(groups);
            setGroupRows(groups);
        } finally {
            setIsLoadingGroups(false);
        }
    }, [selectedSemesterId]);

    useEffect(() => {
        loadCatalogs();
    }, [loadCatalogs]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadGroups();
        }, 250);

        return () => window.clearTimeout(timer);
    }, [loadGroups]);

    useEffect(() => {
        if (!selectedGroupId) {
            return;
        }

        const selectedGroupExists = groupRows.some((group) => String(group.id) === selectedGroupId);
        if (!selectedGroupExists) {
            setSelectedGroupId("");
        }
    }, [groupRows, selectedGroupId]);

    const activeSemesters = useMemo(() => {
        const semesters = semesterRows.filter((semester) => semester.is_active);
        return semesters.length > 0 ? semesters : semesterRows;
    }, [semesterRows]);

    const selectedSemester = useMemo(() => {
        return semesterRows.find((semester) => String(semester.id) === selectedSemesterId);
    }, [semesterRows, selectedSemesterId]);

    const filteredGroups = useMemo(() => {
        const search = normalizeText(filters.search ?? "");
        const subjectFilter = filters.subject ?? "all";
        const careerFilter = filters.career ?? "all";

        return groupRows.filter((group) => {
            const matchesSearch =
                search === "" ||
                [group.group_code, group.group_name, group.subject_name, group.subject_code, group.career_name, group.teacher_name]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(search);

            const matchesSubject = subjectFilter === "all" || String(group.subject_id ?? "") === subjectFilter;
            const matchesCareer = careerFilter === "all" || String(group.career_id ?? "") === careerFilter;

            return matchesSearch && matchesSubject && matchesCareer;
        });
    }, [groupRows, filters.career, filters.search, filters.subject]);

    const subjectOptions = useMemo(
        () => [
            { value: "all", label: "Todas" },
            ...Array.from(
                new Map(
                    groupRows
                        .filter((group) => group.subject_id)
                        .map((group) => [group.subject_id, `${group.subject_code} - ${group.subject_name}`])
                ).entries()
            ).map(([value, label]) => ({ value, label })),
        ],
        [groupRows]
    );

    const careerOptions = useMemo(
        () => [
            { value: "all", label: "Todas" },
            ...Array.from(
                new Map(groupRows.filter((group) => group.career_id).map((group) => [group.career_id, group.career_name])).entries()
            ).map(([value, label]) => ({ value, label })),
        ],
        [groupRows]
    );

    const filterConfigs = useMemo(
        () => [
            {
                key: "search",
                label: "Buscar",
                type: "text" as const,
                placeholder: "Buscar por nombre o código de grupo...",
            },
            {
                key: "subject",
                label: "Asignatura",
                type: "select" as const,
                options: subjectOptions,
            },
            {
                key: "career",
                label: "Programa / Carrera",
                type: "select" as const,
                options: careerOptions,
            },
        ],
        [careerOptions, subjectOptions]
    );

    const handleFilterChange = (key: string, value: string) => {
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    const handleTableAction = (actionName: string, item: Record<string, any>) => {
        if (actionName === "select") {
            setSelectedGroupId(String(item.id));
        }
    };

    const handleAssignTeacher = async () => {
        if (!selectedGroupId || !selectedTeacherId) {
            const Swal = (await import("sweetalert2")).default;
            Swal.fire({
                icon: "warning",
                title: "Faltan datos",
                text: "Selecciona un grupo y un docente antes de continuar.",
            });
            return;
        }

        setIsAssigningTeacher(true);
        try {
            const ok = await groupService.assignTeacherToGroup(selectedGroupId, selectedTeacherId);
            const Swal = (await import("sweetalert2")).default;

            if (ok) {
                await Swal.fire({
                    icon: "success",
                    title: "Docente asignado",
                    text: "El grupo fue actualizado correctamente.",
                    timer: 1800,
                    showConfirmButton: false,
                });
                await loadGroups();
                return;
            }

            Swal.fire({
                icon: "error",
                title: "No se pudo asignar",
                text: "Revisa la conexión o la respuesta de la API.",
            });
        } finally {
            setIsAssigningTeacher(false);
        }
    };

    const selectedGroup = useMemo(
        () => groupRows.find((group) => String(group.id) === selectedGroupId),
        [groupRows, selectedGroupId]
    );

    const teacherOptions = useMemo(
        () => [
            { value: "", label: "Selecciona un docente" },
            ...teacherRows.map((teacher) => ({
                value: teacher.id,
                label: `${teacher.first_name} ${teacher.last_name}`.trim(),
            })),
        ].filter((option) => option.value !== "" || option.label === "Selecciona un docente"),
        [teacherRows]
    );

    return (
        <div className="p-6 space-y-6">
            <Breadcrumb pageName="Asignar docente" />

            <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-black dark:text-white">Buscar y seleccionar grupo</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Filtra los grupos por semestre activo y asigna el docente correspondiente.
                        </p>
                    </div>

                    <div className="grid w-full gap-4 sm:grid-cols-2 lg:max-w-2xl">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Semestre activo</label>
                            <select
                                value={selectedSemesterId}
                                onChange={(event) => setSelectedSemesterId(event.target.value)}
                                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary dark:border-strokedark dark:text-white"
                            >
                                {activeSemesters.map((semester) => (
                                    <option key={semester.id} value={String(semester.id)}>
                                        {semester.code} - {semester.name} {semester.is_active ? "(Activa)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Docente a asignar</label>
                            <select
                                value={selectedTeacherId}
                                onChange={(event) => setSelectedTeacherId(event.target.value)}
                                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary dark:border-strokedark dark:text-white"
                            >
                                {teacherOptions.map((teacher) => (
                                    <option key={teacher.value || teacher.label} value={teacher.value}>
                                        {teacher.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-100">
                    Solo se muestran grupos pertenecientes al semestre activo seleccionado.
                </div>
            </div>

            <FilterBar filters={filterConfigs} values={filters} onChange={handleFilterChange} onClear={handleClearFilters} />

            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex flex-col gap-2 border-b border-stroke px-5 py-4 dark:border-strokedark sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-black dark:text-white">Grupos disponibles</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Mostrando {filteredGroups.length} de {groupRows.length} grupos
                            {selectedSemester ? ` en ${selectedSemester.code}` : ""}.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAssignTeacher}
                        disabled={!selectedGroupId || !selectedTeacherId || isAssigningTeacher || isLoadingGroups}
                        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isAssigningTeacher ? "Asignando..." : "Asignar docente"}
                    </button>
                </div>

                <div className="p-5">
                    {isLoadingCatalogs || isLoadingGroups ? (
                        <div className="flex min-h-[220px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                            Cargando grupos...
                        </div>
                    ) : filteredGroups.length > 0 ? (
                        <GenericTable
                            data={filteredGroups}
                            columns={[
                                { key: "selected", label: "" },
                                { key: "group_code", label: "Código grupo" },
                                    { key: "group_name", label: "Nombre del grupo" },
                                { key: "subject_name", label: "Asignatura" },
                                { key: "subject_code", label: "Código asignatura" },
                                { key: "career_name", label: "Carrera / Programa" },
                                { key: "teacher_name", label: "Docente actual" },
                            ]}
                            actions={[{ name: "select", label: "Seleccionar" }]}
                            onAction={handleTableAction}
                            rowClassName={(item) =>
                                String(item.id) === selectedGroupId ? "bg-green-50/80 dark:bg-green-900/10" : ""
                            }
                            renderCell={(key, item) => {
                                if (key === "selected") {
                                    const isSelected = String(item.id) === selectedGroupId;

                                    return (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedGroupId(String(item.id))}
                                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-stroke bg-white transition hover:border-primary dark:border-strokedark dark:bg-boxdark"
                                            aria-label={isSelected ? "Grupo seleccionado" : "Seleccionar grupo"}
                                        >
                                            <span
                                                className={`h-3.5 w-3.5 rounded-full ${
                                                    isSelected ? "bg-green-600" : "border border-stroke dark:border-strokedark"
                                                }`}
                                            />
                                        </button>
                                    );
                                }

                                if (key === "teacher_name") {
                                    const assigned = item.teacher_id && item.teacher_name !== "Sin asignar";

                                    return (
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                assigned
                                                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                                    : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300"
                                            }`}
                                        >
                                            {item.teacher_name || "Sin asignar"}
                                        </span>
                                    );
                                }

                                return (
                                    <p className="text-black dark:text-white">
                                        {item[key] === true ? "Activo" : item[key] === false ? "Inactivo" : item[key] ?? "-"}
                                    </p>
                                );
                            }}
                        />
                    ) : (
                        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No hay grupos para los filtros seleccionados.</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {selectedSemesterId ? "Prueba con otro semestre o limpia los filtros." : "Selecciona un semestre para comenzar."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {selectedGroup && (
                <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <h3 className="text-base font-semibold text-black dark:text-white">Grupo seleccionado</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {selectedGroup.group_code || selectedGroup.group_name || "Grupo"} · {selectedGroup.subject_name ?? selectedGroup.subject_id ?? "Sin asignatura"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AssignTeacher;
