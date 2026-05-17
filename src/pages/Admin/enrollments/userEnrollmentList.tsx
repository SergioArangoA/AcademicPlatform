import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GenericTable from "../../../components/GenericTable"; // Ajusta la ruta
import FilterBar, { FilterValues } from "../../../components/FilterBar";
import { userPService } from "../../../services/userPService";
import { transformUsersForList } from "../../../utils/userTransformers";
import { UserResponse } from "../../../models/Users/UserResponse";
import { UserForList } from "../../../models/Users/UserForList";
import { Registration } from "../../../models/Registration";
import { registrationService } from "../../../services/registrationService";
import { Career } from "../../../models/Careers/Career";
import { careerService } from "../../../services/careerService";
import Swal from "sweetalert2";

const initialFilterValues: FilterValues = {
    search: "",
    role: "all",
    status: "all",
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const UserEnrollmentList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserForList[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [filters, setFilters] = useState<FilterValues>(initialFilterValues);

    const fetchUsers = async () => {
        const rawData: UserResponse[] = await userPService.getUsers();
        const formattedData: UserForList[] = transformUsersForList(rawData);
        const students = formattedData.filter((user) => user.role === "STUDENT");

        const registrationsData = await registrationService.getRegistrations();
        const careersData = await careerService.getCareers();

        setUsers(students);
        setRegistrations(registrationsData);
        setCareers(careersData);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const userRows = useMemo(() => {
        return users.map((user) => {
            const possibleStudentIds = [
                user.id,
                user.profile?.id,
                user.profile?.user_id,
            ].filter(Boolean) as string[];

            const userRegistrations = registrations.filter((reg) =>
                possibleStudentIds.includes(reg.student_id)
            );
            const selectedRegistration =
                userRegistrations.find((reg) => reg.is_active) ||
                userRegistrations[0] ||
                null;
            const careerName = selectedRegistration
                ? careers.find(
                      (career) =>
                          career.id === selectedRegistration.career_id ||
                          career.code === selectedRegistration.career_id
                  )?.name ?? ""
                : "";

            return {
                ...user,
                registration_id: selectedRegistration?.id ?? null,
                registration_state: selectedRegistration
                    ? selectedRegistration.is_active
                        ? "Activo"
                        : "Inactivo"
                    : "Sin matrícula",
                registration_is_active: selectedRegistration?.is_active ?? false,
                career_name: selectedRegistration
                    ? careerName || "Sin matrícula"
                    : "Sin matrícula",
                admission_period: selectedRegistration?.admission_period ?? "",
                academic_status: selectedRegistration?.academic_status ?? "",
            };
        });
    }, [registrations, users, careers]);

    const filteredUsers = useMemo(() => {
        const search = normalizeText(filters.search ?? "");
        const status = filters.status ?? "all";

        return userRows.filter((user) => {
            const matchesSearch =
                search === "" ||
                [user.code, user.name, user.email, user.career_name]
                    .join(" ")
                    .toLowerCase()
                    .includes(search);
            const matchesStatus =
                status === "all" ||
                (status === "active" && user.is_active) ||
                (status === "inactive" && !user.is_active);

            return matchesSearch && matchesStatus;
        });
    }, [filters.search, filters.role, filters.status, userRows]);

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
        { key: "career_name", label: "Carrera" },
        { key: "is_active", label: "Estado" },
    ];

    const actions = [
        { name: "view", label: "Gestionar inscripciones" },
    ];

    const handleAction = async (name: string, item: Record<string, any>) => {
        switch (name) {
            case "view":
                navigate(`/admin/enrollment/users/${item.id}`);
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

export default UserEnrollmentList;
