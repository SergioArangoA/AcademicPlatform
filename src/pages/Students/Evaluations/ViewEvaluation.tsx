import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Evaluation } from "../../../models/Evaluation";
import { Subject } from "../../../models/Subject";
import { User } from "../../../models/User";
import { Group } from "../../../models/Group";
import { Rubric } from "../../../models/Rubric";
import GenericTable from "../../../components/GenericTable";
import EvaluationCard from "../../../components/evaluations/EvaluationCard";
import { evaluationService } from "../../../services/evaluationService";
import { subjectService } from "../../../services/subjectService";
import { groupService } from "../../../services/groupService";
import { userService  } from "../../../services/userService";
import { rubricService } from "../../../services/rubricService";
import CardTwo from "../../../components/CardTwo";

const EvaluationDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [evaluation, setEvaluation] = useState<Evaluation>();
    const [subject, setSubject] = useState<Subject>();
    const [group, setGroup] = useState<Group>();
    const [teacher, setTeacher] = useState<User>();
    const [rubric, setRubric] = useState<Rubric | null>(null);

    // 🔹 Llamar `fetchData` cuando el componente se monta
    useEffect(() => {
        fetchData();
    }, []);

    // 🔹 Obtiene los datos necesarios
    const fetchData = async () => {
        const evaluationData = await evaluationService.getEvaluationById(id);
        const subjectData = await subjectService.getSubjectById(evaluationData?.subject_id);
        const groupData = await groupService.getGroupById(evaluationData?.group_id);
        const teacherData = await userService.getUserById(groupData?.teacher_id);
        const rubricData = await rubricService.getRubricById(evaluationData?.evaluation_id);

        setEvaluation(evaluationData);
        setSubject(subjectData);
        setGroup(groupData);
        setTeacher(teacherData);
        setRubric(rubricData);
    };

    /*const handleAction = (action: string, item: Evaluation) => {
        if (action === "view") {
            console.log("View evaluation:", item);
            navigate(`/Students/evaluation/${item.evaluation_id}`);
        }
    };*/

    return (
        <div className="p-6 space-y-6">

        {/* Botón volver */}
        <div>
            <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md border border-stroke bg-white shadow-sm hover:bg-gray-100 dark:bg-boxdark dark:border-strokedark"
            >
            Volver
            </button>
        </div>

        {/* 🔲 Contenido principal */}
        <div className="grid grid-cols-12 gap-6">

            {/* 🔹 Columna izquierda (contenido principal) */}
            <div className="col-span-9 space-y-6">

            {/* 📌 Tarjeta evaluación */}
            <EvaluationCard
                evaluation={mockEvaluation}
                subject={mockSubject}
                group={mockGroup}
                user={mockTeacher}
            />

            {/* 📊 Tabla */}
            {/*<GenericTable
                data={data}
                columns={columns}
            />*/}

            </div>

            {/* 🔹 Columna derecha (cards adicionales) */}
            <div className="col-span-3 space-y-6">

            <CardTwo />
            <CardTwo />
            <CardTwo />

            </div>

        </div>
        </div>
    );
};
const mockEvaluations: Evaluation[] = [
    {
        subject_id: 1,
        group_id: 101,
        name: "Parcial 1",
        description: "Primer examen del semestre",
        weight: 30,
    },
    {
        subject_id: 1,
        group_id: 101,
        name: "Proyecto Final",
        description: "Entrega completa del sistema",
        weight: 50,
    },
];
export default EvaluationDetails;

const mockEvaluation: Evaluation = {
  evaluation_id: 1,
  subject_id: 1,
  group_id: 101,
  name: "Parcial 1",
  description: "Examen escrito",
  weight: 30,
};

const mockSubject: Subject = {
  id: 1,
  name: "Matemáticas Discretas",
};

const mockGroup: Group = {
  id: 101,
  name: "Grupo 101",
  teacher_id: 10,
};

const mockTeacher: User = {
  id: 10,
  name: "Juan Pérez",
};

const mockRubric = {
  id: 1,
  name: "Rúbrica Parcial 1",
};