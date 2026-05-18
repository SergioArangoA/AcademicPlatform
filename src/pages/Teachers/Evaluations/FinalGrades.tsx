/**
 * Calificaciones finales (docente): elijo grupo y veo/consolido notas;
 * desde aquí puedo ir a registrar nota final por estudiante (RegisterFinalGradePage).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumb';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { gradeService, getGradeErrorMessage, isGradeRecorded } from '../../../services/gradeService';
import { evaluationService } from '../../../services/evaluationService';
import { enrollmentService } from '../../../services/enrollmentService';
import { semesterService } from '../../../services/semesterService';
import { groupService } from '../../../services/groupService';
import { loadTeacherGroupOptions } from '../../../utils/teacher';
import { userPService } from '../../../services/userPService';
import { UserForList } from '../../../models/Users/UserForList';
import { buildStudentLookupMap, resolveStudentFromEnrollment, transformUsersForList } from '../../../utils/userTransformers';
import { SubjectGroupOption } from '../../../models/Subjects/SubjectGroupOption';
import { Evaluation } from '../../../models/Evaluation/Evaluation';
import { Grade } from '../../../models/Evaluation/Grade';

interface ConsolidatedRow {
  enrollment_id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  official_score: number;
  evaluations_graded: number;
  evaluations_total: number;
  incomplete: boolean;
}

const FinalGrades: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const subjectFromUrl = searchParams.get('subject') ?? '';
  const [groupOptions, setGroupOptions] = useState<SubjectGroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [enrollments, setEnrollments] = useState<{ id: string; student_id: string }[]>([]);
  const [studentLookup, setStudentLookup] = useState<Map<string, UserForList>>(new Map());
  const [semesterActive, setSemesterActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [reportRows, setReportRows] = useState<ConsolidatedRow[]>([]);

  useEffect(() => {
    const init = async () => {
      const options = await loadTeacherGroupOptions(user);
      setGroupOptions(options);
      const filtered = subjectFromUrl
        ? options.filter((o) => String(o.subject_id) === subjectFromUrl)
        : options;
      if (filtered[0]) setSelectedGroupId(filtered[0].group_id);
      else if (options[0]) setSelectedGroupId(options[0].group_id);
      setLoading(false);
    };
    void init();
  }, [user, subjectFromUrl]);

  const visibleGroupOptions = useMemo(
    () =>
      subjectFromUrl
        ? groupOptions.filter((o) => String(o.subject_id) === subjectFromUrl)
        : groupOptions,
    [groupOptions, subjectFromUrl]
  );

  useEffect(() => {
    if (!selectedGroupId) return;
    const load = async () => {
      setLoading(true);
      const [evals, allGrades, enrolls, semesters, groupData, usersRaw] = await Promise.all([
        evaluationService.getEvaluations(),
        gradeService.getGrades(),
        enrollmentService.getEnrollments(selectedGroupId),
        semesterService.getSemesters(),
        groupService.getGroupById(selectedGroupId),
        userPService.getUsers(),
      ]);

      const students = transformUsersForList(Array.isArray(usersRaw) ? usersRaw : []).filter(
        (u) => u.role === 'STUDENT'
      );
      setStudentLookup(buildStudentLookupMap(students));

      const groupEvals = evals.filter(
        (e) => String(e.group_id) === selectedGroupId && e.rubric_id
      );
      setEvaluations(groupEvals);
      setGrades(allGrades);
      setEnrollments(
        enrolls.map((e) => ({ id: String(e.id), student_id: String(e.student_id) }))
      );

      if (groupData?.semester_id) {
        const sem = semesters.find((s) => String(s.id) === String(groupData.semester_id));
        setSemesterActive(sem?.is_active !== false);
      } else {
        setSemesterActive(true);
      }

      setLoading(false);
      setRegistered(false);
    };
    void load();
  }, [selectedGroupId, groupOptions]);

  const consolidated: ConsolidatedRow[] = useMemo(() => {
    return enrollments.map((enrollment) => {
      let official = 0;
      let graded = 0;
      const total = evaluations.length;
      const st = resolveStudentFromEnrollment(studentLookup, enrollment.student_id);

      for (const ev of evaluations) {
        const grade = grades.find(
          (g) =>
            String(g.enrollment_id) === enrollment.id &&
            String(g.rubric_id) === String(ev.rubric_id) &&
            isGradeRecorded(g.status)
        );
        if (grade && grade.final_score != null) {
          graded += 1;
          official += Number(grade.final_score) * (Number(ev.weight) / 100);
        }
      }

      return {
        enrollment_id: enrollment.id,
        student_id: enrollment.student_id,
        student_name: st?.name ?? `Estudiante ${enrollment.student_id.slice(0, 8)}`,
        student_code: st?.code ?? '—',
        official_score: Number(official.toFixed(2)),
        evaluations_graded: graded,
        evaluations_total: total,
        incomplete: graded < total,
      };
    });
  }, [enrollments, evaluations, grades, studentLookup]);

  const handleRegisterOfficial = async () => {
    if (!selectedGroupId) return;
    if (!semesterActive) {
      toast.error('E2: El semestre no está activo. Contacta al administrador.');
      return;
    }

    const incomplete = consolidated.filter((r) => r.incomplete);
    if (incomplete.length > 0) {
      toast.error(
        'No se pueden registrar las notas: hay estudiantes o evaluaciones sin calificar.'
      );
      return;
    }

    const ok = window.confirm(
      '¿Confirmar el registro oficial de las notas finales de este grupo?'
    );
    if (!ok) return;

    setRegistering(true);
    try {
      const result = await gradeService.registerFinalScores(selectedGroupId);
      setReportRows(
        result.map((r) => {
          const st = resolveStudentFromEnrollment(studentLookup, r.student_id);
          return {
            enrollment_id: r.enrollment_id,
            student_id: r.student_id,
            student_name: st?.name ?? `Estudiante ${String(r.student_id).slice(0, 8)}`,
            student_code: st?.code ?? '—',
            official_score: r.official_final_score,
            evaluations_graded: r.evaluations_count,
            evaluations_total: evaluations.length,
            incomplete: false,
          };
        })
      );
      setRegistered(true);
      toast.success('Notas finales registradas oficialmente.');
    } catch (err) {
      toast.error(getGradeErrorMessage(err));
    } finally {
      setRegistering(false);
    }
  };

  const downloadReport = () => {
    const rows = (reportRows.length ? reportRows : consolidated).map((r) =>
      [r.enrollment_id, r.student_id, r.official_score, r.evaluations_graded, r.evaluations_total].join(
        ','
      )
    );
    const csv = ['enrollment_id,student_id,nota_final,eval_calificadas,eval_total', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notas-finales-grupo-${selectedGroupId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Breadcrumb pageName="Notas finales (CU-12)" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-6 flex flex-wrap gap-4 justify-between items-end">
          <div>
            <label className="text-sm font-medium text-black dark:text-white">Grupo</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="mt-1 block rounded border border-stroke py-2 px-3 dark:bg-form-input dark:border-strokedark"
            >
              {visibleGroupOptions.map((o) => (
                <option key={o.group_id} value={o.group_id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {!registered && semesterActive && (
            <button
              type="button"
              disabled={
                registering ||
                loading ||
                consolidated.some((r) => r.incomplete) ||
                evaluations.length === 0
              }
              onClick={handleRegisterOfficial}
              title={
                consolidated.some((r) => r.incomplete)
                  ? 'Califica todas las evaluaciones antes de registrar'
                  : undefined
              }
              className="rounded-md bg-success px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {registering ? 'Registrando...' : 'Registrar notas finales'}
            </button>
          )}
          {registered && (
            <span className="rounded-full bg-success/10 text-success px-3 py-1 text-sm font-medium">
              Registrado oficialmente
            </span>
          )}
          {!semesterActive && (
            <span className="text-sm text-red-500">Semestre inactivo — registro bloqueado</span>
          )}
        </div>

        {loading ? (
          <p className="text-center py-6 text-gray-500">Cargando consolidado...</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Nota consolidada = Σ (nota evaluación × peso / 100) con calificaciones en borrador.
              Al registrar, pasan a estado enviado (SENT) y quedan bloqueadas.
            </p>
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-2 dark:bg-meta-4 text-left">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-4 text-center">Evaluaciones</th>
                  <th className="py-3 px-4 text-right">Nota consolidada</th>
                </tr>
              </thead>
              <tbody>
                {consolidated.map((row) => (
                  <tr key={row.enrollment_id} className="border-b border-stroke dark:border-strokedark">
                    <td className="py-3 px-4">{row.student_code}</td>
                    <td className="py-3 px-4 font-medium text-black dark:text-white">{row.student_name}</td>
                    <td className="py-3 px-4 text-center">
                      {row.evaluations_graded}/{row.evaluations_total}
                      {row.incomplete && (
                        <span className="block text-xs text-amber-600">Incompleto</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">{row.official_score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(registered || consolidated.length > 0) && (
              <button
                type="button"
                onClick={downloadReport}
                className="mt-6 text-primary text-sm font-medium hover:underline"
              >
                Descargar reporte (CSV)
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default FinalGrades;
