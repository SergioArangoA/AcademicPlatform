import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userPService } from "../../services/userPService";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import UserFormValidator from "../../components/UserForm";
import DropdownForm from "../../components/DropdownForm";
import { UserResponse } from "../../models/Users/UserResponse";
import { Semester } from "../../models/Semesters/Semester";
import { semesterService } from "../../services/semesterService";
import { Career } from "../../models/Careers/Career";
import { careerService } from "../../services/careerService";



const ConfigurateUserRegistration = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserResponse | null>(null);
    const [careers, setCareers] = useState<Career[] | null>(null);
    const [semesters, setSemesters] = useState<Semester[] | null>(null);
    const [selectedCareer, setSelectedCareer] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedAcademicStatus, setSelectedAcademicStatus] = useState("");

    useEffect(() => {
        fetchData();
        //if (!user || !user.is_active) navigate(-1);
    }, []);

    const fetchData = async () => {
        const userData = await userPService.getUserById(id);
        const careersData = await careerService.getCareers();
        const semestersData = await semesterService.getSemesters();
        setUser(userData);
        setCareers(careersData);
        setSemesters(semestersData);
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

    return(
        <div className="w-full max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-md">

        <h2 className="text-xl font-semibold mb-6">
            Gestionar matrícula
        </h2>

        <div className="flex flex-col gap-5">

            <DropdownForm
            title="Carrera"
            options={careers}
            value={selectedCareer}
            onChange={setSelectedCareer}
            labelKey="name"
            valueKey="code"
            />

            <DropdownForm
            title="Semestre"
            options={semesters}
            value={selectedSemester}
            onChange={setSelectedSemester}
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
            value={selectedAcademicStatus}
            onChange={setSelectedAcademicStatus}
            labelKey="label"
            valueKey="value"
            />

        </div>

        <button
            className="
            mt-6
            w-full
            bg-blue-600
            text-white
            py-2
            rounded-xl
            hover:bg-blue-700
            transition
            "
            onClick={() => {
            console.log({ selectedCareer, selectedSemester,selectedAcademicStatus});
            }}
        >
            Guardar
        </button>

        </div>
        
    );
};
export default ConfigurateUserRegistration;