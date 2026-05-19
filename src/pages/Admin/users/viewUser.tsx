import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../../components/Breadcrumb";
import UserFormValidator from "../../../components/UserForm";
import { UserResponse } from "../../../models/Users/UserResponse";
import { userPService } from "../../../services/userPService";

const ViewUser = () => {
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
            <Breadcrumb pageName="Ver Usuario" />
            <UserFormValidator
                handleAction={() => navigate(-1)}
                mode={3}
                user={user}
            />
        </>
    );
};

export default ViewUser;
