import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GenericTable from "../../components/GenericTable"; // Ajusta la ruta
import FilterBar, { FilterValues } from "../../components/FilterBar";
import { userPService } from "../../services/userPService";
import { transformUsersForList } from "../../utils/userTransformers";
import { UserResponse } from "../../models/Users/UserResponse";
import { UserForList } from "../../models/Users/UserForList";
import Swal from "sweetalert2";

const initialFilterValues: FilterValues = {
    search: "",
    role: "all",
    status: "all",
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const UserRegistrationList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserForList[]>([]);
    const [filters, setFilters] = useState<FilterValues>(initialFilterValues);

    const fetchUsers = async () => {
        const rawData: UserResponse[] = await userPService.getUsers();
        const formattedData: UserForList[] = transformUsersForList(rawData);

        const students = formattedData.filter((user) => (user.role === "STUDENT"));

        setUsers(students);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const search = normalizeText(filters.search ?? "");
        const status = filters.status ?? "all";

        return users.filter((user) => {
            const matchesSearch =
                search === "" ||
                [user.code, user.name, user.email]
                    .join(" ")
                    .toLowerCase()
                    .includes(search);
            const matchesStatus =
                status === "all" ||
                (status === "active" && user.is_active) ||
                (status === "inactive" && !user.is_active);

            return matchesSearch && matchesStatus;
        });
    }, [filters.search, filters.role, filters.status, users]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters(initialFilterValues);
    };

    const filterConfigs = [
        {
            key: "search",
            label: "Buscar",
            type: "text" as const,
            placeholder: "Buscar por nombre, apellido o cédula...",
        },
        {
            key: "status",
            label: "Estado",
            type: "select" as const,
            options: [
                { value: "all", label: "Todos" },
                { value: "active", label: "Activo" },
                { value: "inactive", label: "Inactivo" },
            ],
        },
    ];

    const columns = [
        { key: "name", label: "Nombre" },
        { key: "is_active", label: "Estado" },
    ];

    const actions = [
        { name: "view", label: "Gestionar matrícula" },
    ];

    const handleAction = async (name: string, item: Record<string, any>) => {
        switch (name) {
            case "view":
                if (item.is_active){
                    navigate(`/admin/users/view/${item.id}`);
                }
                else{
                    Swal.fire({
                        title: "Error",
                        text: "El usuario no se encuentra activo actualmente",
                        icon: "error",
                        timer: 3000,
                    });
                    return;
                }
                break;
            default:
                console.log(`Acción desconocida: ${name}`);
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-black dark:text-white">Gestión de Usuarios</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {filteredUsers.length} de {users.length} usuarios visibles
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/admin/users/create")}
                    className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-black shadow-md transition hover:bg-green-700 active:bg-green-800"
                >
                    Crear usuario
                </button>
            </div>

            <div className="mb-4">
                <FilterBar
                    filters={filterConfigs}
                    values={filters}
                    onChange={handleFilterChange}
                    onClear={handleClearFilters}
                />
            </div>

            <GenericTable 
                data={filteredUsers} 
                columns={columns} 
                actions={actions} 
                onAction={handleAction} 
            />
        </div>
    );
};

export default UserRegistrationList;
