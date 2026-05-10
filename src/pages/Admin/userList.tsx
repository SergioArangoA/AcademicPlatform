import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GenericTable from "../../components/GenericTable"; // Ajusta la ruta
import FilterBar, { FilterValues } from "../../components/FilterBar";
import { userPService } from "../../services/userPService";
import { transformUsersForList } from "../../utils/userTransformers";
import { UserResponse } from "../../models/Users/UserResponse";
import { UserForList } from "../../models/Users/UserForList";

const initialFilterValues: FilterValues = {
    search: "",
    role: "all",
    status: "all",
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserForList[]>([]);
    const [filters, setFilters] = useState<FilterValues>(initialFilterValues);

    const fetchUsers = async () => {
        const rawData: UserResponse[] = await userPService.getUsers();
        const formattedData: UserForList[] = transformUsersForList(rawData);

        setUsers(formattedData);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const search = normalizeText(filters.search ?? "");
        const role = filters.role ?? "all";
        const status = filters.status ?? "all";

        return users.filter((user) => {
            const matchesSearch =
                search === "" ||
                [user.code, user.name, user.email]
                    .join(" ")
                    .toLowerCase()
                    .includes(search);

            const matchesRole = role === "all" || user.role === role;
            const matchesStatus =
                status === "all" ||
                (status === "active" && user.is_active) ||
                (status === "inactive" && !user.is_active);

            return matchesSearch && matchesRole && matchesStatus;
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
            placeholder: "Buscar por nombre, email o código...",
        },
        {
            key: "role",
            label: "Rol",
            type: "select" as const,
            options: [
                { value: "all", label: "Todos" },
                { value: "ADMIN", label: "Admin" },
                { value: "STUDENT", label: "Estudiante" },
                { value: "TEACHER", label: "Docente" },
            ],
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
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre" },
        { key: "email", label: "Email" },
        { key: "role", label: "Rol" },
        { key: "is_active", label: "Estado" },
        { key: "created_at", label: "Fecha de Creación" },
    ];

    const actions = [
        { name: "view", label: "Ver" },
        { name: "edit", label: "Editar" },
        { name: "delete", label: "Desactivar" }
    ];

    const handleAction = async (name: string, item: Record<string, any>) => {
        switch (name) {
            case "edit":
                navigate(`/admin/users/edit/${item.id}`);
                break;
            case "view":
                navigate(`/admin/users/view/${item.id}`);
                break;
            case "delete":
                try {
                    const ok = await userPService.deactivateUser(item.id);
                    if (ok) {
                        // Refrescar lista
                        await fetchUsers();
                        // Mostrar notificación simple
                        // import Swal dynamically to avoid adding top-level dep if not present
                        const Swal = (await import('sweetalert2')).default;
                        Swal.fire({ title: 'Completado', text: 'Usuario desactivado', icon: 'success', timer: 2000 });
                    } else {
                        const Swal = (await import('sweetalert2')).default;
                        Swal.fire({ title: 'Error', text: 'No se pudo desactivar el usuario', icon: 'error', timer: 3000 });
                    }
                } catch (err) {
                    console.error('Error al desactivar usuario', err);
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

export default UserList;
