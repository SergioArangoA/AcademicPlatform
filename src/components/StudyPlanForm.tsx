import { Career } from "../models/Careers/Career";

export interface StudyPlanFormValues {
    career_id: string;
    name: string;
    year: string;
    suggested_semester: string;
    is_published: boolean;
}

interface StudyPlanFormProps {
    values: StudyPlanFormValues;
    careers: Career[];
    onValueChange: (key: keyof StudyPlanFormValues, value: string | boolean) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    loading: boolean;
    loadingCareers: boolean;
    readonlyCareer?: boolean;
    submitButtonLabel?: string;
    pageTitle?: string;
}

const StudyPlanForm = ({
    values,
    careers,
    onValueChange,
    onSubmit,
    loading,
    loadingCareers,
    readonlyCareer = false,
    submitButtonLabel = "Guardar plan",
    pageTitle = "Plan de estudios",
}: StudyPlanFormProps) => {
    const selectedCareer = careers.find((c) => String(c.id) === values.career_id);

    return (
        <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <form onSubmit={onSubmit} className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                        Seleccionar carrera
                    </label>
                    {readonlyCareer ? (
                        <div className="w-full rounded-lg border border-stroke bg-gray-2 px-4 py-2.5 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white">
                            {selectedCareer?.name || "Sin carrera asignada"}
                        </div>
                    ) : (
                        <select
                            value={values.career_id}
                            onChange={(event) => onValueChange("career_id", event.target.value)}
                            disabled={loadingCareers || loading}
                            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-strokedark dark:text-white"
                        >
                            <option value="">Seleccionar carrera</option>
                            {careers.map((career) => (
                                <option key={career.id} value={String(career.id)}>
                                    {career.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Nombre del plan</label>
                        <input
                            type="text"
                            value={values.name}
                            onChange={(event) => onValueChange("name", event.target.value)}
                            placeholder="Plan 2026"
                            disabled={loading}
                            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-strokedark dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Año</label>
                        <input
                            type="number"
                            value={values.year}
                            onChange={(event) => onValueChange("year", event.target.value)}
                            min="2000"
                            step="1"
                            disabled={loading}
                            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-strokedark dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Semestre sugerido</label>
                        <input
                            type="number"
                            value={values.suggested_semester}
                            onChange={(event) => onValueChange("suggested_semester", event.target.value)}
                            min="1"
                            step="1"
                            disabled={loading}
                            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-strokedark dark:text-white"
                        />
                    </div>

                    <div className="flex items-end">
                        <label className="flex w-full items-center gap-3 rounded-lg border border-stroke px-4 py-3 text-sm text-black dark:border-strokedark dark:text-white">
                            <input
                                type="checkbox"
                                checked={values.is_published}
                                onChange={(event) => onValueChange("is_published", event.target.checked)}
                                disabled={loading}
                                className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary disabled:cursor-not-allowed"
                            />
                            Publicar plan de estudios
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-stroke pt-5 dark:border-strokedark">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="rounded-lg border border-stroke px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || loadingCareers}
                        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Guardando..." : submitButtonLabel}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudyPlanForm;
