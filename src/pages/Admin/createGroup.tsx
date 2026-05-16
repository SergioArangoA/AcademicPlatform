import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import GroupForm from "../../components/GroupForm";
import { GroupPayload } from "../../models/Groups/GroupPayload";
import { groupService } from "../../services/groupService";
import { semesterService } from "../../services/semesterService";

const CreateGroup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCreate = async (values: GroupPayload) => {
        setLoading(true);
        try {
            const semesters = await semesterService.getSemesters();
            const active = semesters.find((s) => s.is_active);
            if (!active?.id) {
                throw new Error("No hay un semestre activo. Activa uno en Carreras y semestres.");
            }

            const allGroups = await groupService.getGroups();
            const codeOk = groupService.validateGroupCodeUniqueInSemester(
                allGroups,
                values.group_code,
                String(active.id)
            );
            if (!codeOk) {
                throw new Error("El código de grupo ya existe en este semestre.");
            }

            if (values.capacity <= 0) {
                throw new Error("El cupo máximo debe ser mayor a cero.");
            }

            await groupService.createGroup({
                ...values,
                semester_id: String(active.id),
            });

            await Swal.fire({
                title: "Completado",
                text: "Grupo creado correctamente",
                icon: "success",
                timer: 2500,
            });
            navigate("/admin/groups/list");
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: groupService.getErrorMessage(error),
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Breadcrumb pageName="Nuevo grupo" />
            <GroupForm mode={1} loading={loading} onSubmit={handleCreate} />
        </>
    );
};

export default CreateGroup;
