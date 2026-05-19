import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../../components/Breadcrumb";
import SubjectForm from "../../../components/SubjectForm";
import { SubjectPayload } from "../../../models/Subjects/SubjectPayload";
import { subjectService } from "../../../services/subjectService";

const CreateSubject = () => {
    const navigate = useNavigate();

    const handleCreateSubject = async (values: SubjectPayload) => {
        try {
            const subjectLabel = values.name || values.code || "esta asignatura";
            const confirmation = await Swal.fire({
                title: "Confirmar creación",
                text: `¿Seguro que desea guardar la asignatura "${subjectLabel}"?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, guardar asignatura",
                cancelButtonText: "Cancelar",
                reverseButtons: true,
            });

            if (!confirmation.isConfirmed) {
                return;
            }

            const createdSubject = await subjectService.createSubject(values);

            if (createdSubject) {
                await Swal.fire({
                    title: "Completado",
                    text: "Se ha creado correctamente la asignatura",
                    icon: "success",
                    timer: 3000,
                });
                navigate("/admin/subjects-list");
                return;
            }

            throw new Error("No se pudo crear la asignatura");
        } catch (error) {
            console.error("Error al crear asignatura:", error);
            Swal.fire({
                title: "Error",
                text: "Existe un problema al momento de crear el registro",
                icon: "error",
                timer: 3000,
            });
        }
    };

    return (
        <>
            <Breadcrumb pageName="Nueva asignatura" />
            <SubjectForm mode={1} onSubmit={handleCreateSubject} />
        </>
    );
};

export default CreateSubject;