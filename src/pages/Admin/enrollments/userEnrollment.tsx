import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userPService } from "../../../services/userPService";
import Swal from "sweetalert2";
import Breadcrumb from "../../../components/Breadcrumb";
import GenericTable from "../../../components/GenericTable";
import UserCard from "../../../components/users/UserInformationCard";
import RegistrationCard from "../../../components/registrations/RegistrationCard";
import { UserResponse } from "../../../models/Users/UserResponse";
import { Semester } from "../../../models/Semesters/Semester";
import { semesterService } from "../../../services/semesterService";
import { Career } from "../../../models/Careers/Career";
import { careerService } from "../../../services/careerService";
import { transformUsersForList } from "../../../utils/userTransformers";
import { UserForList } from "../../../models/Users/UserForList";
import { Registration } from "../../../models/Registration";
import { registrationService } from "../../../services/registrationService";
import { Group } from "../../../models/Groups/Group";
import { groupService } from "../../../services/groupService";
import { Subject } from "../../../models/Subjects/Subject";
import { subjectService } from "../../../services/subjectService";
import { userService } from "../../../services/userService";
import { GroupForList } from "../../../models/Groups/GroupForList";
import { StudyPlan } from "../../../models/StudyPlan/StudyPlan";
import { studyplanService } from "../../../services/studyplanService";


const ManageUserEnrollments = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserForList | null>(null);
    const [careers, setCareers] = useState<Career[] | null>(null);
    const [semester, setSemester] = useState<Semester | null>(null);
    const [registrationList, setRegistrations] = useState<Registration[] | null>(null);
    const [groups, setGroups] = useState<GroupForList[] | null>(null);
    const [subjects, setSubjects] = useState<Subject[] | null>(null);
    const [selectedGroups, setSelectedGroups] = useState<GroupForList[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const careersData = await careerService.getCareers();
        const semestersData = await semesterService.getSemesters();
        const currentSemester = semestersData.find((sem)=>sem.is_active);
        const usersData = await userService.getUsers();
        const teachers = usersData.filter((us)=>us.role === "TEACHER");
        const rawUser: UserResponse | null = await userPService.getUserById(id);
        if (!rawUser) return;
        const users = [rawUser];
        const formattedUser: UserForList[] = transformUsersForList(users);
        const registrationData = await registrationService.getRegistrations();
        const activeRegistrations = registrationData.filter((reg) => reg.student_id === formattedUser[0].profile?.id && reg.academic_status === "ACTIVE");
        const groupsData = await groupService.getGroupsWithMeta();
        const activeGroups = groupsData.filter((gr) => gr.semester_id === currentSemester?.id);
        const subjectsData = await subjectService.getSubjects();
        const studyPlans = await studyplanService.getStudyPlan();

        // Build a map of subject_id -> study plan for efficient lookup
        const subjectToStudyPlan = new Map<string, any>();
        for (const sp of studyPlans) {
            try {
                const spSubjects = await studyplanService.getSubjectsByStudyPlan(sp.id);
                spSubjects.forEach(subject => {
                    if (!subjectToStudyPlan.has(String(subject.id))) {
                        subjectToStudyPlan.set(String(subject.id), sp);
                    }
                });
            } catch (err) {
                console.error(`Error loading subjects for study plan ${sp.id}:`, err);
            }
        }

        const formattedGroups: GroupForList[] = activeGroups.map((gr) => {
            const teacher = teachers.find((tea) => tea.profile.id === gr.teacher_id);
            const subject = subjectsData.find((sub) => String(sub.id) === String(gr.subject_id));
            
            // Find study plan that contains this subject
            const studyPlan = subjectToStudyPlan.get(String(gr.subject_id));
            const careerId = studyPlan?.career_id ?? "";
            console.log(careerId);
            console.log(careersData);
            const career = careersData.find((car) => car.id === careerId);
            console.log(career);
            console.log(career?.name);

            return {
                id: gr.id,
                name: gr.name,
                teacher: teacher ? `${teacher.profile.first_name} ${teacher.profile.last_name}` : "Sin asignar",
                subject: subject?.name ?? "Sin asignar",
                group_code: gr.group_code ?? "",
                career: career?.name,
                career_id: careerId ?? "",
                capacity: `${gr.capacity}(${gr.available_capacity})`,
                enrolled_count: gr.enrolled_count ?? 0,
                credits: subject?.credits,
            };
        });

        const filteredGroups = formattedGroups.filter(
            (group) =>
                !selectedGroups.some(
                    (selected) => selected.id === group.id
                )
        );

        setGroups(filteredGroups);

        setUser(formattedUser[0]);
        setCareers(careersData);
        setSemester(currentSemester ?? null);
        setRegistrations(activeRegistrations);
        setGroups(filteredGroups);
        setSubjects(subjectsData);
    };
    const columns = [
        { key: "career", label: "Carrera" },
        { key: "teacher", label: "Docente" },
        { key: "subject", label: "Asignatura" },
        { key: "capacity", label: "Capacidad(disponibles)"},
        { key: "credits", label: "Créditos"},
    ];

    const actionsGeneral = [
        { name: "select", label: "Seleccionar" },
    ];
    const actionsSelected = [
        {name: "deselect", label: "Deseleccionar"}
    ];

    const handleAction = (name: string, item: GroupForList) => {
        switch (name) {
            case "select":
                setSelectedGroups(prev => [...prev, item]);

                setGroups(prev =>
                    prev.filter(g => g.id !== item.id)
                );
                break;

            case "deselect":
                setGroups(prev => [...prev, item]);

                setSelectedGroups(prev =>
                    prev.filter(g => g.id !== item.id)
                );
                break;

            default:
                console.log(`Acción desconocida: ${name}`);
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
    if (!user.is_active || registrationList?.length == 0 || !registrationList){
        return (
        <div className="w-full max-w-6xl mx-auto p-6">
            
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Gestionar inscripciones
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
                        No se pueden realizar inscripciones
                    </h5>
                    <ul>
                        <li className="leading-relaxed text-[#CD5D5D]">
                            El estado actual del estudiante es inactivo, o no cuenta con matrículas activas, por lo tanto no se pueden inscribir materias.
                        </li>
                    </ul>
                    </div>
                </div>
            </div>

            {/* 🟢 DERECHA: REGISTRATIONS */}
            <div className="w-full lg:w-1/2 space-y-4">

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Matrículas activas del estudiante
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
                    No hay matrículas activas registradas
                </div>
                )}

            </div>

            </div>
        </div>
        );
    }
    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 mt-2 rounded-md border border-stroke bg-white shadow-sm hover:bg-gray-100 dark:bg-boxdark dark:border-strokedark"
            >
                Volver
            </button>

            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Gestionar Inscripciones
            </h2>

            {/* 🔹 PANEL SUPERIOR */}
            <div className="flex flex-col lg:flex-row gap-6">

            {/* 🔵 IZQUIERDA */}
            <div className="w-full lg:w-1/2">
                <div className="rounded-2xl shadow-md p-6 bg-white dark:bg-black text-gray-900 dark:text-gray-100">
                <UserCard {...user} />
                </div>
            </div>

            {/* 🟢 DERECHA */}
            <div className="w-full lg:w-1/2 space-y-4">

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Matrículas activas del estudiante
                </h3>

                {registrationList?.length ? (
                registrationList
                    .filter(
                    r =>
                        r.student_id === user.profile?.id ||
                        r.student_id === user.id
                    )
                    .map((reg) => {

                    const careerInstance = careers?.find(
                        (c) => c.id === reg.career_id
                    );

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

            {/* 🔻 TABLAS ABAJO */}
            <div className="mt-8 space-y-6">

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Grupos del semestre
            </h3>

            <GenericTable
                data={groups}
                columns={columns}
                actions={actionsGeneral}
                onAction={handleAction}
            />

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Grupos seleccionados
            </h3>

            <GenericTable
                data={selectedGroups}
                columns={columns}
                actions={actionsSelected}
                onAction={handleAction}
            />

            </div>

            <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 mt-2 rounded-md border border-stroke bg-white shadow-sm hover:bg-gray-100 dark:bg-boxdark dark:border-strokedark"
            >
                Inscribir
            </button>

        </div>
    );
};
export default ManageUserEnrollments;