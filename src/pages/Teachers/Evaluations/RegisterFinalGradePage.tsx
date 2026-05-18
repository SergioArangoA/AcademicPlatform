/**
 * Registrar nota final de un grupo (CU-12). Ruta: /calificaciones/:grupoId/nota-final.
 * Consolido evaluaciones del grupo y registro la nota definitiva por estudiante.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, Loader2, Lock, Save, AlertTriangle } from 'lucide-react';
import EvaluationFlowLayout from '../../../components/evaluations/flow/EvaluationFlowLayout';
import PageSkeleton from '../../../components/evaluations/flow/PageSkeleton';
import { ErrorBanner, SideCard } from '../../../components/evaluations/flow/SideCard';
import { Evaluation } from '../../../models/Evaluation/Evaluation';
import { Grade } from '../../../models/Evaluation/Grade';
import { groupService } from '../../../services/groupService';
import { evaluationService } from '../../../services/evaluationService';
import { enrollmentService } from '../../../services/enrollmentService';
import { gradeService, getGradeErrorMessage } from '../../../services/gradeService';
import { semesterService } from '../../../services/semesterService';
import { subjectService } from '../../../services/subjectService';
import { userPService } from '../../../services/userPService';
import { transformUsersForList } from '../../../utils/userTransformers';
import { avatarColorFromName, studentInitials } from '../../../utils/evaluationFormat';

interface StudentRow {
    enrollmentId: string;
    studentId: string;
    name: string;
    code: string;
    evalScores: Record<string, { raw: number | null; weighted: number | null }>;
    finalScore: number;
    complete: boolean;
    observation: string;
}

const RegisterFinalGradePage = () => {
    const { grupoId } = useParams<{ grupoId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [groupLabel, setGroupLabel] = useState('—');
    const [subjectLabel, setSubjectLabel] = useState('—');
    const [semesterLabel, setSemesterLabel] = useState('—');
    const [semesterActive, setSemesterActive] = useState(true);
    const [teacherLabel, setTeacherLabel] = useState('—');
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [rows, setRows] = useState<StudentRow[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);

    const loadData = useCallback(async () => {
        if (!grupoId) return;
        setLoading(true);
        try {
            const [group, evalsAll, enrollments, gradesAll, semesters] = await Promise.all([
                groupService.getGroupById(grupoId),
                evaluationService.getEvaluations(grupoId),
                enrollmentService.getEnrollments(grupoId),
                gradeService.getGrades(),
                semesterService.getSemesters(),
            ]);

            const evals = evalsAll.filter((e) => e.rubric_id);
            setEvaluations(evals);

            const subject = group?.subject_id
                ? await subjectService.getSubjectById(group.subject_id)
                : null;
            const sem = semesters.find((s) => String(s.id) === String(group?.semester_id));

            setGroupLabel(group?.name ?? group?.group_code ?? grupoId);
            setSubjectLabel(subject ? `${subject.code} — ${subject.name}` : '—');
            setSemesterLabel(sem?.name ?? '—');
            setSemesterActive(sem?.is_active !== false);
            setTeacherLabel(group?.teacher_id ? `Docente #${group.teacher_id}` : '—');

            const users = transformUsersForList(await userPService.getUsers());
            const studentMap = new Map(users.filter((u) => u.role === 'STUDENT').map((s) => [s.id, s]));

            const studentRows: StudentRow[] = enrollments.map((enr) => {
                const st = studentMap.get(String(enr.student_id));
                const evalScores: Record<string, { raw: number | null; weighted: number | null }> =
                    {};
                let finalScore = 0;
                let graded = 0;

                for (const ev of evals) {
                    const grade = gradesAll.find(
                        (g: Grade) =>
                            String(g.enrollment_id) === String(enr.id) &&
                            ev.rubric_id &&
                            String(g.rubric_id) === String(ev.rubric_id) &&
                            g.status === 'SENT'
                    );
                    const raw =
                        grade?.final_score != null ? Number(grade.final_score) : null;
                    const weighted =
                        raw != null ? Number((raw * (Number(ev.weight) / 100)).toFixed(2)) : null;
                    evalScores[String(ev.id)] = { raw, weighted };
                    if (weighted != null) {
                        finalScore += weighted;
                        graded += 1;
                    }
                }

                const complete = graded === evals.length && evals.length > 0;
                return {
                    enrollmentId: String(enr.id),
                    studentId: String(enr.student_id),
                    name: st?.name ?? `Estudiante ${String(enr.student_id).slice(0, 8)}`,
                    code: st?.code ?? '—',
                    evalScores,
                    finalScore: Number(finalScore.toFixed(2)),
                    complete,
                    observation: complete ? '—' : 'Falta calificar evaluación ℹ',
                };
            });

            setRows(studentRows);
        } catch {
            toast.error('No se pudo cargar el consolidado.');
        } finally {
            setLoading(false);
        }
    }, [grupoId]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const totalWeight = evaluations.reduce((a, e) => a + Number(e.weight ?? 0), 0);
    const completeCount = rows.filter((r) => r.complete).length;
    const partialCount = rows.length - completeCount;
    const avgFinal =
        rows.length > 0
            ? Number((rows.reduce((a, r) => a + r.finalScore, 0) / rows.length).toFixed(2))
            : 0;
    const maxFinal = rows.length ? Math.max(...rows.map((r) => r.finalScore)) : 0;
    const minFinal = rows.length ? Math.min(...rows.map((r) => r.finalScore)) : 0;

    const weightFormula = evaluations
        .map((e) => `${e.code ?? e.name?.slice(0, 8)}×${e.weight}%`)
        .join(' + ');

    const handleConfirmOfficial = async () => {
        if (!grupoId) return;
        if (!semesterActive) {
            toast.error('El semestre está inactivo. Contacte al administrador.');
            return;
        }
        setSubmitting(true);
        try {
            await gradeService.confirmGroupOfficial({ group_id: grupoId });
            setRegistered(true);
            setShowConfirm(false);
            toast.success('Registro oficial confirmado. Notas bloqueadas y reporte generado.');
        } catch (err) {
            toast.error(getGradeErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const downloadPreview = () => {
        const header = ['Estudiante', 'Cédula', ...evaluations.map((e) => e.name), 'Nota final'];
        const lines = rows.map((r) =>
            [r.name, r.code, ...evaluations.map((e) => r.evalScores[String(e.id)]?.raw ?? ''), r.finalScore].join(',')
        );
        const csv = [header.join(','), ...lines].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consolidado-${grupoId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <PageSkeleton />;

    return (
        <>
            <EvaluationFlowLayout
                pageTitle="Registrar nota final"
                steps={[
                    { label: 'Revisar consolidado', active: true },
                    { label: 'Confirmar registro oficial' },
                    { label: 'Generar reporte' },
                ]}
                main={
                    <div className="space-y-5">
                        <div className="rounded-lg border border-stroke bg-white p-4 text-sm dark:border-strokedark dark:bg-boxdark">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <p>
                                        <span className="text-gray-500">Grupo:</span>{' '}
                                        <strong>{groupLabel}</strong>
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Asignatura:</span>{' '}
                                        {subjectLabel}
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Semestre:</span>{' '}
                                        {semesterLabel}{' '}
                                        <span
                                            className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                                                semesterActive
                                                    ? 'bg-[#dcfce7] text-[#16a34a]'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {semesterActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Docente:</span>{' '}
                                        {teacherLabel}
                                    </p>
                                </div>
                                <div className="space-y-2 md:text-right">
                                    <p>
                                        Total estudiantes: <strong>{rows.length}</strong>
                                    </p>
                                    <p>
                                        Inscripciones activas: <strong>{rows.length}</strong>
                                    </p>
                                    <p>
                                        Evaluaciones del grupo: <strong>{evaluations.length}</strong>
                                    </p>
                                    <p>
                                        Ponderación total:{' '}
                                        <strong
                                            className={
                                                totalWeight === 100
                                                    ? 'text-[#16a34a]'
                                                    : 'text-[#d97706]'
                                            }
                                        >
                                            {totalWeight}%
                                        </strong>
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <span>
                                    Revise el consolidado de notas finales. Antes de confirmar,
                                    puede corregir calificaciones desde evaluaciones.
                                </span>
                                <Link
                                    to="/evaluaciones"
                                    className="ml-auto whitespace-nowrap rounded border border-amber-300 bg-white px-3 py-1 text-xs font-medium hover:bg-amber-100"
                                >
                                    Ir a evaluaciones (CU-10) →
                                </Link>
                            </div>
                        </div>

                        <section className="rounded-lg border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
                            <div className="border-b border-stroke px-5 py-4 dark:border-strokedark">
                                <h3 className="font-semibold text-black dark:text-white">
                                    Consolidado de nota final por estudiante
                                </h3>
                                <p className="text-sm text-gray-500">
                                    La nota final es la suma ponderada de todas las evaluaciones
                                    del grupo.
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto text-xs">
                                    <thead>
                                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                            <th className="py-3 px-2">#</th>
                                            <th className="min-w-[160px] py-3 px-2">Estudiante</th>
                                            <th className="py-3 px-2">Inscripción</th>
                                            {evaluations.map((ev) => (
                                                <th
                                                    key={ev.id}
                                                    className="min-w-[90px] py-3 px-2 text-center"
                                                >
                                                    {ev.code ?? ev.name?.slice(0, 12)} (
                                                    {ev.weight}%)
                                                </th>
                                            ))}
                                            <th className="py-3 px-2 text-center">
                                                Nota final (100%)
                                            </th>
                                            <th className="py-3 px-2">Estado</th>
                                            <th className="py-3 px-2">Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, idx) => (
                                            <tr
                                                key={row.enrollmentId}
                                                className="border-b border-stroke dark:border-strokedark"
                                            >
                                                <td className="py-3 px-2">{idx + 1}</td>
                                                <td className="py-3 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarColorFromName(row.name)}`}
                                                        >
                                                            {studentInitials(row.name)}
                                                        </span>
                                                        <div>
                                                            <p className="font-medium">{row.name}</p>
                                                            <p className="text-gray-500">
                                                                {row.code}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 font-mono">
                                                    {row.enrollmentId.slice(0, 10)}…
                                                </td>
                                                {evaluations.map((ev) => {
                                                    const cell = row.evalScores[String(ev.id)];
                                                    return (
                                                        <td
                                                            key={ev.id}
                                                            className="py-3 px-2 text-center"
                                                        >
                                                            <div>
                                                                {cell?.raw != null
                                                                    ? cell.raw.toFixed(2)
                                                                    : '—'}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500">
                                                                {cell?.weighted != null
                                                                    ? cell.weighted.toFixed(2)
                                                                    : ''}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                                <td
                                                    className={`py-3 px-2 text-center text-base font-bold ${
                                                        row.finalScore >= 60
                                                            ? 'text-[#16a34a]'
                                                            : 'text-[#dc2626]'
                                                    }`}
                                                >
                                                    {row.finalScore.toFixed(2)}
                                                </td>
                                                <td className="py-3 px-2">
                                                    {row.complete ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[#16a34a]">
                                                            <Check className="h-3 w-3" /> Completa
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[#d97706]">
                                                            <AlertTriangle className="h-3 w-3" />{' '}
                                                            Parcial
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-2 text-gray-500">
                                                    {row.observation}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-50 font-semibold dark:bg-meta-4">
                                            <td colSpan={3} className="py-3 px-2">
                                                Promedio del grupo
                                            </td>
                                            {evaluations.map((ev) => {
                                                const vals = rows
                                                    .map((r) => r.evalScores[String(ev.id)]?.raw)
                                                    .filter((v): v is number => v != null);
                                                const avg =
                                                    vals.length > 0
                                                        ? vals.reduce((a, b) => a + b, 0) /
                                                          vals.length
                                                        : 0;
                                                return (
                                                    <td
                                                        key={ev.id}
                                                        className="py-3 px-2 text-center"
                                                    >
                                                        {avg.toFixed(2)}
                                                    </td>
                                                );
                                            })}
                                            <td className="py-3 px-2 text-center">
                                                {avgFinal.toFixed(2)}
                                            </td>
                                            <td colSpan={2} />
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="border-t border-stroke px-5 py-3 text-sm text-[#1d4ed8] dark:border-strokedark">
                                ℹ Nota final ={' '}
                                {weightFormula || 'Σ (nota evaluación × peso %)'}
                            </p>
                        </section>
                    </div>
                }
                sidebar={
                    <>
                        <SideCard title="Resumen del consolidado">
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>Nota completa</span>
                                    <span className="font-semibold text-[#16a34a]">
                                        {completeCount}
                                    </span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Nota parcial</span>
                                    <span className="font-semibold text-[#d97706]">
                                        {partialCount}
                                    </span>
                                </li>
                                <li className="flex justify-between border-t border-stroke pt-2 dark:border-strokedark">
                                    <span>Total estudiantes</span>
                                    <strong>{rows.length}</strong>
                                </li>
                                <li className="flex justify-between">
                                    <span>Promedio grupo</span>
                                    <strong>{avgFinal.toFixed(2)}</strong>
                                </li>
                                <li className="flex justify-between">
                                    <span>Nota más alta</span>
                                    <strong>{maxFinal.toFixed(2)}</strong>
                                </li>
                                <li className="flex justify-between">
                                    <span>Nota más baja</span>
                                    <strong>{minFinal.toFixed(2)}</strong>
                                </li>
                            </ul>
                        </SideCard>

                        <SideCard title="Estado del semestre">
                            {semesterActive ? (
                                <p className="flex gap-2 text-sm text-[#16a34a]">
                                    <Check className="h-5 w-5 shrink-0" />
                                    Semestre activo: {semesterLabel}
                                </p>
                            ) : (
                                <p className="text-sm text-red-600">
                                    ⊗ Semestre inactivo — no se permite registrar.
                                </p>
                            )}
                        </SideCard>

                        <SideCard title="ℹ Importante">
                            <p className="text-xs text-gray-600">
                                Al confirmar: notas bloqueadas, solo admin puede desbloquear, se
                                genera reporte del grupo.
                            </p>
                        </SideCard>

                        <SideCard title="Reporte">
                            <p className="text-xs text-gray-600 mb-2">
                                Vista previa descargable en CSV.
                            </p>
                            <button
                                type="button"
                                onClick={downloadPreview}
                                className="w-full rounded border border-stroke px-3 py-2 text-xs hover:bg-gray-50 dark:border-strokedark"
                            >
                                👁 Vista previa del reporte
                            </button>
                        </SideCard>
                    </>
                }
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => navigate('/evaluaciones')}
                            className="text-sm text-gray-600"
                        >
                            Cancelar
                        </button>
                        <div className="flex flex-wrap gap-3">
                            <div className="text-right">
                                <button
                                    type="button"
                                    disabled={registered}
                                    className="inline-flex items-center gap-2 rounded-lg border border-stroke px-4 py-2 text-sm"
                                >
                                    <Save className="h-4 w-4" />
                                    Guardar borrador
                                </button>
                                <p className="text-[10px] text-gray-500">No registra oficialmente</p>
                            </div>
                            <div className="text-right">
                                <button
                                    type="button"
                                    disabled={submitting || registered || !semesterActive}
                                    onClick={() => setShowConfirm(true)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Lock className="h-4 w-4" />
                                    )}
                                    Confirmar registro oficial
                                </button>
                                <p className="text-[10px] text-gray-500">
                                    Bloquea edición y genera reporte
                                </p>
                            </div>
                        </div>
                    </>
                }
                bottomBanners={
                    <>
                        {partialCount > 0 && (
                            <ErrorBanner
                                title="Notas incompletas detectadas"
                                message={`${partialCount} estudiante(s) no tienen todas las evaluaciones calificadas. Puede continuar y registrar la nota final parcial.`}
                                actionLabel="Ver detalles"
                                onAction={() =>
                                    document
                                        .querySelector('table')
                                        ?.scrollIntoView({ behavior: 'smooth' })
                                }
                            />
                        )}
                        {!semesterActive && (
                            <ErrorBanner
                                title="Semestre inactivo"
                                message="Si el semestre estuviera inactivo, no se permitiría registrar la nota final. Contacte al administrador."
                                actionLabel="Ir al inicio"
                                onAction={() => navigate('/')}
                            />
                        )}
                    </>
                }
            />

            {showConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-boxdark">
                        <h3 className="text-lg font-semibold">Confirmar registro oficial</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Se registrarán las notas finales de {rows.length} estudiante(s).
                            {partialCount > 0 &&
                                ` ${partialCount} con calificación parcial.`}
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                className="rounded border px-4 py-2 text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => void handleConfirmOfficial()}
                                className="rounded bg-[#6366f1] px-4 py-2 text-sm text-white"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RegisterFinalGradePage;
