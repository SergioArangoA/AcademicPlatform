import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../../components/Breadcrumb";
import StudyPlanForm, { StudyPlanFormValues } from "../../../components/StudyPlanForm";
import { Career } from "../../../models/Careers/Career";
import { StudyPlanPayload } from "../../../models/StudyPlan/StudyPlanPayload";
import { careerService } from "../../../services/careerService";
import { studyplanService } from "../../../services/studyplanService";

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
            <StudyPlanForm
                values={values}
                careers={careers}
                onValueChange={handleChange}
                onSubmit={handleSubmit}
                loading={loading}
                loadingCareers={loadingCareers}
                submitButtonLabel="Guardar plan"
            />
        </>
    );
};

export default CreateStudyPlan;
