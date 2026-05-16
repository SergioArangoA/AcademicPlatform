import React, { useEffect, useState } from "react";
import { Grade } from "../../../models/Evaluation/Grade";
import { GradeDetails } from "../../../models/Evaluation/GradeDetails";
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

    const normalizeDetails = (details: any): GradeDetails[] => {
        if (!details) return [];
        if (Array.isArray(details)) return details;
        return [details];
    };

    const calculateGradeValue = (
        details: GradeDetails[],
        scaleMap: Map<string, Scale>,
        criterionMap: Map<string, Criterion>
    ) => {
        return details.reduce((sum, detail) => {
            const scaleId = detail.scale_id?.toString() || "";
            const scale = scaleMap.get(scaleId);
            if (!scale) return sum;
            const criterion = criterionMap.get(scale.criterion_id?.toString() || "");
            if (!criterion) return sum;
            return sum + scale.value * (criterion.weight / 100);
        }, 0);
    };

    const fetchData = async () => {
        const [grades, rubrics, subjects, groups, evaluations, scales, criteria] =
            await Promise.all([
                gradeService.getGrades(),
                rubricService.getRubrics(),
                subjectService.getSubjects(),
                groupService.getGroups(),
                evaluationService.getEvaluations(),
                scaleService.getScales(),
                criteriaService.getCriteria(),
            ]);

        const rubricMap = new Map<string, Rubric>(
            rubrics.map((rubric) => [String((rubric as any).id || rubric.title || ""), rubric])
        );
        const subjectMap = new Map<string, Subject>(
            subjects.map((subject) => [String((subject as any).id || (subject as any).code || ""), subject])
        );
        const groupMap = new Map<string, Group>(
            groups.map((group) => [String((group as any).id || group.group_code || ""), group])
        );
        const evaluationMap = new Map<string, Evaluation>(
            evaluations.map((evaluation) => [String(evaluation.id || evaluation.name), evaluation])
        );
        const scaleMap = new Map<string, Scale>(
            scales.map((scale) => [String(scale.id), scale])
        );
        const criterionMap = new Map<string, Criterion>(
            criteria.map((criterion) => [String(criterion.id), criterion])
        );

        const rows: GradeRow[] = grades.map((grade) => {
            const rubric = rubricMap.get(String(grade.rubric_id));
            const subject = rubric
                ? subjectMap.get(String(rubric.subject_id))?.name || "-"
                : "-";

            const evaluationFromGrade = grade.hasOwnProperty("evaluation_id")
                ? evaluationMap.get(String((grade as any).evaluation_id))
                : undefined;

            const evaluationFromSubject = !evaluationFromGrade && rubric?.subject_id
                ? evaluations.find((evaluation) => evaluation.subject_id === String(rubric.subject_id))
                : undefined;

            const evaluation = evaluationFromGrade || evaluationFromSubject;
            const group = evaluation
                ? groupMap.get(String(evaluation.group_id))?.name || String(evaluation.group_id)
                : "-";

            const details = normalizeDetails((grade as any).details);
            const rawValue = calculateGradeValue(details, scaleMap, criterionMap);
            const gradeValue = rawValue.toFixed(2);

            return {
                id: grade.id,
                gradeValue,
                subject,
                group,
                evaluationName: evaluation?.name || "-",
                rubricTitle: rubric?.title || String(grade.rubric_id),
            };
        });

        setData(rows);
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
