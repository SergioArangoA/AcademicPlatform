import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../../components/Breadcrumb";
import StudyPlanForm, { StudyPlanFormValues } from "../../../components/StudyPlanForm";
import { Career } from "../../../models/Careers/Career";
import { StudyPlan } from "../../../models/StudyPlan/StudyPlan";
import { StudyPlanPayload } from "../../../models/StudyPlan/StudyPlanPayload";
import { careerService } from "../../../services/careerService";
import { studyplanService } from "../../../services/studyplanService";

const UpdateStudyPlan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [careers, setCareers] = useState<Career[]>([]);
    const [loadingCareers, setLoadingCareers] = useState(true);
    const [loading, setLoading] = useState(false);
    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
    const [values, setValues] = useState<StudyPlanFormValues>({
        career_id: "",
        name: "",
        year: "2026",
        suggested_semester: "1",
        is_published: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoadingCareers(true);
            try {
                const [careersData, planData] = await Promise.all([
                    careerService.getCareers(),
                    id ? studyplanService.getStudyPlanById(id) : Promise.resolve(null),
                ]);

                setCareers(careersData);

                if (planData) {
                    setStudyPlan(planData);
                    setValues({
                        career_id: String(planData.career_id),
                        name: planData.name,
                        year: String(planData.year),
                        suggested_semester: String(planData.suggested_semester),
                        is_published: planData.is_published,
                    });
                }
            } catch (error) {
                console.error("Error al cargar datos:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudieron cargar los datos",
                });
            } finally {
                setLoadingCareers(false);
            }
        };

        void fetchData();
    }, [id]);

    const handleChange = (key: keyof StudyPlanFormValues, value: string | boolean) => {
        setValues((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!values.name.trim() || !values.year || !values.suggested_semester) {
            Swal.fire({
                icon: "warning",
                title: "Faltan datos",
                text: "Completa el nombre, el año y el semestre sugerido.",
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
            title: "Confirmar actualización",
            html: `
                <div style="text-align:left; line-height:1.6">
                    <p>¿Seguro que desea actualizar el plan de estudios?</p>
                    <p><strong>Carrera:</strong> ${careerName}</p>
                    <p><strong>Nombre:</strong> ${payload.name}</p>
                    <p><strong>Año:</strong> ${payload.year}</p>
                    <p><strong>Semestre sugerido:</strong> ${payload.suggested_semester}</p>
                    <p><strong>Publicado:</strong> ${payload.is_published ? "Sí" : "No"}</p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Sí, actualizar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        setLoading(true);
        try {
            if (!id) {
                throw new Error("ID de plan de estudios no disponible");
            }

            const updatedStudyPlan = await studyplanService.updateStudyPlan(id, payload);

            if (updatedStudyPlan) {
                await Swal.fire({
                    icon: "success",
                    title: "Plan actualizado",
                    text: "El plan de estudios se actualizó correctamente.",
                    timer: 2200,
                    showConfirmButton: false,
                });
                navigate("/admin/study-plans");
                return;
            }

            throw new Error("No se pudo actualizar el plan de estudios");
        } catch (error) {
            console.error("Error al actualizar plan de estudios:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "Existe un problema al momento de actualizar el registro",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!studyPlan) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-600">Cargando plan de estudios...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Breadcrumb pageName="Actualizar plan de estudios" />
            <StudyPlanForm
                values={values}
                careers={careers}
                onValueChange={handleChange}
                onSubmit={handleSubmit}
                loading={loading}
                loadingCareers={loadingCareers}
                readonlyCareer={true}
                submitButtonLabel="Actualizar plan"
            />
        </>
    );
};

export default UpdateStudyPlan;
