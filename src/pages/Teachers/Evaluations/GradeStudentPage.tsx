/**
 * Calificar un estudiante con rúbrica (CU-11).
 * Ruta: /evaluaciones/:evaluacionId/calificar/:inscripcionId — marco nivel por criterio y guardo nota.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Loader2,
    Save,
} from 'lucide-react';
import EvaluationFlowLayout from '../../../components/evaluations/flow/EvaluationFlowLayout';
import PageSkeleton from '../../../components/evaluations/flow/PageSkeleton';
import RubricPreviewModal from '../../../components/evaluations/flow/RubricPreviewModal';
import { ErrorBanner, SideCard } from '../../../components/evaluations/flow/SideCard';
import { Evaluation } from '../../../models/Evaluation/Evaluation';
import { Criterion } from '../../../models/Evaluation/Criterion';
import { Scale } from '../../../models/Evaluation/Scale';
import { Rubric } from '../../../models/Evaluation/Rubric';
import { evaluationService } from '../../../services/evaluationService';
import { subjectService } from '../../../services/subjectService';
import { groupService } from '../../../services/groupService';
import { rubricService } from '../../../services/rubricService';
import { criterionService } from '../../../services/criterionService';
import { scaleService } from '../../../services/scaleService';
import { enrollmentService } from '../../../services/enrollmentService';
import { gradeService, getGradeErrorMessage } from '../../../services/gradeService';
import { userPService } from '../../../services/userPService';
import { buildStudentLookupMap, resolveStudentFromEnrollment, transformUsersForList } from '../../../utils/userTransformers';
import {
    calculateFinalScoreFromSelections,
    scalesByCriterion,
    weightedScore,
} from '../../../utils/rubricScoring';
import { avatarColorFromName, formatDateTime, studentInitials } from '../../../utils/evaluationFormat';

type ScaleSelection = { scaleId: string; scaleValue: number; comment: string };

interface EnrollmentStudent {
    enrollmentId: string;
    studentId: string;
    name: string;
    code: string;
    email: string;
    career: string;
    semester: string;
    status: string;
}

const GradeStudentPage = () => {
    const { evaluacionId, inscripcionId } = useParams<{
        evaluacionId: string;
        inscripcionId: string;
    }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [subjectLabel, setSubjectLabel] = useState('—');
    const [groupLabel, setGroupLabel] = useState('—');
    const [rubric, setRubric] = useState<Rubric | null>(null);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [scales, setScales] = useState<Scale[]>([]);
    const [enrollments, setEnrollments] = useState<EnrollmentStudent[]>([]);
    const [currentEnrollment, setCurrentEnrollment] = useState<EnrollmentStudent | null>(null);
    const [selections, setSelections] = useState<Record<string, ScaleSelection>>({});
    const [existingGradeId, setExistingGradeId] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const loadGradeForEnrollment = useCallback(
        async (enrollmentId: string, rubricId: string) => {
            const existing = await gradeService.findGradeForEnrollment(enrollmentId, rubricId);
            if (!existing) {
                setSelections({});
                setExistingGradeId(null);
                return;
            }
            setExistingGradeId(existing.id ? String(existing.id) : null);
            const next: Record<string, ScaleSelection> = {};
            for (const detail of existing.details ?? []) {
                const scale = scales.find((s) => String(s.id) === String(detail.scale_id));
                if (!scale) continue;
                next[String(scale.criterion_id)] = {
                    scaleId: String(detail.scale_id),
                    scaleValue: scale.value,
                    comment: detail.comment ?? '',
                };
            }
            setSelections(next);
        },
        [scales]
    );

    const loadPage = useCallback(async () => {
        if (!evaluacionId || !inscripcionId) return;
        setLoading(true);
        try {
            const evalData = await evaluationService.getEvaluationById(evaluacionId);
            if (!evalData?.rubric_id) {
                setEvaluation(evalData);
                setLoading(false);
                return;
            }

            const [subjectData, groupData, rubricData, criteriaData, scalesData, enrollmentsRaw, usersRaw] =
                await Promise.all([
                    subjectService.getSubjectById(evalData.subject_id),
                    groupService.getGroupById(String(evalData.group_id)),
                    rubricService.getRubricById(String(evalData.rubric_id)),
                    criterionService.getCriteriaByRubricId(String(evalData.rubric_id)),
                    scaleService.getScales(),
                    enrollmentService.getEnrollments(String(evalData.group_id)),
                    userPService.getUsers(),
                ]);

            const criterionIds = criteriaData.map((c) => String(c.id));
            const rubricScales = scalesData.filter((s) =>
                criterionIds.includes(String(s.criterion_id))
            );
            const students = transformUsersForList(Array.isArray(usersRaw) ? usersRaw : []).filter(
                (u) => u.role === 'STUDENT'
            );
            const studentMap = buildStudentLookupMap(students);

            const enrollmentRows: EnrollmentStudent[] = enrollmentsRaw.map((e) => {
                const st = resolveStudentFromEnrollment(studentMap, String(e.student_id));
                return {
                    enrollmentId: String(e.id),
                    studentId: String(e.student_id),
                    name: st?.name ?? `Estudiante ${String(e.student_id).slice(0, 8)}`,
                    code: st?.code ?? '—',
                    email: st?.email ?? '—',
                    career: (st?.profile as { career?: string })?.career ?? '—',
                    semester: (st?.profile as { semester?: string })?.semester ?? '—',
                    status: e.status === 'ACTIVE' ? 'Activa' : e.status,
                };
            });

            setEvaluation(evalData);
            setSubjectLabel(
                subjectData ? `${subjectData.code} — ${subjectData.name}` : '—'
            );
            setGroupLabel(groupData?.name ?? groupData?.group_code ?? String(evalData.group_id));
            setRubric(rubricData);
            setCriteria(criteriaData);
            setScales(rubricScales);
            setEnrollments(enrollmentRows);
            const current =
                enrollmentRows.find((e) => e.enrollmentId === inscripcionId) ?? enrollmentRows[0];
            setCurrentEnrollment(current ?? null);
        } catch {
            toast.error('Error al cargar datos de calificación.');
        } finally {
            setLoading(false);
        }
    }, [evaluacionId, inscripcionId]);

    useEffect(() => {
        void loadPage();
    }, [loadPage]);

    useEffect(() => {
        if (!currentEnrollment || !evaluation?.rubric_id || scales.length === 0) return;
        void loadGradeForEnrollment(currentEnrollment.enrollmentId, String(evaluation.rubric_id));
    }, [currentEnrollment, evaluation?.rubric_id, scales, loadGradeForEnrollment]);

    const finalScore = useMemo(() => {
        const map: Record<string, { scaleId: string; scaleValue: number }> = {};
        Object.entries(selections).forEach(([cid, s]) => {
            map[cid] = { scaleId: s.scaleId, scaleValue: s.scaleValue };
        });
        return calculateFinalScoreFromSelections(criteria, map);
    }, [selections, criteria]);

    const completedCount = criteria.filter((c) => selections[String(c.id)]?.scaleId).length;
    const allComplete = criteria.length > 0 && completedCount === criteria.length;

    const currentIndex = enrollments.findIndex(
        (e) => e.enrollmentId === (currentEnrollment?.enrollmentId ?? inscripcionId)
    );

    const goToEnrollment = (enrollmentId: string) => {
        navigate(`/evaluaciones/${evaluacionId}/calificar/${enrollmentId}`);
    };

    const handleScaleChange = (criterionId: string, scale: Scale) => {
        setSelections((prev) => ({
            ...prev,
            [criterionId]: {
                scaleId: String(scale.id),
                scaleValue: scale.value,
                comment: prev[criterionId]?.comment ?? '',
            },
        }));
    };

    const handleComment = (criterionId: string, comment: string) => {
        setSelections((prev) => ({
            ...prev,
            [criterionId]: {
                ...prev[criterionId],
                comment,
                scaleId: prev[criterionId]?.scaleId ?? '',
                scaleValue: prev[criterionId]?.scaleValue ?? 0,
            },
        }));
    };

    const save = async () => {
        if (!currentEnrollment || !evaluation?.rubric_id || !evaluacionId) return;
        if (!allComplete) {
            toast.error('Selecciona un nivel de desempeño para todos los criterios antes de guardar.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                enrollment_id: currentEnrollment.enrollmentId,
                evaluation_id: evaluacionId,
                status: 'DRAFT' as const,
                details: Object.values(selections)
                    .filter((s) => s.scaleId)
                    .map((s) => ({
                        scale_id: s.scaleId,
                        comment: s.comment?.trim() || undefined,
                    })),
            };
            await gradeService.saveGrade(payload);
            toast.success(
                'Calificación guardada en borrador. Publícala con «Publicar notas» en Mis evaluaciones.'
            );
            navigate('/evaluaciones');
        } catch (err) {
            toast.error(getGradeErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <PageSkeleton />;

    if (!evaluation?.rubric_id) {
        return (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
                Esta evaluación no tiene rúbrica asociada.{' '}
                <Link
                    to={`/evaluaciones/${evaluacionId}/asociar-rubrica`}
                    className="font-medium text-[#6366f1] underline"
                >
                    Asociar rúbrica (CU-10)
                </Link>
            </p>
        );
    }

    const evalCode = evaluation.code ?? `EVAL-${String(evaluation.id).slice(0, 6)}`;

    return (
        <>
            <EvaluationFlowLayout
                pageTitle="Calificar estudiante"
                steps={[
                    { label: 'Estudiante', done: true },
                    { label: 'Calificar criterios', active: true },
                ]}
                main={
                    <div className="space-y-5">
                        <div className="rounded-lg border border-stroke bg-white p-4 text-sm dark:border-strokedark dark:bg-boxdark">
                            <div className="flex flex-wrap gap-4 divide-x divide-stroke dark:divide-strokedark">
                                <div className="pr-4">
                                    <span className="text-gray-500">Evaluación</span>
                                    <p className="font-semibold">
                                        {evaluation.name} ({evalCode})
                                    </p>
                                </div>
                                <div className="px-4">
                                    <span className="text-gray-500">Asignatura</span>
                                    <p className="font-medium">{subjectLabel}</p>
                                </div>
                                <div className="px-4">
                                    <span className="text-gray-500">Grupo</span>
                                    <p className="font-medium">{groupLabel}</p>
                                </div>
                                <div className="pl-4">
                                    <span className="text-gray-500">Fecha límite</span>
                                    <p className="font-medium">
                                        {formatDateTime(
                                            evaluation.deadline ?? evaluation.due_date
                                        )}{' '}
                                        · Ponderación {evaluation.weight}%
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-[#dcfce7] px-3 py-2">
                                <Check className="h-4 w-4 text-[#16a34a]" />
                                <span className="text-sm font-medium text-[#166534]">
                                    Rúbrica asociada: {rubric?.title}
                                </span>
                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                                    Publicada
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPreviewOpen(true)}
                                    className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-[#6366f1] hover:underline"
                                >
                                    Ver rúbrica <ExternalLink className="h-3 w-3" />
                                </button>
                            </div>
                        </div>

                        {currentEnrollment && (
                            <div className="rounded-lg border border-stroke bg-white p-5 dark:border-strokedark dark:bg-boxdark">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColorFromName(currentEnrollment.name)}`}
                                        >
                                            {studentInitials(currentEnrollment.name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-black dark:text-white">
                                                {currentEnrollment.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Cédula: {currentEnrollment.code} · Inscripción:{' '}
                                                {currentEnrollment.enrollmentId.slice(0, 8)}…
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 text-sm">
                                        <div>
                                            <span className="text-gray-500">Programa</span>
                                            <p>{currentEnrollment.career}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Semestre</span>
                                            <p>{currentEnrollment.semester}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Inscripción</span>
                                            <p>
                                                <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-xs text-[#16a34a]">
                                                    {currentEnrollment.status}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={currentIndex <= 0}
                                            onClick={() =>
                                                goToEnrollment(
                                                    enrollments[currentIndex - 1].enrollmentId
                                                )
                                            }
                                            className="inline-flex items-center gap-1 rounded border border-stroke px-3 py-1.5 text-xs disabled:opacity-40"
                                        >
                                            <ChevronLeft className="h-4 w-4" /> Anterior
                                        </button>
                                        <button
                                            type="button"
                                            disabled={currentIndex >= enrollments.length - 1}
                                            onClick={() =>
                                                goToEnrollment(
                                                    enrollments[currentIndex + 1].enrollmentId
                                                )
                                            }
                                            className="inline-flex items-center gap-1 rounded border border-stroke px-3 py-1.5 text-xs disabled:opacity-40"
                                        >
                                            Siguiente <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <section className="rounded-lg border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
                            <div className="border-b border-stroke px-5 py-4 dark:border-strokedark">
                                <h3 className="font-semibold text-black dark:text-white">
                                    Criterios de la rúbrica
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Selecciona el nivel de desempeño (escala) para cada criterio.
                                </p>
                                <p className="mt-2 text-xs text-gray-500">
                                    <span className="text-[#16a34a]">● Completo</span>{' '}
                                    <span className="ml-3 text-[#d97706]">
                                        ● Pendiente: {criteria.length - completedCount} de{' '}
                                        {criteria.length}
                                    </span>
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto text-sm">
                                    <thead>
                                        <tr className="bg-gray-2 text-left text-xs dark:bg-meta-4">
                                            <th className="w-8 py-3 px-3">#</th>
                                            <th className="min-w-[180px] py-3 px-3">
                                                Criterio (Peso)
                                            </th>
                                            <th className="min-w-[200px] py-3 px-3">
                                                Seleccione el nivel de desempeño
                                            </th>
                                            <th className="py-3 px-3">Puntaje</th>
                                            <th className="min-w-[160px] py-3 px-3">
                                                Comentario (opcional)
                                            </th>
                                            <th className="w-10 py-3 px-2" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {criteria.map((c, idx) => {
                                            const cid = String(c.id);
                                            const sel = selections[cid];
                                            const criterionScales = scalesByCriterion(
                                                scales,
                                                cid
                                            );
                                            const rowScore = sel
                                                ? weightedScore(sel.scaleValue, c.weight)
                                                : 0;
                                            const selectedScale = criterionScales.find(
                                                (s) => String(s.id) === sel?.scaleId
                                            );
                                            return (
                                                <tr
                                                    key={cid}
                                                    className={`border-b border-stroke dark:border-strokedark ${
                                                        sel?.scaleId ? 'bg-[#fffbeb]' : ''
                                                    }`}
                                                >
                                                    <td className="py-4 px-3">{idx + 1}</td>
                                                    <td className="py-4 px-3">
                                                        <p className="font-medium">{c.name}</p>
                                                        <p className="text-xs text-[#6366f1]">
                                                            Peso {c.weight}%
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {c.description}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <select
                                                            value={sel?.scaleId ?? ''}
                                                            onChange={(e) => {
                                                                const scale = criterionScales.find(
                                                                    (s) =>
                                                                        String(s.id) ===
                                                                        e.target.value
                                                                );
                                                                if (scale)
                                                                    handleScaleChange(cid, scale);
                                                            }}
                                                            className={`w-full rounded-lg border px-2 py-2 text-sm ${
                                                                sel?.scaleId
                                                                    ? 'border-amber-300 bg-[#fffbeb]'
                                                                    : 'border-stroke dark:border-strokedark dark:bg-form-input'
                                                            }`}
                                                        >
                                                            <option value="">
                                                                Seleccionar nivel...
                                                            </option>
                                                            {criterionScales.map((s) => (
                                                                <option
                                                                    key={s.id}
                                                                    value={String(s.id)}
                                                                >
                                                                    {s.name} ({s.value})
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {selectedScale?.description && (
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {selectedScale.description}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <p className="font-bold text-black dark:text-white">
                                                            {rowScore.toFixed(2)}
                                                        </p>
                                                        {sel && (
                                                            <p className="text-[10px] text-gray-500">
                                                                {c.weight}% × {sel.scaleValue}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <textarea
                                                            rows={2}
                                                            value={sel?.comment ?? ''}
                                                            onChange={(e) =>
                                                                handleComment(cid, e.target.value)
                                                            }
                                                            className="w-full rounded border border-stroke px-2 py-1 text-xs dark:border-strokedark dark:bg-form-input"
                                                            placeholder="Comentario..."
                                                        />
                                                    </td>
                                                    <td className="py-4 px-2 text-center">
                                                        {sel?.scaleId && (
                                                            <Check className="mx-auto h-5 w-5 text-[#16a34a]" />
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-stroke px-5 py-4 dark:border-strokedark">
                                <p className="rounded-lg bg-[#eff6ff] px-3 py-2 text-sm text-[#1d4ed8]">
                                    ℹ El puntaje de cada criterio se calcula como: valor de escala
                                    × peso del criterio.
                                </p>
                                <div className="mt-3 flex justify-end items-baseline gap-2">
                                    <span className="text-sm text-gray-600">
                                        Total (suma ponderada)
                                    </span>
                                    <span className="text-2xl font-bold text-[#16a34a]">
                                        {finalScore.toFixed(2)} / 100
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>
                }
                sidebar={
                    <>
                        <SideCard title="Resumen de la calificación">
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-gray-500">Rúbrica</dt>
                                    <dd>{rubric?.title}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Evaluación</dt>
                                    <dd>
                                        {evaluation.name} ({evalCode})
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Estudiante</dt>
                                    <dd>{currentEnrollment?.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Inscripción</dt>
                                    <dd className="font-mono text-xs">
                                        {currentEnrollment?.enrollmentId}
                                    </dd>
                                </div>
                            </dl>
                        </SideCard>

                        <SideCard title="Nota final calculada">
                            <p className="text-3xl font-bold text-[#6366f1]">
                                {finalScore.toFixed(2)} / 100
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Ponderación evaluación: {evaluation.weight}%
                            </p>
                        </SideCard>

                        <SideCard title="Detalle del cálculo">
                            <ul className="space-y-1 text-xs">
                                {criteria.map((c) => {
                                    const sel = selections[String(c.id)];
                                    const sc = sel
                                        ? weightedScore(sel.scaleValue, c.weight)
                                        : 0;
                                    return (
                                        <li key={c.id} className="flex justify-between gap-2">
                                            <span>
                                                {c.name} ({c.weight}%)
                                            </span>
                                            <span className="font-medium">{sc.toFixed(2)}</span>
                                        </li>
                                    );
                                })}
                                <li className="flex justify-between border-t border-stroke pt-2 font-semibold dark:border-strokedark">
                                    <span>Total</span>
                                    <span>
                                        {finalScore.toFixed(2)} / 100
                                    </span>
                                </li>
                            </ul>
                        </SideCard>

                    </>
                }
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => navigate(`/evaluaciones/${evaluacionId}/estudiantes`)}
                            className="text-sm text-gray-600"
                        >
                            Volver a estudiantes
                        </button>
                        <button
                            type="button"
                            disabled={saving || !allComplete}
                            onClick={() => void save()}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#6366f1] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Guardar
                        </button>
                    </>
                }
                bottomBanners={
                    !allComplete ? (
                        <ErrorBanner
                            title="Completa la calificación"
                            message="Selecciona un nivel de desempeño para cada criterio antes de guardar."
                        />
                    ) : undefined
                }
            />

            <RubricPreviewModal
                rubric={rubric}
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
            />
        </>
    );
};

export default GradeStudentPage;
