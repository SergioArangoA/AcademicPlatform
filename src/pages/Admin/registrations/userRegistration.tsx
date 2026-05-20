import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userPService } from "../../../services/userPService";
import Swal from "sweetalert2";
import Breadcrumb from "../../../components/Breadcrumb";
import UserFormValidator from "../../../components/UserForm";
import UserCard from "../../../components/users/UserInformationCard";
import RegistrationCard from "../../../components/registrations/RegistrationCard";
import DropdownForm from "../../../components/DropdownForm";
import { UserResponse } from "../../../models/Users/UserResponse";
import { Semester } from "../../../models/Semesters/Semester";
import { semesterService } from "../../../services/semesterService";
import { Career } from "../../../models/Careers/Career";
import { careerService } from "../../../services/careerService";
import { transformUsersForList } from "../../../utils/userTransformers";
import { UserForList } from "../../../models/Users/UserForList";
import { Registration } from "../../../models/Registration";
import { registrationService } from "../../../services/registrationService";




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
    const [newCareer, setNewCareer] = useState("");
    const [newAcademicStatus, setNewAcademicStatus] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const careersData = await careerService.getCareers();
        const semestersData = await semesterService.getSemesters();
        const rawUser: UserResponse | null = await userPService.getUserById(id);
        if (!rawUser) return;
        const users = [rawUser];
        const formattedUser: UserForList[] = transformUsersForList(users);
        const registrationData = await registrationService.getRegistrations();
        setUser(formattedUser[0]);
        setCareers(careersData);
        setSemesters(semestersData);
        setRegistrations(registrationData)
    };
        useEffect(() => {
    if (!registrationList || !user) return;
    if (!selectedCareer) return;

    const found = registrationList.find((reg) =>
        reg.student_id === user.profile?.id &&
        reg.career_id === selectedCareer
    );

    if (found) {
        setSelectedRegistration(found);
    } else {
        setSelectedRegistration(null);
    }

    }, [selectedCareer, registrationList, user]);

    function generateRegistration(){
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
        const career = careers?.find(
            c => c.id === selectedCareer
        );;
        const registration: Registration = {
            student_id: user.profile?.id ?? user.id,
            career_id: selectedCareer,
            admission_period: selectedSemester,
            academic_status: selectedAcademicStatus,
            is_active: true
        }
        const duplicates = alreadyExists("NEW");
        if (duplicates) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "El usuario ya tiene una matrícula existente en esa carrera.",
            });
            return;
        }

        Swal.fire({
            title: "¿Estás seguro?",
            html: `
                <div class="text-left bg-green-100 dark:bg-green-900 p-4 rounded-xl">
                
                <h2 class="text-lg font-bold mb-3 text-green-800 dark:text-green-200">
                    Datos de matrícula
                </h2>
                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Usuario:</span> ${user.name}
                </p>
                
                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">ID:</span> ${user.code}
                </p>

                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Carrera:</span> ${career?.code || selectedCareer}
                </p>

                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Periodo de ingreso:</span> ${selectedSemester}
                </p>

                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Estado:</span> ${selectedAcademicStatus}
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
                    user.registration_id = response?.id;
                    userPService.updateUser(user.id,user);

                    if (response){
                            Swal.fire({
                                icon: "success",
                                title: "Operación exitosa",
                                text: "La matrícula se ha guardado correctamente.",
                                confirmButtonText: "Aceptar",
                            }).then(() => {
                                fetchData();
                                navigate('/admin/registration/users/list');
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

    function editRegistration(){
        if (!newCareer && !newAcademicStatus){
            Swal.fire({
                icon: "error",
                title: "Operación fallida",
                text: "Llene al menos uno de los campos que desea editar",
                confirmButtonText: "Entendido",
            });
            return;
        }
        else if (!user?.is_active){
            Swal.fire({
                icon: "error",
                title: "Operación fallida",
                text: "No se pudo generar la nueva matrícula porque el usuario no se encuentra activo.",
                confirmButtonText: "Entendido",
            });
            return;
        }
        const registration = selectedRegistration;
        const oldCareerInstance = careers?.find(
            c => c.id === selectedCareer
        );
        const newCareerInstance = careers?.find(
            c => c.id === newCareer
        );
        Swal.fire({
            title: "¿Estás seguro?",
            html: `
                <div class="text-left bg-green-100 dark:bg-green-900 p-4 rounded-xl">
                
                <h2 class="text-lg font-bold mb-3 text-green-800 dark:text-green-200">
                    Datos de matrícula
                </h2>
                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Usuario:</span> ${user.name}
                </p>
                
                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">ID:</span> ${user.code}
                </p>

                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Antigua carrera:</span> ${oldCareerInstance.code}
                </p>

                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Nueva carrera:</span> ${newCareerInstance?.code || ""}
                </p>

                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Periodo de ingreso:</span> ${registration?.admission_period}
                </p>
                
                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Anterior estado:</span> ${registration?.academic_status}
                </p>

                <p class="mb-2 text-green-900 dark:text-green-100">
                    <span class="font-semibold">Nuevo estado:</span> ${newAcademicStatus}
                </p>

                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, continuar",
            cancelButtonText: "No, cancelar",
        }).then((result) => {
            
            if (result.isConfirmed) {
                if (newCareer) {
                    const duplicates = alreadyExists("EDIT");
                    if (duplicates){
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "El usuario ya tiene una matrícula existente en esa carrera.",
                        });
                        return;
                    }
                }

                if (newAcademicStatus) selectedRegistration.academic_status = newAcademicStatus;
                if (newCareer) selectedRegistration.career_id = newCareer;

                registrationService.updateRegistration(selectedRegistration?.id,selectedRegistration).then((response)=>{
                    if (response){
                        Swal.fire({
                            icon: "success",
                            title: "Operación exitosa",
                            text: "La matrícula se ha actualizado correctamente.",
                            confirmButtonText: "Aceptar",
                        }).then(() => {
                            fetchData();
                            navigate('/admin/registration/users/list');
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

    function alreadyExists(key: string): boolean{
        const filtered = registrationList.filter(r => r.student_id === user.profile?.id || r.student_id === user.id);
        if (key === "NEW"){
            const duplicates = filtered.filter(r => r.career_id === newCareer);
            return (duplicates.length > 0);
        }

        else if (key === "EDIT"){
            // Check if user already has a registration in the NEW career
            // but exclude the current registration being edited
            const duplicates = filtered.filter(r => 
                r.career_id === newCareer && 
                r.id !== selectedRegistration?.id
            );
            return (duplicates.length > 0);
        }
        return true;
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 rounded-md border border-stroke bg-white shadow-sm hover:bg-gray-100 dark:bg-boxdark dark:border-strokedark"
                >
                    Volver
                </button>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-600">Cargando usuario...</p>
                </div>
            </div>
        );
    }
    if (!user.is_active){
        return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-md border border-stroke bg-white shadow-sm hover:bg-gray-100 dark:bg-boxdark dark:border-strokedark"
            >
                Volver
            </button>
            
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Gestionar matrícula
            </h2>

            <div className="flex flex-col lg:flex-row gap-6">

            {/* 🔵 IZQUIERDA: FORM */}
            <div className="w-full lg:w-1/2">

                <div className="rounded-2xl shadow-md p-6 bg-white dark:bg-black text-gray-900 dark:text-gray-100">

                <UserCard {...user} />

            </div>
                <div className="flex w-full border-l-6 border-[#F87171] bg-[#F87171] bg-opacity-[15%] px-7 py-8 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30 md:p-9">
                    <div className="mr-5 flex h-9 w-full max-w-[36px] items-center justify-center rounded-lg bg-[#F87171]">
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                        d="M6.4917 7.65579L11.106 12.2645C11.2545 12.4128 11.4715 12.5 11.6738 12.5C11.8762 12.5 12.0931 12.4128 12.2416 12.2645C12.5621 11.9445 12.5623 11.4317 12.2423 11.1114C12.2422 11.1113 12.2422 11.1113 12.2422 11.1113C12.242 11.1111 12.2418 11.1109 12.2416 11.1107L7.64539 6.50351L12.2589 1.91221L12.2595 1.91158C12.5802 1.59132 12.5802 1.07805 12.2595 0.757793C11.9393 0.437994 11.4268 0.437869 11.1064 0.757418C11.1063 0.757543 11.1062 0.757668 11.106 0.757793L6.49234 5.34931L1.89459 0.740581L1.89396 0.739942C1.57364 0.420019 1.0608 0.420019 0.740487 0.739944C0.42005 1.05999 0.419837 1.57279 0.73985 1.89309L6.4917 7.65579ZM6.4917 7.65579L1.89459 12.2639L1.89395 12.2645C1.74546 12.4128 1.52854 12.5 1.32616 12.5C1.12377 12.5 0.906853 12.4128 0.758361 12.2645L1.1117 11.9108L0.758358 12.2645C0.437984 11.9445 0.437708 11.4319 0.757539 11.1116C0.757812 11.1113 0.758086 11.111 0.75836 11.1107L5.33864 6.50287L0.740487 1.89373L6.4917 7.65579Z"
                        fill="#ffffff"
                        stroke="#ffffff"
                        ></path>
                    </svg>
                    </div>
                    <div className="w-full">
                    <h5 className="mb-3 font-semibold text-[#B45454]">
                        No se pueden gestionar las matrículas del estudiante
                    </h5>
                    <ul>
                        <li className="leading-relaxed text-[#CD5D5D]">
                        Como el estado del estudiante es actualmente inactivo, no se pueden gestionar sus matrículas.
                        Active al usuario antes de realizar cualquier operación.
                        </li>
                    </ul>
                    </div>
                </div>
            </div>

            {/* 🟢 DERECHA: REGISTRATIONS */}
            <div className="w-full lg:w-1/2 space-y-4">

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Matrículas del estudiante
                </h3>

                {registrationList?.length ? (
                registrationList
                    .filter(r => r.student_id === user.profile?.id || r.student_id === user.id)
                    .map((reg) => {
                        const careerInstance = careers?.find((c) => c.id === reg.career_id);
                        return (
                            <RegistrationCard
                                key={reg.id}
                                registration={reg}
                                career={careerInstance}
                            />
                        );
                    })
                ) : (
                <div className="text-sm text-gray-500">
                    No hay matrículas registradas
                </div>
                )}

            </div>

            </div>
        </div>
        );
    }
    return (
    <div className="w-full max-w-6xl mx-auto p-6">
        
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
        Gestionar matrícula
        </h2>

        <div className="flex flex-col lg:flex-row gap-6">

        {/* 🔵 IZQUIERDA: FORM */}
        <div className="w-full lg:w-1/2">

            <div className="rounded-2xl shadow-md p-6 bg-white dark:bg-black text-gray-900 dark:text-gray-100">

            <UserCard {...user} />

            <div className="flex flex-col gap-5 mt-6">

                <DropdownForm
                title="Carrera"
                options={careers ?? []}
                value={selectedCareer}
                onChange={setSelectedCareer}
                labelKey="name"
                valueKey="id"
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

            {!selectedRegistration ? (
                <button
                className="mt-6 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
                onClick={generateRegistration}
                >
                Crear matrícula
                </button>
            ) : (
                <div className="mt-6 p-4 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700">

                <h3 className="text-lg font-semibold mb-4">
                    Editar matrícula
                </h3>

                <DropdownForm
                    title="Carrera"
                    options={careers ?? []}
                    value={newCareer}
                    onChange={setNewCareer}
                    labelKey="name"
                    valueKey="id"
                />

                <DropdownForm
                    title="Estado"
                    options={[
                    { label: "Activo", value: "ACTIVE" },
                    { label: "Inactivo", value: "INACTIVE" },
                    { label: "Retirado", value: "RETIRED" },
                    { label: "Egresado", value: "GRADUATED" },
                    ]}
                    value={newAcademicStatus}
                    onChange={setNewAcademicStatus}
                    labelKey="label"
                    valueKey="value"
                />

                <button
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
                    onClick={editRegistration}
                >
                    Editar matrícula
                </button>

                </div>
            )}

            </div>
        </div>

        {/* 🟢 DERECHA: REGISTRATIONS */}
        <div className="w-full lg:w-1/2 space-y-4">

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Matrículas del estudiante
            </h3>

            {registrationList?.length ? (
            registrationList
                .filter(r => r.student_id === user.profile?.id || r.student_id === user.id)
                .map((reg) => {

                const careerInstance = careers?.find((c) => c.id === reg.career_id);

                return(
                <RegistrationCard
                    key={reg.id}
                    registration={reg}
                    career={careerInstance}
                />)
                })
            ) : (
            <div className="text-sm text-gray-500">
                No hay matrículas registradas
            </div>
            )}

        </div>

        </div>
    </div>
    );
};
export default ConfigurateUserRegistration;