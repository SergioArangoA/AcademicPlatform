import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import UserFormValidator from "../../components/UserForm";
import { UpdateUserPayload } from "../../models/Users/UpdateUserPayload";
import { userPService } from "../../services/userPService";
import FirebaseAuthService from "../../services/firebaseAuthService"

const normalizeDuplicateMessage = (message: string) => {
    const normalized = message.toLowerCase();

    if (normalized.includes("email")) {
        return "El email ya está registrado en el sistema";
    }

    if (normalized.includes("código") || normalized.includes("codigo")) {
        return "El código ya está registrado en el sistema";
    }

    if (normalized.includes("id")) {
        return "El id ya está registrado en el sistema";
    }

    return message || "No se pudo crear el usuario";
};

const CreateUser = () => {
    const navigate = useNavigate();

    const handleCreateUser = async (values: UpdateUserPayload, role: "ADMIN" | "STUDENT" | "TEACHER") => {
        try {
            if (role === "ADMIN") {
                Swal.fire({
                    title: "No permitido",
                    text: "Desde esta pantalla solo se pueden crear estudiantes o docentes",
                    icon: "warning",
                    timer: 3000,
                });
                return;
            }

            if (!values.password) {
                Swal.fire({
                    title: "Error",
                    text: "La contraseña es obligatoria",
                    icon: "error",
                    timer: 3000,
                });
                return;
            }
            FirebaseAuthService.registerWithEmailPassword(values.email,values.password);

            const result =
                role === "TEACHER"
                    ? await userPService.registerTeacher(values as UpdateUserPayload & { password: string })
                    : await userPService.registerStudent(values as UpdateUserPayload & { password: string });
            
            if (result.success) {
                Swal.fire({
                    title: "Completado",
                    text: result.message || "Se ha creado correctamente el usuario",
                    icon: "success",
                    timer: 3000,
                });
                navigate("/admin/user-list");
                return;
            }

            Swal.fire({
                title: "Error",
                text: normalizeDuplicateMessage(result.message),
                icon: "error",
                timer: 3000,
            });
        } catch (error) {
            console.error("Error al crear usuario:", error);
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
            <Breadcrumb pageName="Crear Usuario" />
            <UserFormValidator
                handleAction={handleCreateUser}
                mode={1}
            />
        </>
    );
};

export default CreateUser;