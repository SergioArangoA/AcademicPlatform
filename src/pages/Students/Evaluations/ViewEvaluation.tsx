import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Evaluation } from "../../../models/Evaluation";
import { Subject } from "../../../models/Subject";
import { User } from "../../../models/User";
import { Group } from "../../../models/Group";
import { Rubric } from "../../../models/Rubric";
import { Criterion } from "../../../models/Criterion";
import { Scale } from "../../../models/Scale";
import RubricInfoCard from "../../../components/evaluations/RubricCard";
import RubricEvaluationTable from "../../../components/evaluations/RubricTable";
import EvaluationCard from "../../../components/evaluations/EvaluationCard";
import { evaluationService } from "../../../services/evaluationService";
import { subjectService } from "../../../services/subjectService";
import { groupService } from "../../../services/groupService";
import { userService  } from "../../../services/userService";
import { rubricService } from "../../../services/rubricService";
import { criteriaService } from "../../../services/criterionService";
import { scaleService } from "../../../services/scaleService";

const EvaluationDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [evaluation, setEvaluation] = useState<Evaluation>();
    const [subject, setSubject] = useState<Subject>();
    const [group, setGroup] = useState<Group>();
    const [teacher, setTeacher] = useState<User>();
    const [rubric, setRubric] = useState<Rubric | null>(null);
    const [criteria, setCriteria] = useState<Criterion[] | null>(null);
    const [scales, setScales] = useState<Scale[] | null>(null);

    // 🔹 Llamar `fetchData` cuando el componente se monta
    useEffect(() => {
        fetchData();
    }, []);

    // 🔹 Obtiene los datos necesarios
    const fetchData = async () => {
        const evaluationData = await evaluationService.getEvaluationById(id);
        const subjectData = await subjectService.getSubjectById(evaluationData?.subject_id);
        const groupData = await groupService.getGroupById(evaluationData?.group_id);
        const teacherData = await userService.getTeacherById(groupData?.teacher_id);
        const rubricData = await rubricService.getRubricById("5d84071e-96cd-4ae8-8141-31a0511f6103");//(evaluationData?.rubric_id);
        const criteriaData = await criteriaService.getCriteria();
        const scalesData = await scaleService.getScales();

        setEvaluation(evaluationData);
        setSubject(subjectData);
        setGroup(groupData);
        setTeacher(teacherData);
        setRubric(rubricData);
        setCriteria(criteriaData);
        setScales(scalesData);
    };

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
                evaluation={evaluation}
                subject={subject}
                group={group}
                user={teacher}
            />

            <RubricEvaluationTable
            criteria={mockCriteria}
            scales={mockScales}
            />

            </div>

            {/* 🔹 Columna derecha (cards adicionales) */}
            <div className="col-span-3 space-y-6">

            <RubricInfoCard
              rubric = {rubric}
              criteria = {criteria}
              subject={subject}
              evaluation={evaluation}
            />

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
const mockCriteria: Criterion[] = [
  {
    id: "c1",
    name: "Knowledge",
    description: "Level of theoretical understanding",
    rubric_id: "r1",
    weight: 50
  },
  {
    id: "c2",
    name: "Application",
    description: "Practical application of concepts",
    rubric_id: "r1",
    weight: 30
  },
  {
    id: "c3",
    name: "Presentation",
    description: "Clarity and structure",
    rubric_id: "r1",
    weight: 20
  }
  
];
const mockScales: Scale[] = [
  // Knowledge (c1)
  {
    id: "s1",
    criterion_id: "c1",
    name: "Excellent",
    description: "Mastery of concepts",
    value: 5
  },
  {
    id: "s2",
    criterion_id: "c1",
    name: "Good",
    description: "Good understanding",
    value: 4
  },
  {
    id: "s3",
    criterion_id: "c1",
    name: "Basic",
    description: "Partial understanding",
    value: 3
  },

  // Application (c2)
  {
    id: "s4",
    criterion_id: "c2",
    name: "Excellent",
    description: "Perfect application",
    value: 5
  },
  {
    id: "s5",
    criterion_id: "c2",
    name: "Good",
    description: "Minor mistakes",
    value: 4
  },
  {
    id: "s6",
    criterion_id: "c2",
    name: "Basic",
    description: "Struggles applying concepts",
    value: 3
  },

  // Presentation (c3)
  {
    id: "s7",
    criterion_id: "c3",
    name: "Excellent",
    description: "Very clear and structured",
    value: 5
  },
  {
    id: "s8",
    criterion_id: "c3",
    name: "Good",
    description: "Generally clear",
    value: 4
  },
  {
    id: "s9",
    criterion_id: "c3",
    name: "Basic",
    description: "Hard to follow",
    value: 3
  }
];