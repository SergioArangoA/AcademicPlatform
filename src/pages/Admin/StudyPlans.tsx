import { useEffect, useMemo, useState } from "react";
import { Subject } from "../../models/Subject";
import { StudyPlan } from "../../models/StudyPlan/StudyPlan";
import { studyplanService } from "../../services/studyplanService";
import { subjectService } from "../../services/subjectService";
import GenericTable from "../../components/GenericTable";

type StudyPlanRow = {
    id: string;
    suggestedSemester: number;
    code: string;
    subjectName: string;
    credits: number;
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const PlanStudios = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [subjectSearch, setSubjectSearch] = useState("");
    const [subjectPage, setSubjectPage] = useState(1);

    const [plans, setPlans] = useState<StudyPlan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const [selectedPlanName, setSelectedPlanName] = useState<string>("");
    const [selectedPlanSemester, setSelectedPlanSemester] = useState<number>(0);
    const [studyPlanRows, setStudyPlanRows] = useState<any[]>([]);

    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    const [isPerformingAction, setIsPerformingAction] = useState(false);

    const [hasSearched, setHasSearched] = useState(false);

    const fetchSubjects = async () => {
        setIsLoadingSubjects(true);
        try {
            const data = await subjectService.getSubjects();
            setSubjects(data);
        } finally {
            setIsLoadingSubjects(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const data = await studyplanService.getStudyPlan();
            setPlans(data);
        } catch (error) {
            console.error("Error al cargar planes:", error);
        }
    };

    useEffect(() => {
        fetchSubjects();
        fetchPlans();
    }, []);

    const handleSearchPlan = async () => {
        if (!selectedPlanId) {
            return;
        }

        setIsLoadingPlan(true);
        setHasSearched(true);

        try {
            const data = await studyplanService.getSubjectsByStudyPlan(selectedPlanId);
            setStudyPlanRows(data);
        } finally {
            setIsLoadingPlan(false);
        }
    };

    const handleClearPlanFilters = () => {
        setSelectedPlanId("");
        setSelectedPlanName("");
        setSelectedPlanSemester(0);
        setHasSearched(false);
        setStudyPlanRows([]);
    };

    const handleSubjectAction = async (actionName: string, subject: Record<string, any>) => {
        if (actionName !== "add") return;

        if (!selectedPlanId) {
            const Swal = (await import("sweetalert2")).default;
            Swal.fire({
                icon: "warning",
                title: "Selecciona un plan",
                text: "Debes seleccionar un plan de estudios primero.",
            });
            return;
        }

        setIsPerformingAction(true);
        try {
            const ok = await studyplanService.addSubjectToStudyPlan(selectedPlanId, subject.id);
            const Swal = (await import("sweetalert2")).default;

            if (ok) {
                await Swal.fire({
                    icon: "success",
                    title: "Asignatura agregada",
                    text: "La asignatura se agregó correctamente al plan de estudios.",
                    timer: 1500,
                    showConfirmButton: false,
                });
                await handleSearchPlan();
                return;
            }

            Swal.fire({
                icon: "error",
                title: "No se pudo agregar",
                text: "Revisa la conexión o la respuesta de la API.",
            });
        } finally {
            setIsPerformingAction(false);
        }
    };

    const handleStudyPlanAction = async (actionName: string, plan: Record<string, any>) => {
        if (actionName !== "delete") return;

        if (!selectedPlanId) {
            const Swal = (await import("sweetalert2")).default;
            Swal.fire({
                icon: "warning",
                title: "Error",
                text: "No hay un plan seleccionado.",
            });
            return;
        }

        const Swal = (await import("sweetalert2")).default;
        const result = await Swal.fire({
            icon: "warning",
            title: "Eliminar asignatura",
            text: "¿Estás seguro de que deseas eliminar esta asignatura del plan de estudios?",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        setIsPerformingAction(true);
        try {
            const ok = await studyplanService.removeSubjectFromStudyPlan(selectedPlanId, plan.id);

            if (ok) {
                await Swal.fire({
                    icon: "success",
                    title: "Asignatura eliminada",
                    text: "La asignatura se eliminó correctamente del plan de estudios.",
                    timer: 1500,
                    showConfirmButton: false,
                });
                await handleSearchPlan();
                return;
            }

            Swal.fire({
                icon: "error",
                title: "No se pudo eliminar",
                text: "Revisa la conexión o la respuesta de la API.",
            });
        } finally {
            setIsPerformingAction(false);
        }
    };

    const subjectColumns = [
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre" },
        { key: "credits", label: "Créditos" },
    ];

    const subjectActions = [
        { name: "add", label: "Agregar" },
    ];

    const studyPlanColumns = [
        { key: "suggestedSemester", label: "Semestre sugerido" },
        { key: "code", label: "Código" },
        { key: "subjectName", label: "Asignatura" },
        { key: "credits", label: "Créditos" },
    ];

    const studyPlanActions = [
        { name: "edit", label: "Editar" },
        { name: "delete", label: "Eliminar" },
    ];

    const filteredSubjects = useMemo(() => {
        const search = normalizeText(subjectSearch);

        return subjects.filter((subject) => {
            if (search === "") {
                return true;
            }

            return [subject.code, subject.name, subject.description]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(search);
        });
    }, [subjectSearch, subjects]);

    const pageSize = 8;
    const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / pageSize));

    useEffect(() => {
        if (subjectPage > totalPages) {
            setSubjectPage(totalPages);
        }
    }, [subjectPage, totalPages]);

    const paginatedSubjects = useMemo(() => {
        const start = (subjectPage - 1) * pageSize;
        return filteredSubjects.slice(start, start + pageSize);
    }, [filteredSubjects, subjectPage]);

    const studyPlanTableRows = useMemo<StudyPlanRow[]>(() => {
        return studyPlanRows.map((row: any) => ({
            id: String(row.id),
            suggestedSemester: selectedPlanSemester,
            code: row.code || "-",
            subjectName: row.name || row.subject_name || "-",
            credits: row.credits || 0,
        }));
    }, [studyPlanRows, selectedPlanSemester]);


    return (
        <div className="space-y-6">
            <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h1 className="text-xl font-semibold text-black dark:text-white">Plan de estudios</h1>
                <p className="mt-1 text-sm text-gray-500">Define y versiona las asignaturas por semestre.</p>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Seleccionar plan</label>
                        <select
                            value={selectedPlanId}
                            onChange={(event) => {
                                const planId = event.target.value;
                                setSelectedPlanId(planId);
                                
                                const plan = plans.find(p => String(p.id) === planId);
                                setSelectedPlanSemester(plan?.suggested_semester ?? 0);
                                setSelectedPlanName(plan ? `${plan.name || "Plan"} - ${plan.year || ""}` : "");
                            }}
                            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary dark:border-strokedark dark:text-white"
                        >
                            <option value="">-- Seleccionar un plan --</option>
                            {plans.map((plan) => (
                                <option key={plan.id} value={String(plan.id)}>
                                    {plan.name} - {plan.year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            type="button"
                            onClick={handleSearchPlan}
                            disabled={isLoadingPlan || !selectedPlanId || isPerformingAction}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoadingPlan ? "Cargando..." : "Cargar"}
                        </button>

                        <button
                            type="button"
                            onClick={handleClearPlanFilters}
                            className="inline-flex items-center justify-center rounded-md border border-stroke px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-1">
                    <div className="border-b border-stroke px-5 py-4 dark:border-strokedark">
                        <h2 className="font-semibold text-black dark:text-white">Catálogo de asignaturas</h2>
                    </div>

                    <div className="p-5">
                        <input
                            type="text"
                            value={subjectSearch}
                            onChange={(event) => {
                                setSubjectSearch(event.target.value);
                                setSubjectPage(1);
                            }}
                            placeholder="Buscar por nombre o código..."
                            disabled={isPerformingAction}
                            className="mb-4 w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-white"
                        />

                        {isLoadingSubjects ? (
                            <p className="py-6 text-sm text-gray-500">Cargando asignaturas...</p>
                        ) : paginatedSubjects.length > 0 ? (
                            <>
                                <GenericTable
                                    data={paginatedSubjects}
                                    columns={subjectColumns}
                                    actions={subjectActions}
                                    onAction={handleSubjectAction}
                                />

                                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                    <span>
                                        Mostrando {filteredSubjects.length === 0 ? 0 : (subjectPage - 1) * pageSize + 1} a{" "}
                                        {Math.min(subjectPage * pageSize, filteredSubjects.length)} de {filteredSubjects.length}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSubjectPage((page) => Math.max(1, page - 1))}
                                            disabled={subjectPage === 1}
                                            className="rounded border border-stroke px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40 dark:border-strokedark"
                                        >
                                            ◀
                                        </button>
                                        <span>{subjectPage}</span>
                                        <button
                                            type="button"
                                            onClick={() => setSubjectPage((page) => Math.min(totalPages, page + 1))}
                                            disabled={subjectPage >= totalPages}
                                            className="rounded border border-stroke px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40 dark:border-strokedark"
                                        >
                                            ▶
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="py-6 text-center text-sm text-gray-500">No hay asignaturas para mostrar.</p>
                        )}
                    </div>
                </div>

                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-2">
                    <div className="flex flex-wrap items-center justify-between border-b border-stroke px-5 py-4 dark:border-strokedark">
                        <h2 className="font-semibold text-black dark:text-white">{selectedPlanName || "Plan de estudios"}</h2>
                        <span className="text-sm text-gray-500">{studyPlanTableRows.length} asignaturas</span>
                    </div>

                    {isLoadingPlan && <p className="px-5 py-4 text-sm text-gray-500">Consultando plan...</p>}

                    {!isLoadingPlan && hasSearched && studyPlanTableRows.length > 0 && (
                        <GenericTable
                            data={studyPlanTableRows}
                            columns={studyPlanColumns}
                            actions={studyPlanActions}
                            onAction={handleStudyPlanAction}
                        />
                    )}

                    {!isLoadingPlan && hasSearched && studyPlanTableRows.length === 0 && (
                        <p className="px-5 py-6 text-sm text-gray-500">No se encontraron asignaturas con los filtros seleccionados.</p>
                    )}

                    {!hasSearched && (
                        <p className="px-5 py-6 text-sm text-gray-500">Usa los filtros superiores para consultar el plan de estudios.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlanStudios;
