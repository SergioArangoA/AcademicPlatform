import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import { Career } from "../../models/Careers/Career";
import { StudyPlanPayload } from "../../models/StudyPlan/StudyPlanPayload";
import { careerService } from "../../services/careerService";
import { studyplanService } from "../../services/studyplanService";

interface StudyPlanFormValues {
    career_id: string;
    name: string;
    year: string;
    suggested_semester: string;
    is_published: boolean;
}

const initialValues: StudyPlanFormValues = {
    career_id: "",
    name: "",
    year: "2026",
    suggested_semester: "1",
    is_published: false,
};

const CreateStudyPlan = () => {
    const navigate = useNavigate();
    const [careers, setCareers] = useState<Career[]>([]);
    const [loadingCareers, setLoadingCareers] = useState(true);
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState<StudyPlanFormValues>(initialValues);

    useEffect(() => {
        const fetchCareers = async () => {
            setLoadingCareers(true);
            try {
                const data = await careerService.getCareers();
                setCareers(data);
            } finally {
                setLoadingCareers(false);
            }
        };

        void fetchCareers();
    }, []);

    const handleChange = (key: keyof StudyPlanFormValues, value: string | boolean) => {
        setValues((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!values.career_id || !values.name.trim() || !values.year || !values.suggested_semester) {
            Swal.fire({
                icon: "warning",
                title: "Faltan datos",
                text: "Completa la carrera, el nombre, el año y el semestre sugerido.",
            });
            return;
        }

        const payload: StudyPlanPayload = {
            career_id: values.career_id,
            name: values.name.trim(),
            year: Number(values.year),
            suggested_semester: Number(values.suggested_semester),
            is_published: values.is_published,
        };

        const careerName = careers.find((career) => String(career.id) === values.career_id)?.name || "la carrera seleccionada";
        const confirmation = await Swal.fire({
            icon: "warning",
            title: "Confirmar creación",
            html: `
                <div style="text-align:left; line-height:1.6">
                    <p>¿Seguro que desea crear el plan de estudios?</p>
                    <p><strong>Carrera:</strong> ${careerName}</p>
                    <p><strong>Nombre:</strong> ${payload.name}</p>
                    <p><strong>Año:</strong> ${payload.year}</p>
                    <p><strong>Semestre sugerido:</strong> ${payload.suggested_semester}</p>
                    <p><strong>Publicado:</strong> ${payload.is_published ? "Sí" : "No"}</p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Sí, crear",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        setLoading(true);
        try {
            const createdStudyPlan = await studyplanService.createStudyPlan(payload);

            if (createdStudyPlan) {
                await Swal.fire({
                    icon: "success",
                    title: "Plan creado",
                    text: "El plan de estudios se creó correctamente.",
                    timer: 2200,
                    showConfirmButton: false,
                });
                navigate("/admin/study-plans");
                return;
            }

            throw new Error("No se pudo crear el plan de estudios");
        } catch (error) {
            console.error("Error al crear plan de estudios:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "Existe un problema al momento de crear el registro",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Breadcrumb pageName="Nuevo plan de estudios" />

            <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Seleccionar carrera</label>
                        <select
                            value={values.career_id}
                            onChange={(event) => handleChange("career_id", event.target.value)}
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
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Nombre del plan</label>
                            <input
                                type="text"
                                value={values.name}
                                onChange={(event) => handleChange("name", event.target.value)}
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
                                onChange={(event) => handleChange("year", event.target.value)}
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
                                onChange={(event) => handleChange("suggested_semester", event.target.value)}
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
                                    onChange={(event) => handleChange("is_published", event.target.checked)}
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
                            onClick={() => navigate("/admin/study-plans")}
                            className="rounded-lg border border-stroke px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || loadingCareers}
                            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Guardando..." : "Guardar plan"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateStudyPlan;
