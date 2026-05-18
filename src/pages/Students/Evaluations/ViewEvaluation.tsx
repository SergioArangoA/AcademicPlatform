import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Evaluation } from "../../../models/Evaluation/Evaluation";
import { Subject } from "../../../models/Subjects/Subject";
import { User } from "../../../models/User";
import { Group } from "../../../models/Groups/Group";
import { Rubric } from "../../../models/Evaluation/Rubric";
import { Criterion } from "../../../models/Evaluation/Criterion";
import { Scale } from "../../../models/Evaluation/Scale";
import RubricInfoCard from "../../../components/evaluations/RubricCard";
import RubricEvaluationTable from "../../../components/evaluations/RubricTable";
import EvaluationCard from "../../../components/evaluations/EvaluationCard";
import { evaluationService } from "../../../services/evaluationService";
import { subjectService } from "../../../services/subjectService";
import { userPService } from "../../../services/userPService";
import { groupService } from "../../../services/groupService";
import { userService } from "../../../services/userService";
import { rubricService } from "../../../services/rubricService";
import { criterionService } from "../../../services/criterionService";
import { scaleService } from "../../../services/scaleService";

/** CU-13 – Consultar rúbrica de evaluación (solo lectura) */
const ViewEvaluation: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [evaluation, setEvaluation] = useState<Evaluation | undefined>();
    const [subject, setSubject] = useState<Subject | undefined>();
    const [group, setGroup] = useState<Group | undefined>();
    const [teacher, setTeacher] = useState<User | undefined>();
    const [rubric, setRubric] = useState<Rubric | null>(null);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [scales, setScales] = useState<Scale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setLoading(true);
            const evaluationData = await evaluationService.getEvaluationById(id);
            if (!evaluationData) {
                setLoading(false);
                return;
            }

            setEvaluation(evaluationData);

            const [subjectData, groupData] = await Promise.all([
                subjectService.getSubjectById(evaluationData.subject_id),
                groupService.getGroupById(String(evaluationData.group_id)),
            ]);
            setSubject(subjectData ?? undefined);
            setGroup(groupData ?? undefined);

            if (groupData?.teacher_id) {

                // Obtener todos los usuarios
                const users = await userPService.getUsers();

                // Buscar el usuario cuyo profile.id sea igual al teacher_id
                const teacherData = users.find(
                    (user) =>
                        String(user.profile?.id) ===
                        String(groupData.teacher_id)
                );

                setTeacher(teacherData ?? undefined);
            }

            if (!evaluationData.rubric_id) {
                setRubric(null);
                setCriteria([]);
                setScales([]);
                setLoading(false);
                return;
            }

            const rubricId = String(evaluationData.rubric_id);
            const [rubricData, criteriaData, allScales] = await Promise.all([
                rubricService.getRubricById(rubricId),
                criterionService.getCriteriaByRubricId(rubricId),
                scaleService.getScales(),
            ]);

            const criterionIds = criteriaData.map((c) => String(c.id));
            setRubric(rubricData);
            setCriteria(criteriaData);
            setScales(allScales.filter((s) => criterionIds.includes(String(s.criterion_id))));
            setLoading(false);
        };
        void fetchData();
    }, [id]);

    if (loading) {
        return <p className="p-6 text-gray-500">Cargando evaluación...</p>;
    }

    if (!evaluation) {
        return <p className="p-6 text-red-500">Evaluación no encontrada.</p>;
    }

    return (
        <div className="p-6 space-y-6">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-md border border-stroke bg-white shadow-sm hover:bg-gray-100 dark:bg-boxdark dark:border-strokedark"
            >
                Volver
            </button>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 xl:col-span-9 space-y-6">
                    <EvaluationCard
                        evaluation={evaluation}
                        subject={subject}
                        group={group}
                        user={teacher}
                        rubric={rubric}
                    />

                    {!evaluation.rubric_id ? (
                        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100">
                            E1: Esta evaluación aún no tiene una rúbrica asociada. El docente debe
                            vincularla desde el módulo de evaluaciones (CU-10).
                        </div>
                    ) : !rubric?.is_public ? (
                        <div className="rounded-lg border border-stroke p-4 text-sm text-gray-600 dark:border-strokedark">
                            La rúbrica asociada aún no está publicada.
                        </div>
                    ) : (
                        <>
                            <RubricEvaluationTable criteria={criteria} scales={scales} />
                        </>
                    )}
                </div>

                <div className="col-span-12 xl:col-span-3">
                    {rubric && criteria.length > 0 && (
                        <RubricInfoCard
                            rubric={rubric}
                            criteria={criteria}
                            subject={subject}
                            evaluation={evaluation}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewEvaluation;
