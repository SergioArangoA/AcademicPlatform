/**
 * Calificaciones finales (docente): elijo grupo y veo/consolido notas;
 * desde aquí puedo ir a registrar nota final por estudiante (RegisterFinalGradePage).
 */
import React, { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { gradeService, getGradeErrorMessage } from '../../../services/gradeService';
import { evaluationService } from '../../../services/evaluationService';
import { enrollmentService } from '../../../services/enrollmentService';
import { semesterService } from '../../../services/semesterService';
import { groupService } from '../../../services/groupService';
import { loadTeacherGroupOptions } from '../../../utils/teacher';
import { SubjectGroupOption } from '../../../models/Subjects/SubjectGroupOption';
import { Evaluation } from '../../../models/Evaluation/Evaluation';
import { Grade } from '../../../models/Evaluation/Grade';

interface ConsolidatedRow {
  enrollment_id: string;
  student_id: string;
  official_score: number;
  evaluations_graded: number;
  evaluations_total: number;
  incomplete: boolean;
}

const FinalGrades: React.FC = () => {
  const { user } = useAuth();
  const [groupOptions, setGroupOptions] = useState<SubjectGroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [enrollments, setEnrollments] = useState<{ id: string; student_id: string }[]>([]);
  const [semesterActive, setSemesterActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [reportRows, setReportRows] = useState<ConsolidatedRow[]>([]);

  useEffect(() => {
    const init = async () => {
      const options = await loadTeacherGroupOptions(user);
      setGroupOptions(options);
      if (options[0]) setSelectedGroupId(options[0].group_id);
      setLoading(false);
    };
    void init();
  }, [user]);

  useEffect(() => {
    if (!selectedGroupId) return;
    const load = async () => {
      setLoading(true);
      const [evals, allGrades, enrolls, semesters, groupData] = await Promise.all([
        evaluationService.getEvaluations(),
        gradeService.getGrades(),
        enrollmentService.getEnrollments(selectedGroupId),
        semesterService.getSemesters(),
        groupService.getGroupById(selectedGroupId),
      ]);

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

      for (const ev of evaluations) {
        const grade = grades.find(
          (g) =>
            String(g.enrollment_id) === enrollment.id &&
            String(g.rubric_id) === String(ev.rubric_id) &&
            g.status === 'SENT'
        );
        if (grade && grade.final_score != null) {
          graded += 1;
          official += Number(grade.final_score) * (Number(ev.weight) / 100);
        }
      }

      return {
        enrollment_id: enrollment.id,
        student_id: enrollment.student_id,
        official_score: Number(official.toFixed(2)),
        evaluations_graded: graded,
        evaluations_total: total,
        incomplete: graded < total,
      };
    });
  }, [enrollments, evaluations, grades]);

  const handleRegisterOfficial = async () => {
    if (!selectedGroupId) return;
    if (!semesterActive) {
      toast.error('E2: El semestre no está activo. Contacta al administrador.');
      return;
    }

    const incomplete = consolidated.filter((r) => r.incomplete);
    if (incomplete.length > 0) {
      const ok = window.confirm(
        `E1: ${incomplete.length} estudiante(s) tienen evaluaciones sin calificar enviadas. ¿Registrar notas finales parciales de todos modos?`
      );
      if (!ok) return;
    } else {
      const ok = window.confirm(
        '¿Confirmar el registro oficial? Las notas quedarán bloqueadas (is_locked).'
      );
      if (!ok) return;
    }

    setRegistering(true);
    try {
      const result = await gradeService.registerFinalScores(selectedGroupId);
      setReportRows(
        result.map((r) => ({
          enrollment_id: r.enrollment_id,
          student_id: r.student_id,
          official_score: r.official_final_score,
          evaluations_graded: r.evaluations_count,
          evaluations_total: evaluations.length,
          incomplete: false,
        }))
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
              {groupOptions.map((o) => (
                <option key={o.group_id} value={o.group_id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {!registered && semesterActive && (
            <button
              type="button"
              disabled={registering || loading}
              onClick={handleRegisterOfficial}
              className="rounded-md bg-success px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {registering ? 'Registrando...' : 'Confirmar registro oficial'}
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
              Nota consolidada = Σ (nota evaluación × peso evaluación / 100) solo con calificaciones
              enviadas (SENT).
            </p>
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-2 dark:bg-meta-4 text-left">
                  <th className="py-3 px-4">Inscripción</th>
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-4 text-center">Evaluaciones</th>
                  <th className="py-3 px-4 text-right">Nota consolidada</th>
                </tr>
              </thead>
              <tbody>
                {consolidated.map((row) => (
                  <tr key={row.enrollment_id} className="border-b border-stroke dark:border-strokedark">
                    <td className="py-3 px-4 font-mono text-xs">{row.enrollment_id}</td>
                    <td className="py-3 px-4 font-mono text-xs">{row.student_id}</td>
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
