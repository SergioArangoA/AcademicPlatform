import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../../components/Breadcrumb";
import SubjectForm from "../../../components/SubjectForm";
import { Subject } from "../../../models/Subjects/Subject";
import { SubjectPayload } from "../../../models/Subjects/SubjectPayload";
import { subjectService } from "../../../services/subjectService";
import { hasGroupsInActiveSpringterm } from "../../../utils/checkGroupsBySubject";

const UpdateSubject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubject = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            const subjectData = await subjectService.getSubjectById(id);
            setSubject(subjectData);
            setLoading(false);
        };

        fetchSubject();
    }, [id]);

    const handleUpdateSubject = async (values: SubjectPayload) => {
        try {
            if (!subject?.id) {
                throw new Error("ID de la asignatura no disponible");
            }

            // Verificar si existe algún grupo para esta asignatura en el semestre activo
            const hasGroups = await hasGroupsInActiveSpringterm(subject.id);
            if (hasGroups) {
                throw new Error("No se puede cambiar una asignatura con grupo en el semestre activo");
            }

            const subjectLabel = subject.name || subject.code || "esta asignatura";
            const confirmation = await Swal.fire({
                title: "Confirmar actualización",
                text: `¿Seguro que desea guardar los cambios de la asignatura "${subjectLabel}"?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, guardar cambios",
                cancelButtonText: "Cancelar",
                reverseButtons: true,
            });

            if (!confirmation.isConfirmed) {
                return;
            }

            const updatedSubject = await subjectService.updateSubject(subject.id, values);

            if (updatedSubject) {
                await Swal.fire({
                    title: "Completado",
                    text: "Se ha actualizado correctamente el registro",
                    icon: "success",
                    timer: 3000,
                });
                navigate("/admin/subjects-list");
                return;
            }

            throw new Error("No se pudo actualizar la asignatura");
        } catch (error) {
            console.error("Error al actualizar asignatura:", error);
            const errorMessage = error instanceof Error ? error.message : "Existe un problema al momento de actualizar el registro";
            Swal.fire({
                title: "Error",
                text: errorMessage,
                icon: "error",
                timer: 3000,
            });
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-600">Cargando asignatura...</p>
                </div>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No se encontró la asignatura solicitada.</p>
                    <button
                        type="button"
                        onClick={() => navigate("/admin/subjects-list")}
                        className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-black transition hover:bg-green-700"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Breadcrumb pageName="Editar asignatura" />
            <SubjectForm mode={2} subject={subject} onSubmit={handleUpdateSubject} />
        </>
    );
};

export default UpdateSubject;