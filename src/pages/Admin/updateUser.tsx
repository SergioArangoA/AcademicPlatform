import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userPService } from "../../services/userPService";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import UserFormValidator from "../../components/UserForm";
import { UserResponse } from "../../models/Users/UserResponse";
import { UpdateUserPayload } from "../../models/Users/UpdateUserPayload";

const UpdateUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserResponse | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;

            const userData = await userPService.getUserById(id);
            setUser(userData);
        };

        fetchUser();
    }, [id]);

    const handleUpdateUser = async (payload: UpdateUserPayload) => {
        try {
            if (!user?.id) {
                throw new Error("ID de usuario no disponible");
            }

            const updatedUser = await userPService.updateUser(user.id, payload);
            
            if (updatedUser) {
                Swal.fire({
                    title: "Completado",
                    text: "Se ha actualizado correctamente el registro",
                    icon: "success",
                    timer: 3000,
                });
                navigate("/admin/user-list");
            } else {
                throw new Error("No se pudo actualizar el usuario");
            }
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            Swal.fire({
                title: "Error",
                text: "Existe un problema al momento de actualizar el registro",
                icon: "error",
                timer: 3000,
            });
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-600">Cargando usuario...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Breadcrumb pageName="Actualizar Usuario" />
            <UserFormValidator
                handleAction={handleUpdateUser}
                mode={2}
                user={user}
            />
        </>
    );
};

export default UpdateUser;