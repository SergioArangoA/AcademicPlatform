/**
 * Listado de calificaciones del estudiante (CU relacionado con notas).
 *
 * Por qué se cambió la forma de enlazar asignatura/grupo/evaluación:
 * - En el API actual la rúbrica NO trae subject_id (solo title, description, flags).
 * - La asignatura y el grupo viven en Evaluación: subject_id + group_id + rubric_id.
 * - Antes se leía rubric.subject_id y se buscaba evaluación “por asignatura”, lo cual
 *   fallaba con el modelo nuevo y podía mostrar datos incorrectos.
 * - Ahora: grade.rubric_id → evaluación que usa esa rúbrica → subject_id y group_id.
 *
 * El filtro final sigue mostrando solo notas de evaluaciones de grupos ACTIVE del alumno.
 */
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

    const normalizeDetails = (details: any): GradeDetail[] => {
        if (!details) return [];
        if (Array.isArray(details)) return details;
        return [details];
    };

    const calculateGradeValue = (
        details: GradeDetail[],
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
        const storageProvider = new LocalStorageProvider();
        const userInStorage = storageProvider.getParsedItem("user") as { id?: string } | null;
        const id = userInStorage?.id;
        if (!id) return;

        const users = await userPService.getUsers();
        const user = users.find((u) => u.profile?.id === id || u.id === id);
        const profileId = user?.profile?.id ?? id;
        const enrollments = await enrollmentService.getStudentEnrollments(profileId);
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
        const scaleMap = new Map<string, Scale>(
            scales.map((scale) => [String(scale.id), scale])
        );
        const criterionMap = new Map<string, Criterion>(
            criteria.map((criterion) => [String(criterion.id), criterion])
        );

        const rows: GradeRow[] = grades
            .filter((grade) => isGradeSent(grade.status))
            .map((grade) => {
            // Cadena correcta según backend: nota → rúbrica → evaluación → asignatura/grupo.
            const rubric = rubricMap.get(String(grade.rubric_id));
            const evaluation = evaluations.find(
                (ev) =>
                    ev.rubric_id &&
                    String(ev.rubric_id) === String(grade.rubric_id)
            );
            const subject = evaluation?.subject_id
                ? subjectMap.get(String(evaluation.subject_id))?.name || "-"
                : "-";
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

        // Solo notas de evaluaciones en grupos donde el estudiante está ACTIVE.
        const activeGroupIds = new Set(
            enrollments
                .filter(en => en.status === "ACTIVE")
                .map(en => en.group_id)
        );

        // 2. evaluaciones del usuario
        const userEvaluationIds = new Set(
            evaluations
                .filter(ev => activeGroupIds.has(ev.group_id))
                .map(ev => ev.id)
        );

        // 3. filtrar grades
        const filteredRows = rows.filter(row =>
            userEvaluationIds.has(
                evaluations.find(ev => ev.name === row.evaluationName)?.id ?? ""
            )
        );

        setData(filteredRows);
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
