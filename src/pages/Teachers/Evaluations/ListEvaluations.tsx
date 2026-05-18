/**
 * Evaluaciones del docente (CU-10, CU-11, CU-12): solo grupos asignados al docente logueado.
 */
import React, { useCallback, useEffect, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  loadTeacherEvaluationsData,
  TeacherEvaluationRow,
} from '../../../utils/teacher/evaluationData';

const ListEvaluations: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<TeacherEvaluationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { evaluations, error } = await loadTeacherEvaluationsData(user);
    setRows(evaluations);
    setLoadError(error);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Breadcrumb pageName="Evaluaciones" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Mis evaluaciones
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              Asociar rúbricas (CU-10), calificar estudiantes (CU-11) y registrar notas finales
              (CU-12).
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/teachers/rubrics/list"
              className="text-sm font-medium text-[#6366f1] hover:underline"
            >
              Mis rúbricas →
            </Link>
            <Link
              to="/teachers/grades"
              className="text-sm font-medium text-[#6366f1] hover:underline"
            >
              Notas finales →
            </Link>
          </div>
        </div>

        {loadError && (
          <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        )}

        {loading ? (
          <p className="py-6 text-center text-gray-500">Cargando...</p>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-gray-500">
            No hay evaluaciones en tus grupos asignados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="py-3 px-4">Evaluación</th>
                  <th className="py-3 px-4">Asignatura</th>
                  <th className="py-3 px-4">Grupo</th>
                  <th className="py-3 px-4 text-center">Peso</th>
                  <th className="py-3 px-4 text-center">Rúbrica</th>
                  <th className="py-3 px-4 text-center">Calificados</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((evaluation) => (
                  <tr
                    key={evaluation.id}
                    className="border-b border-stroke dark:border-strokedark"
                  >
                    <td className="py-4 px-4 font-medium text-black dark:text-white">
                      {evaluation.name}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{evaluation.subject_label}</td>
                    <td className="py-4 px-4 text-gray-600">{evaluation.group_label}</td>
                    <td className="py-4 px-4 text-center">{evaluation.weight}%</td>
                    <td className="py-4 px-4 text-center">
                      {evaluation.rubric_id ? (
                        <span className="text-[#16a34a] text-xs font-medium">Asociada</span>
                      ) : (
                        <span className="text-amber-600 text-xs">Sin rúbrica</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-gray-600">
                      {evaluation.rubric_id
                        ? `${evaluation.students_graded_sent}/${evaluation.students_total}`
                        : '—'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Link
                          to={`/evaluaciones/${evaluation.id}/asociar-rubrica`}
                          className="rounded border border-stroke px-2 py-1 text-xs hover:bg-gray-50 dark:border-strokedark"
                        >
                          Rúbrica
                        </Link>
                        {evaluation.rubric_id && (
                          <Link
                            to={`/evaluaciones/${evaluation.id}/estudiantes`}
                            className="rounded bg-[#6366f1] px-2 py-1 text-xs text-white hover:bg-opacity-90"
                          >
                            Calificar
                          </Link>
                        )}
                        {evaluation.group_id && (
                          <Link
                            to={`/calificaciones/${evaluation.group_id}/nota-final`}
                            className="rounded bg-[#6366f1]/10 px-2 py-1 text-xs text-[#6366f1] hover:underline"
                          >
                            Nota final
                          </Link>
                        )}
                      </div>
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

export default ListEvaluations;
