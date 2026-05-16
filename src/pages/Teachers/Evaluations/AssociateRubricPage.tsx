/*
 * CU-10 — Asociar rúbrica a evaluación y asignatura
 * Ruta: /evaluaciones/:evaluacionId/asociar-rubrica
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, Eye, Loader2, Search } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import EvaluationFlowLayout from '../../../components/evaluations/flow/EvaluationFlowLayout';
import PageSkeleton from '../../../components/evaluations/flow/PageSkeleton';
import RubricPreviewModal from '../../../components/evaluations/flow/RubricPreviewModal';
import { ErrorBanner, SideCard } from '../../../components/evaluations/flow/SideCard';
import { Evaluation } from '../../../models/Evaluation/Evaluation';
import { Rubric } from '../../../models/Evaluation/Rubric';
import { Criterion } from '../../../models/Evaluation/Criterion';
import {
    evaluationService,
    getEvaluationErrorMessage,
} from '../../../services/evaluationService';
import { rubricService } from '../../../services/rubricService';
import { gradeService } from '../../../services/gradeService';
import { criterionService } from '../../../services/criterionService';
import {
    loadTeacherSubjects,
    resolveTeacherIdForApi,
    getSubjectByIdSafe,
    TeacherSubjectOption,
} from '../../../utils/teacherEvaluationHelpers';
import { formatDateTime } from '../../../utils/evaluationFormat';

type RubricRow = Rubric & {
    criteriaCount: number;
    subjectLabel: string;
};

const AssociateRubricPage = () => {
    const { evaluacionId } = useParams<{ evaluacionId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [subjects, setSubjects] = useState<TeacherSubjectOption[]>([]);
    const [rubrics, setRubrics] = useState<RubricRow[]>([]);
    const [currentRubricTitle, setCurrentRubricTitle] = useState<string | null>(null);
    const [currentSubjectLabel, setCurrentSubjectLabel] = useState<string | null>(null);
    const [hasGrades, setHasGrades] = useState(false);

    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [rubricScope, setRubricScope] = useState<'mine' | 'all'>('mine');
    const [selectedRubricId, setSelectedRubricId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [previewRubric, setPreviewRubric] = useState<Rubric | null>(null);
    const [teacherId, setTeacherId] = useState<string | null>(null);

    const loadPage = useCallback(async () => {
        if (!evaluacionId) return;
        setLoading(true);
        try {
            const [evalData, publicRubrics, criteria, teacherSubjects, docenteId] =
                await Promise.all([
                    evaluationService.getEvaluationById(evaluacionId),
                    rubricService.getPublicRubrics(),
                    criterionService.getCriteria(),
                    loadTeacherSubjects(user),
                    resolveTeacherIdForApi(user),
                ]);

            setTeacherId(docenteId);
            setEvaluation(evalData);
            setSubjects(teacherSubjects);

            if (evalData?.rubric_id) {
                const r = publicRubrics.find((x) => String(x.id) === String(evalData.rubric_id));
                setCurrentRubricTitle(r?.title ?? String(evalData.rubric_id));
            } else {
                setCurrentRubricTitle(null);
            }

            if (evalData?.subject_id) {
                const sub = teacherSubjects.find(
                    (s) => String(s.id) === String(evalData.subject_id)
                );
                setCurrentSubjectLabel(
                    sub?.label ??
                        (await getSubjectByIdSafe(evalData.subject_id))?.name ??
                        String(evalData.subject_id)
                );
                setSelectedSubjectId(String(evalData.subject_id));
            }

            const countByRubric = new Map<string, number>();
            criteria.forEach((c: Criterion) => {
                const k = String(c.rubric_id);
                countByRubric.set(k, (countByRubric.get(k) ?? 0) + 1);
            });

            const subjectMap = new Map(teacherSubjects.map((s) => [s.id, s]));
            const rows: RubricRow[] = publicRubrics.map((r) => ({
                ...r,
                criteriaCount: countByRubric.get(String(r.id)) ?? 0,
                subjectLabel: r.subject_id
                    ? subjectMap.get(String(r.subject_id))?.label ?? '—'
                    : '—',
            }));
            setRubrics(rows);

            const grades = await gradeService.getGradesByEvaluation(evaluacionId);
            const blocked =
                !!evalData?.rubric_id &&
                grades.some((g) => String(g.rubric_id) === String(evalData.rubric_id));
            setHasGrades(blocked);
        } catch {
            toast.error('No se pudo cargar la evaluación.');
        } finally {
            setLoading(false);
        }
    }, [evaluacionId, user]);

    useEffect(() => {
        void loadPage();
    }, [loadPage]);

    const filteredRubrics = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rubrics.filter((r) => {
            if (rubricScope === 'mine' && teacherId && r.teacher_id) {
                if (String(r.teacher_id) !== teacherId) return false;
            }
            if (subjectFilter !== 'all' && String(r.subject_id) !== subjectFilter) return false;
            if (q) {
                const hay = `${r.title} ${r.description} ${r.subjectLabel}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [rubrics, search, subjectFilter, rubricScope, teacherId]);

    const selectedRubric = rubrics.find((r) => String(r.id) === selectedRubricId);
    const selectedSubject = subjects.find((s) => String(s.id) === selectedSubjectId);
    const canConfirm = !!selectedRubricId && !!selectedSubjectId && !hasGrades;

    const handleConfirm = async () => {
        if (!evaluacionId || !canConfirm) return;
        setSubmitting(true);
        try {
            await evaluationService.updateEvaluationAssociation(evaluacionId, {
                rubric_id: selectedRubricId,
                subject_id: selectedSubjectId,
            });
            toast.success('Asociación confirmada correctamente.');
            navigate('/evaluaciones');
        } catch (err) {
            toast.error(getEvaluationErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <PageSkeleton />
            </>
        );
    }

    if (!evaluation) {
        return (
            <p className="text-red-600">Evaluación no encontrada.</p>
        );
    }

    const evalCode = evaluation.code ?? `EVAL-${String(evaluation.id).slice(0, 6)}`;
    const evalDeadline = evaluation.deadline ?? evaluation.due_date;

    return (
        <>
            <EvaluationFlowLayout
                pageTitle="Asociar rúbrica a evaluación"
                steps={[
                    { label: 'Seleccionar evaluación', done: true },
                    { label: 'Seleccionar rúbrica y asignatura', active: true },
                    { label: 'Confirmar asociación' },
                ]}
                main={
                    <div className="space-y-6">
                        <div className="rounded-lg border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                Evaluación seleccionada
                            </h3>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-lg font-bold text-black dark:text-white">
                                        {evaluation.name}{' '}
                                        <span className="text-sm font-normal text-gray-500">
                                            ({evalCode})
                                        </span>
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        {evaluation.description || 'Sin descripción'}
                                    </p>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Fecha límite: {formatDateTime(evalDeadline)} · Ponderación:{' '}
                                        {evaluation.weight}%
                                    </p>
                                </div>
                                <span className="inline-flex rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#16a34a]">
                                    Activa
                                </span>
                            </div>
                        </div>

                        <section className="rounded-lg border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
                            <h3 className="text-base font-semibold text-black dark:text-white">
                                Seleccionar rúbrica publicada
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Solo se muestran rúbricas con estado publicado (es_publica = true).
                            </p>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <div className="relative min-w-[200px] flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar rúbrica..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full rounded-lg border border-stroke py-2 pl-9 pr-3 text-sm dark:border-strokedark dark:bg-form-input"
                                    />
                                </div>
                                <select
                                    value={subjectFilter}
                                    onChange={(e) => setSubjectFilter(e.target.value)}
                                    className="rounded-lg border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input"
                                >
                                    <option value="all">Todas las asignaturas</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={rubricScope}
                                    onChange={(e) =>
                                        setRubricScope(e.target.value as 'mine' | 'all')
                                    }
                                    className="rounded-lg border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input"
                                >
                                    <option value="mine">Mis rúbricas</option>
                                    <option value="all">Todas las rúbricas</option>
                                </select>
                            </div>

                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full table-auto text-sm">
                                    <thead>
                                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                            <th className="w-10 py-3 px-2" />
                                            <th className="py-3 px-3">Rúbrica</th>
                                            <th className="py-3 px-3">Asignatura</th>
                                            <th className="py-3 px-3 text-center">Criterios</th>
                                            <th className="py-3 px-3">Fecha publicación</th>
                                            <th className="py-3 px-3 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRubrics.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-8 text-center text-gray-500"
                                                >
                                                    No hay rúbricas publicadas que coincidan.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRubrics.map((r) => (
                                                <tr
                                                    key={r.id}
                                                    className={`border-b border-stroke dark:border-strokedark ${
                                                        selectedRubricId === String(r.id)
                                                            ? 'bg-[#ede9fe]/40'
                                                            : ''
                                                    }`}
                                                >
                                                    <td className="py-3 px-2 text-center">
                                                        <input
                                                            type="radio"
                                                            name="rubric"
                                                            checked={
                                                                selectedRubricId === String(r.id)
                                                            }
                                                            onChange={() =>
                                                                setSelectedRubricId(String(r.id))
                                                            }
                                                            disabled={hasGrades}
                                                        />
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <p className="font-semibold text-black dark:text-white">
                                                            {r.title}
                                                            <span className="ml-2 inline-flex rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-medium text-[#16a34a]">
                                                                Publicada
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-gray-500 line-clamp-2">
                                                            {r.description}
                                                        </p>
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-600">
                                                        {r.subjectLabel}
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        {r.criteriaCount}
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-600">
                                                        {formatDateTime(
                                                            r.updated_at ?? r.created_at
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewRubric(r)}
                                                            className="inline-flex items-center gap-1 rounded-md border border-stroke px-2 py-1 text-xs hover:bg-gray-50 dark:border-strokedark"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            Vista previa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="rounded-lg border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
                            <h3 className="text-base font-semibold text-black dark:text-white">
                                Asignatura asociada
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Selecciona la asignatura a la que se asociará la rúbrica con esta
                                evaluación.
                            </p>
                            <div className="relative mt-4 max-w-md">
                                <select
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                    className="w-full rounded-lg border border-stroke py-2.5 px-3 pr-8 text-sm dark:border-strokedark dark:bg-form-input"
                                >
                                    <option value="">Seleccionar asignatura...</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                                {selectedSubjectId && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSubjectId('')}
                                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                                        aria-label="Limpiar"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <p className="mt-3 rounded-lg bg-[#eff6ff] px-4 py-2 text-sm text-[#1d4ed8]">
                                ℹ Solo puedes asociar la evaluación a asignaturas que impartes.
                            </p>
                        </section>
                    </div>
                }
                sidebar={
                    <>
                        <SideCard title="Resumen de la asociación">
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-gray-500">Evaluación</dt>
                                    <dd className="font-medium">
                                        {evaluation.name} ({evalCode})
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Rúbrica actual</dt>
                                    <dd>
                                        {currentRubricTitle ?? '— (Sin rúbrica asociada)'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Asignatura actual</dt>
                                    <dd>
                                        {currentSubjectLabel ?? '— (Sin asignatura asociada)'}
                                    </dd>
                                </div>
                            </dl>
                        </SideCard>

                        {(selectedRubric || selectedSubject) && (
                            <SideCard title="Nueva asociación">
                                <dl className="space-y-2 text-sm">
                                    <div>
                                        <dt className="text-gray-500">Rúbrica seleccionada</dt>
                                        <dd className="font-medium text-[#6366f1]">
                                            {selectedRubric?.title ?? '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Asignatura seleccionada</dt>
                                        <dd className="font-medium text-[#6366f1]">
                                            {selectedSubject?.label ?? '—'}
                                        </dd>
                                    </div>
                                </dl>
                                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                                    <p className="font-semibold">⚠ Importante</p>
                                    <p className="mt-1">
                                        Al confirmar, se actualizarán: Evaluacion.rubrica_id,
                                        Evaluacion.asignatura_id y Evaluacion.updated_at.
                                    </p>
                                </div>
                            </SideCard>
                        )}

                        <SideCard title="Reglas">
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex gap-2">
                                    <Check className="h-4 w-4 shrink-0 text-[#16a34a]" />
                                    Solo se permiten rúbricas publicadas.
                                </li>
                                <li className="flex gap-2">
                                    <Check className="h-4 w-4 shrink-0 text-[#16a34a]" />
                                    La evaluación debe pertenecer a una asignatura que impartes.
                                </li>
                            </ul>
                        </SideCard>
                    </>
                }
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => navigate('/evaluaciones')}
                            className="text-sm text-gray-600 hover:text-black"
                        >
                            Cancelar
                        </button>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="rounded-lg border border-stroke px-4 py-2 text-sm dark:border-strokedark"
                            >
                                Atrás
                            </button>
                            <button
                                type="button"
                                disabled={!canConfirm || submitting}
                                onClick={() => void handleConfirm()}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#6366f1] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                Confirmar asociación
                            </button>
                        </div>
                    </>
                }
                bottomBanners={
                    <>
                        {rubrics.length === 0 && (
                            <ErrorBanner
                                title="No hay rúbricas publicadas"
                                message="No existen rúbricas publicadas disponibles. Crea y publica una rúbrica desde Mis rúbricas (CU-07)."
                                actionLabel="Ir a Mis rúbricas"
                                onAction={() => navigate('/teachers/rubrics/list')}
                            />
                        )}
                        {hasGrades && (
                            <ErrorBanner
                                title="No se puede cambiar la rúbrica"
                                message="Ya existen notas registradas para esta evaluación con la rúbrica actual. No es posible cambiar la rúbrica asociada."
                                actionLabel="Ver calificaciones"
                                onAction={() => navigate('/teachers/grades')}
                            />
                        )}
                    </>
                }
            />

            <RubricPreviewModal
                rubric={previewRubric}
                open={!!previewRubric}
                onClose={() => setPreviewRubric(null)}
            />
        </>
    );
};

export default AssociateRubricPage;
