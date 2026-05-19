/**
 * Listado de estudiantes de una evaluación para calificar (CU-11).
 * Ruta: /evaluaciones/:evaluacionId/estudiantes
 * La publicación de notas se hace desde Mis evaluaciones (SweetAlert2 + API).
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumb';
import {
  loadEvaluationStudentsRows,
  EvaluationStudentRow,
} from '../../../utils/teacher/evaluationData';

const statusLabel: Record<EvaluationStudentRow['grade_status'], string> = {
  NONE: 'Sin calificar',
  DRAFT: 'Borrador',
  SENT: 'Enviada',
};

const statusClass: Record<EvaluationStudentRow['grade_status'], string> = {
  NONE: 'text-amber-600 bg-amber-50',
  DRAFT: 'text-gray-600 bg-gray-100',
  SENT: 'text-green-700 bg-green-50',
};

const EvaluationStudentsPage = () => {
  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluationName, setEvaluationName] = useState('');
  const [subjectLabel, setSubjectLabel] = useState('—');
  const [groupLabel, setGroupLabel] = useState('—');
  const [hasRubric, setHasRubric] = useState(false);
  const [students, setStudents] = useState<EvaluationStudentRow[]>([]);

  const load = useCallback(async () => {
    if (!evaluacionId) return;
    setLoading(true);
    setError(null);
    const result = await loadEvaluationStudentsRows(evaluacionId);
    if (result.error) {
      setError(result.error);
      setStudents([]);
    } else {
      setEvaluationName(result.evaluation?.name ?? 'Evaluación');
      setSubjectLabel(result.subject_label);
      setGroupLabel(result.group_label);
      setHasRubric(!!result.evaluation?.rubric_id);
      setStudents(result.students);
    }
    setLoading(false);
  }, [evaluacionId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Breadcrumb pageName="Estudiantes y notas" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="mb-6 flex flex-wrap justify-between items-start gap-3">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">{evaluationName}</h4>
            <p className="mt-1 text-sm text-gray-500">
              {subjectLabel} · {groupLabel}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Para publicar las calificaciones ya guardadas, usa <strong>Publicar notas</strong> en la
              lista <strong>Mis evaluaciones</strong>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Link
              to="/evaluaciones"
              className="rounded border border-stroke px-3 py-2 text-sm hover:bg-gray-50 dark:border-strokedark"
            >
              ← Evaluaciones
            </Link>
          </div>
        </div>

        {!hasRubric && !loading && (
          <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Esta evaluación no tiene rúbrica asociada.{' '}
            <Link
              to={`/evaluaciones/${evaluacionId}/asociar-rubrica`}
              className="font-medium text-[#6366f1] underline"
            >
              Asociar rúbrica (CU-10)
            </Link>{' '}
            antes de calificar.
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-8 text-center text-gray-500">Cargando estudiantes...</p>
        ) : students.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No hay inscripciones activas en este grupo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Nota</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {students.map((row) => (
                  <tr key={row.enrollment_id} className="border-b border-stroke dark:border-strokedark">
                    <td className="py-3 px-4 font-medium text-black dark:text-white">
                      {row.student_name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{row.student_code}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[row.grade_status]}`}
                      >
                        {statusLabel[row.grade_status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.final_score != null ? row.final_score.toFixed(2) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {hasRubric ? (
                        <Link
                          to={`/evaluaciones/${evaluacionId}/calificar/${row.enrollment_id}`}
                          className="inline-block rounded bg-[#6366f1] px-3 py-1 text-xs text-white hover:bg-opacity-90"
                        >
                          {row.grade_status === 'NONE' ? 'Calificar' : 'Editar'}
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">Sin rúbrica</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default EvaluationStudentsPage;
