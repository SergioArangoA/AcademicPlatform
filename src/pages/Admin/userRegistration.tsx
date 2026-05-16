import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userPService } from "../../services/userPService";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import UserFormValidator from "../../components/UserForm";
import UserCard from "../../components/users/UserInformationCard";
import DropdownForm from "../../components/DropdownForm";
import { UserResponse } from "../../models/Users/UserResponse";
import { Semester } from "../../models/Semesters/Semester";
import { semesterService } from "../../services/semesterService";
import { Career } from "../../models/Careers/Career";
import { careerService } from "../../services/careerService";
import { transformUsersForList } from "../../utils/userTransformers";
import { UserForList } from "../../models/Users/UserForList";
import { Registration } from "../../models/Registration";
import { registrationService } from "../../services/registrationService";
import { userService } from "../../services/userService";



const ConfigurateUserRegistration = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserForList | null>(null);
    const [careers, setCareers] = useState<Career[] | null>(null);
    const [semesters, setSemesters] = useState<Semester[] | null>(null);
    const [selectedCareer, setSelectedCareer] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedAcademicStatus, setSelectedAcademicStatus] = useState("");
    const [registrationList, setRegistrations] = useState<Registration[] | null>(null);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const careersData = await careerService.getCareers();
        const semestersData = await semesterService.getSemesters();
        const rawUser: UserResponse = await userPService.getUserById(id);
        console.log(rawUser);
        const users = [rawUser];
        const formattedUser: UserForList[] = transformUsersForList(users);
        const registrationData = await registrationService.getRegistrations();
        setUser(formattedUser[0]);
        setCareers(careersData);
        setSemesters(semestersData);
        setRegistrations(registrationData)
        console.log(formattedUser[0]);
    };
        useEffect(() => {
    if (!registrationList || !user) return;
    if (!selectedCareer || !selectedSemester) return;

    const found = registrationList.find((reg) =>
        reg.student_id === user.id &&
        reg.career_id === selectedCareer
    );

    if (found) {
        setSelectedRegistration(found);
    } else {
        setSelectedRegistration(null);
    }

    }, [selectedCareer, selectedSemester, registrationList, user]);

    function generarMatricula(){
        if (!selectedCareer || !selectedSemester || !selectedAcademicStatus){
            Swal.fire({
                icon: "error",
                title: "Operación fallida",
                text: "Revisa que todos los campos obligatorios estén completos antes de continuar.",
                confirmButtonText: "Entendido",
            });
            return;
        }
        else if (!user?.is_active){
            Swal.fire({
                icon: "error",
                title: "Operación fallida",
                text: "No se pudo generar la matrícula porque el usuario no se encuentra activo.",
                confirmButtonText: "Entendido",
            });
            return;
        }
        const registration: Registration = {
            student_id: user.id,
            career_id: selectedCareer,
            admission_period: selectedSemester,
            academic_status: selectedAcademicStatus,
            is_active: true
        }
        Swal.fire({
            title: "¿Estás seguro?",
            html: `
                <div class="text-left bg-green-100 dark:bg-green-900 p-4 rounded-xl">
                
                <h2 class="text-lg font-bold mb-3 text-green-800 dark:text-green-200">
                    Datos de matrícula
                </h2>

                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Carrera:</span> Ingeniería de Sistemas
                </p>

                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Periodo de ingreso:</span> 5
                </p>

                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Estado:</span> Activo
                </p>

                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, continuar",
            cancelButtonText: "No, cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                registrationService.createRegistration(registration).then((response)=>{
                    if (response){
                        Swal.fire({
                            icon: "success",
                            title: "Operación exitosa",
                            text: "La matrícula se ha guardado correctamente.",
                            confirmButtonText: "Aceptar",
                        });
                    }
                    else {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "No se pudo completar la operación.",
                        });
                    }
                });
            }
        });
    }

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
    <div
        className="
        w-full
        max-w-xl
        mx-auto
        p-6
        rounded-2xl
        shadow-md

        bg-white
        text-gray-900

        dark:bg-b-900
        dark:text-gray-100
        "
    >

        <h2 className="text-xl font-semibold mb-6">
        Gestionar matrícula
        </h2>

        <UserCard {...user} />

        {/* DROPDOWNS */}
        <div className="flex flex-col gap-5 mt-6">

        <DropdownForm
            title="Carrera"
            options={careers ?? []}
            value={selectedCareer}
            onChange={setSelectedCareer}
            labelKey="name"
            valueKey="code"
        />

        <DropdownForm
            title="Periodo de ingreso"
            options={semesters ?? []}
            value={selectedSemester}
            onChange={setSelectedSemester}
            labelKey="name"
            valueKey="name"
        />

        <DropdownForm
            title="Estado"
            options={[
            { label: "Activo", value: "ACTIVE" },
            { label: "Inactivo", value: "INACTIVE" },
            { label: "Retirado", value: "RETIRED" },
            { label: "Egresado", value: "GRADUATED" },
            ]}
            value={selectedAcademicStatus}
            onChange={setSelectedAcademicStatus}
            labelKey="label"
            valueKey="value"
        />

        </div>

        {/* BOTÓN / PANEL */}
        {!selectedRegistration ? (

        <button
            className="
            mt-6
            w-full
            bg-green-600
            text-white
            py-2
            rounded-xl
            hover:bg-green-700
            transition
            "
            onClick={generarMatricula}
        >
            Crear matrícula
        </button>

        ) : (

        <div
            className="
            mt-6
            p-4
            rounded-xl
            border

            bg-gray-50
            border-gray-200

            dark:bg-gray-800
            dark:border-gray-700
            "
        >

            <h3 className="text-lg font-semibold mb-4">
            Editar matrícula
            </h3>

            <DropdownForm
            title="Carrera"
            options={careers ?? []}
            value={selectedCareer}
            onChange={setSelectedCareer}
            labelKey="name"
            valueKey="code"
            />

            <DropdownForm
            title="Estado"
            options={[
                { label: "Activo", value: "ACTIVE" },
                { label: "Inactivo", value: "INACTIVE" },
                { label: "Retirado", value: "RETIRED" },
                { label: "Egresado", value: "GRADUATED" },
            ]}
            value={selectedAcademicStatus}
            onChange={setSelectedAcademicStatus}
            labelKey="label"
            valueKey="value"
            />

            <button
            className="
                mt-4
                w-full
                bg-blue-600
                text-white
                py-2
                rounded-xl
                hover:bg-blue-700
                transition
            "
            onClick={() => {
                console.log("Editar matrícula", {
                registration: selectedRegistration,
                career: selectedCareer,
                status: selectedAcademicStatus,
                });
            }}
            >
            Editar matrícula
            </button>

        </div>
        )}

    </div>
    );
};
export default ConfigurateUserRegistration;