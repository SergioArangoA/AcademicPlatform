import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Evaluation } from "../../../models/Evaluation/Evaluation";
import { Subject } from "../../../models/Subjects/Subject";
import { User } from "../../../models/User";
import { Group } from "../../../models/Groups/Group";
import { Rubric } from "../../../models/Evaluation/Rubric";
import { Criterion } from "../../../models/Evaluation/Criterion";
import { Scale } from "../../../models/Evaluation/Scale";
import { Grade } from "../../../models/Evaluation/Grade";
import RubricInfoCard from "../../../components/evaluations/RubricCard";
import GenericTable from "../../../components/GenericTable";
import EvaluationCard from "../../../components/evaluations/EvaluationCard";
import { evaluationService } from "../../../services/evaluationService";
import { subjectService } from "../../../services/subjectService";
import { groupService } from "../../../services/groupService";
import { userPService } from "../../../services/userPService";
import { rubricService } from "../../../services/rubricService";
import { criteriaService } from "../../../services/criterionService";
import { scaleService } from "../../../services/scaleService";
import { gradeService } from "../../../services/gradeService";
import { Navigate } from "react-router-dom";
import { LocalStorageProvider } from "../../../storage/LocalStorageProvider";
import { GradeRow } from "../../../models/Evaluation/GradeRow";
import { generateGradeReport } from "../../../utils/jsPDF";

const GradeDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [evaluation, setEvaluation] = useState<Evaluation>();
    const [subject, setSubject] = useState<Subject>();
    const [group, setGroup] = useState<Group>();
    const [teacher, setTeacher] = useState<User>();
    const [rubric, setRubric] = useState<Rubric | null>(null);
    const [criteria, setCriteria] = useState<Criterion[] | null>(null);
    const [grade, setGrade] = useState<Grade | null>(null);
    const [gradeRows, setGradeRows] = useState<GradeRow[]>([]);
    const [accessDenied, setAccessDenied] = useState(false);

    const normalizeDetails = (details: any) => {
        if (!details) return [];
        return Array.isArray(details) ? details : [details];
    };

    const buildGradeRows = (
        details: any,
        criteriaList: Criterion[],
        scaleList: Scale[]
    ): GradeRow[] => {
        const normalizedDetails = normalizeDetails(details);

        return criteriaList.map((criterion, index) => {
            const criterionScales = scaleList.filter(
                (scale) => scale.criterion_id === criterion.id
            );
            const selectedDetail = normalizedDetails.find((detail: any) => {
                const scale = scaleList.find(
                    (scale) => String(scale.id) === String(detail.scale_id)
                );
                return scale?.criterion_id === criterion.id;
            });
            const selectedScale = selectedDetail
                ? scaleList.find(
                      (scale) => String(scale.id) === String(selectedDetail.scale_id)
                  )
                : undefined;
            const maxScore = criterionScales.length
                ? Math.max(...criterionScales.map((scale) => scale.value))
                : 0;

            return {
                rowNumber: index + 1,
                criterionName: criterion.name,
                criterionDescription: criterion.description || "-",
                obtainedLevel: selectedScale?.name || "-",
                scaleDescription: selectedScale?.description || "-",
                scoreObtained: selectedScale?.value || 0,
                maxScore,
                comment: selectedDetail?.comment || "-",
            };
        });
    };

    // 🔹 Llamar `fetchData` cuando el componente se monta
    useEffect(() => {
        fetchData();
    }, []);
    // 🔹 Obtiene los datos necesarios
    const fetchData = async () => {
        try {
            if (!id) return;

            // 1. Obtener grade
            const gradeData = await gradeService.getGradeById(id);

            if (gradeData?.status === "DRAFT"){
                setAccessDenied(true);
                return;
            }

            if (!gradeData) return;

            // Obtener usuario del localStorage
            const storageProvider = new LocalStorageProvider();

            const userInStorage = storageProvider.getParsedItem("user") as {
                id?: string;
            } | null;

            const loggedUserId = userInStorage?.id;

            if (!loggedUserId) {
                setAccessDenied(true);
                return;
            }

            // Buscar usuario completo
            const usersData = await userPService.getUsers();

            const currentUser = usersData.find(
                (user: User) =>
                    String(user.id) === String(loggedUserId)
            );

            if (!currentUser?.profile?.id) {
                setAccessDenied(true);
                return;
            }

            // Validar ownership usando profile.id
            const details = normalizeDetails(gradeData.details);

            const gradeBelongsToUser = details.some(
                (detail: any) =>
                    String(detail.student_id) ===
                    String(currentUser.profile.id)
            );

            if (!gradeBelongsToUser) {
                setAccessDenied(true);
                return;
            }

            // 2. Buscar evaluación que use la misma rúbrica
            const evaluations = await evaluationService.getEvaluations();

            const evaluationData = evaluations.find(
                (ev: Evaluation) =>
                    String(ev.rubric_id) ===
                    String(gradeData.rubric_id)
            );

            if (!evaluationData) return;

            // 3. Obtener datos relacionados
            const [
                subjectData,
                groupData,
                rubricData,
                criteriaData,
                scalesData,
                users,
            ] = await Promise.all([
                subjectService.getSubjectById(
                    evaluationData.subject_id
                ),

                groupService.getGroupById(
                    evaluationData.group_id
                ),

                rubricService.getRubricById(
                    gradeData.rubric_id
                ),

                criteriaService.getCriteria(),

                scaleService.getScales(),

                userPService.getUsers(),
            ]);

            // 4. Buscar profesor:
            // group.teacher_id guarda profile.id
            const teacherData = users.find(
                (user: User) =>
                    String(user.profile?.id) ===
                    String(groupData?.teacher_id)
            );

            // 5. Filtrar criterios de la rúbrica
            const rubricCriteria = criteriaData.filter(
                (criterion: Criterion) =>
                    String(criterion.rubric_id) ===
                    String(rubricData?.id)
            );

            // 6. Guardar estados
            setGrade(gradeData);

            setEvaluation(evaluationData);

            setSubject(subjectData);

            setGroup(groupData);

            setTeacher(teacherData);

            setRubric(rubricData);

            setCriteria(rubricCriteria);

            // 7. Construir tabla
            setGradeRows(
                buildGradeRows(
                    gradeData.details,
                    rubricCriteria,
                    scalesData
                )
            );

        } catch (error) {
            console.error(error);
        }
    };
    
    if (accessDenied) {
        return <Navigate to="/Acces-denied" replace />;
    }

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
                rubric={rubric}
                user={teacher}
            />

            <div className="rounded-sm border border-stroke bg-white dark:bg-boxdark dark:border-strokedark shadow-default">
                <GenericTable
                    data={gradeRows}
                    columns={[
                        { key: "rowNumber", label: "#" },
                        { key: "criterionName", label: "Criterio" },
                        { key: "criterionDescription", label: "Descripción" },
                        { key: "obtainedLevel", label: "Nivel obtenido" },
                        { key: "scaleDescription", label: "Descripción escala" },
                        { key: "scoreObtained", label: "Puntaje obtenido" },
                        { key: "maxScore", label: "Puntaje máximo" },
                        { key: "comment", label: "Comentario" },
                    ]}
                    actions={[]}
                    onAction={() => {}}
                />
            </div>

            </div>

            {/* 🔹 Columna derecha (cards adicionales) */}
            <div className="col-span-3 space-y-6">

            <RubricInfoCard
              rubric = {rubric}
              criteria = {criteria}
              subject={subject}
              evaluation={evaluation}
            />
                <div className="w-full rounded-2xl bg-gray-900 text-white dark:bg-boxdark dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg p-5 flex flex-col items-center">

                    {/* Número grande */}
                    <span
                        className={`text-6xl font-extrabold leading-none
                        ${
                            (grade?.final_score ?? 0) >= 80
                                ? "text-success"
                                : (grade?.final_score ?? 0) >= 60
                                ? "text-warning"
                                : "text-danger"
                        }
                        `}
                    >
                        {grade?.final_score?.toFixed(1) || "0.0"}
                    </span>

                    {/* Etiqueta */}
                    <span className="text-sm text-gray-200 mt-2">
                        Nota final
                    </span>

                    {/* Comentarios */}
                    <div className="w-full mt-6">
                        <h4 className="font-semibold text-white mb-2">
                            Comentarios:
                        </h4>

                        <div className="rounded-lg bg-gray-800 p-3 text-sm text-gray-200 break-words">
                            {grade?.observations || "Sin comentarios"}
                        </div>
                    </div>

                    {/* Botón descargar */}
                    <button
                        onClick={() =>
                            generateGradeReport(
                                evaluation,
                                subject,
                                group,
                                teacher,
                                rubric,
                                grade,
                                gradeRows
                            )
                        }
                        className="mt-6 w-full px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90 transition"
                    >
                        Descargar reporte
                    </button>

                </div>
            </div>

        </div>
        </div>
    );
};
export default GradeDetails;