import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import GroupForm from "../../components/GroupForm";
import { GroupPayload } from "../../models/Groups/GroupPayload";
import { groupService } from "../../services/groupService";
import { isGroupArchivedLocally } from "../../utils/groupArchiveStorage";

const UpdateGroup = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<Awaited<ReturnType<typeof groupService.getGroupById>>>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        groupService.getGroupById(id).then(setGroup);
    }, [id]);

    const handleUpdate = async (values: GroupPayload) => {
        if (!id || !group) return;

        if ((group.enrolled_count ?? 0) > 0 && values.subject_id !== String(group.subject_id)) {
            Swal.fire({
                title: "No permitido",
                text: "No puedes cambiar la asignatura si hay inscripciones activas.",
                icon: "warning",
            });
            return;
        }

        if (values.capacity <= 0) {
            Swal.fire({ title: "Error", text: "El cupo debe ser mayor a cero.", icon: "error" });
            return;
        }

        if (values.capacity < (group.enrolled_count ?? 0)) {
            Swal.fire({
                title: "Error",
                text: "El cupo no puede ser menor que las inscripciones activas actuales.",
                icon: "error",
            });
            return;
        }

        setLoading(true);
        try {
            const allGroups = await groupService.getGroups();
            const codeOk = groupService.validateGroupCodeUniqueInSemester(
                allGroups,
                values.group_code,
                values.semester_id,
                id
            );
            if (!codeOk) {
                throw new Error("El código de grupo ya existe en este semestre.");
            }

            await groupService.updateGroup(id, {
                subject_id: values.subject_id,
                name: values.name,
                group_code: values.group_code,
                capacity: values.capacity,
                teacher_id: values.teacher_id,
                semester_id: values.semester_id,
            });

            await Swal.fire({
                title: "Completado",
                text: "Grupo actualizado correctamente",
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

    if (!group) {
        return (
            <>
                <Breadcrumb pageName="Editar grupo" />
                <p className="p-4 text-gray-500">Cargando grupo...</p>
            </>
        );
    }

    if (isGroupArchivedLocally(id!)) {
        return (
            <>
                <Breadcrumb pageName="Editar grupo" />
                <p className="p-4 text-amber-600">Este grupo está archivado y no puede editarse.</p>
            </>
        );
    }

    return (
        <>
            <Breadcrumb pageName="Editar grupo" />
            <GroupForm mode={2} group={group} loading={loading} onSubmit={handleUpdate} />
        </>
    );
};

export default UpdateGroup;
