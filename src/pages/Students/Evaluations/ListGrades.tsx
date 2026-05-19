import React, { useEffect, useState } from "react";
import { Grade } from "../../../models/Evaluation/Grade";
import { GradeDetail } from "../../../models/Evaluation/GradeDetails";
import { isGradeSent } from "../../../services/gradeService";
import { Rubric } from "../../../models/Evaluation/Rubric";
import { Subject } from "../../../models/Subjects/Subject";
import { Group } from "../../../models/Groups/Group";
import { Evaluation } from "../../../models/Evaluation/Evaluation";
import { Scale } from "../../../models/Evaluation/Scale";
import { Criterion } from "../../../models/Evaluation/Criterion";
import GenericTable from "../../../components/GenericTable";
import { gradeService } from "../../../services/gradeService";
import { rubricService } from "../../../services/rubricService";
import { subjectService } from "../../../services/subjectService";
import { groupService } from "../../../services/groupService";
import { evaluationService } from "../../../services/evaluationService";
import { scaleService } from "../../../services/scaleService";
import { criteriaService } from "../../../services/criterionService";
import { userPService } from "../../../services/userPService";
import { LocalStorageProvider } from "../../../storage/LocalStorageProvider";
import { enrollmentService } from "../../../services/enrollmentService";
import { useNavigate } from "react-router-dom";

interface GradeRow {
    id?: string;
    gradeValue: string;
    subject: string;
    group: string;
    evaluationName: string;
    rubricTitle: string;
}

const Grades: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<GradeRow[]>([]);

    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        try {
            const storageProvider = new LocalStorageProvider();

            // Usuario guardado en localStorage
            const userInStorage = storageProvider.getParsedItem("user") as {
                id?: string;
            } | null;

            const id = userInStorage?.id;

            if (!id) return;

            // Usuario completo
            const user = await userPService.getUserById(id);

            // ID real del estudiante
            const profileId = user?.profile?.id;

            if (!profileId) return;

            // Traer datos
            const [
                grades,
                evaluations,
                rubrics,
                subjects,
                groups,
            ] = await Promise.all([
                gradeService.getGrades(),
                evaluationService.getEvaluations(),
                rubricService.getRubrics(),
                subjectService.getSubjects(),
                groupService.getGroups(),
            ]);

            // Filtrar grades del estudiante
            const studentGrades = grades.filter((grade: Grade) => {
                // Solo grades públicas
                if (!isGradeSent(grade.status)) return false;

                const details = Array.isArray((grade as any).details)
                    ? (grade as any).details
                    : [(grade as any).details];

                return details.some(
                    (detail: any) =>
                        String(detail.student_id) === String(profileId)
                );
            });

            // Construir filas
            const rows: GradeRow[] = studentGrades.map((grade: Grade) => {

                // Buscar evaluación relacionada
                const evaluation = evaluations.find(
                    (ev: Evaluation) =>
                        String(ev.rubric_id) === String(grade.rubric_id)
                );

                // Buscar rúbrica
                const rubric = rubrics.find(
                    (r: Rubric) =>
                        String(r.id) === String(grade.rubric_id)
                );

                // Buscar asignatura
                const subject = subjects.find(
                    (s: Subject) =>
                        String(s.id) ===
                        String(evaluation?.subject_id)
                );

                // Buscar grupo
                const group = groups.find(
                    (g: Group) =>
                        String(g.id) ===
                        String(evaluation?.group_id)
                );

                return {
                    id: grade.id,

                    gradeValue: Number(
                        grade.final_score || 0
                    ).toFixed(2),

                    subject: subject?.name || "-",

                    group:
                        (group as any)?.name ||
                        (group as any)?.group_code ||
                        "-",

                    evaluationName:
                        evaluation?.name || "-",

                    rubricTitle:
                        rubric?.title || "-",
                };
            });

            setData(rows);

        } catch (error) {
            console.error(error);
        }
    };

    const handleAction = (action: string, item: GradeRow) => {
        if (action === "view") {
            navigate(`/students/evaluations/grades/${item.id}`);
        }
    };

    return (
        <div>
            <h2>Lista de notas</h2>

            <GenericTable
                data={data}
                columns={[
                    { key: "evaluationName", label: "Evaluación" },
                    { key: "subject", label: "Asignatura" },
                    { key: "group", label: "Grupo" },
                    { key: "rubricTitle", label: "Rúbrica" },
                    { key: "gradeValue", label: "Nota real" },
                ]}
                actions={[{ name: "view", label: "Detalles" }]}
                onAction={handleAction}
            />
        </div>
    );
};

export default Grades;
