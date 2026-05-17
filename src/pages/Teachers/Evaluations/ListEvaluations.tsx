/*
 * CU-10 — Listado de evaluaciones (entrada al flujo de asociación y calificación)
 */
import React, { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { Link } from 'react-router-dom';
import { evaluationService } from '../../../services/evaluationService';
import { enrollmentService } from '../../../services/enrollmentService';
import { Evaluation } from '../../../models/Evaluation/Evaluation';

const ListEvaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const evalsData = await evaluationService.getEvaluations();
      setEvaluations(evalsData);
      setLoading(false);
    };
    void fetchData();
  }, []);

  const sorted = useMemo(
    () =>
      [...evaluations].sort((a, b) =>
        (b.updated_at ?? b.created_at ?? '').localeCompare(
          a.updated_at ?? a.created_at ?? ''
        )
      ),
    [evaluations]
  );

  return (
    <>
      <Breadcrumb pageName="Evaluaciones" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Evaluaciones del docente
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              CU-10, CU-11 y CU-12 — asociar rúbricas, calificar y registrar notas finales.
            </p>
          </div>
          <Link
            to="/teachers/rubrics/list"
            className="text-sm font-medium text-[#6366f1] hover:underline"
          >
            Mis rúbricas →
          </Link>
        </div>

        {loading ? (
          <p className="py-6 text-center text-gray-500">Cargando...</p>
        ) : sorted.length === 0 ? (
          <p className="py-6 text-center text-gray-500">No hay evaluaciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="py-3 px-4">Evaluación</th>
                  <th className="py-3 px-4">Grupo</th>
                  <th className="py-3 px-4 text-center">Peso</th>
                  <th className="py-3 px-4 text-center">Rúbrica</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((evaluation) => (
                  <tr
                    key={evaluation.id}
                    className="border-b border-stroke dark:border-strokedark"
                  >
                    <td className="py-4 px-4 font-medium text-black dark:text-white">
                      {evaluation.name}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{evaluation.group_id}</td>
                    <td className="py-4 px-4 text-center">{evaluation.weight}%</td>
                    <td className="py-4 px-4 text-center">
                      {evaluation.rubric_id ? (
                        <span className="text-[#16a34a] text-xs font-medium">Asociada</span>
                      ) : (
                        <span className="text-amber-600 text-xs">Sin rúbrica</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Link
                          to={`/evaluaciones/${evaluation.id}/asociar-rubrica`}
                          className="rounded border border-stroke px-2 py-1 text-xs hover:bg-gray-50 dark:border-strokedark"
                        >
                          Asociar rúbrica
                        </Link>
                        {evaluation.rubric_id && (
                          <EvaluationGradeLink evaluation={evaluation} />
                        )}
                        {evaluation.group_id && (
                          <Link
                            to={`/calificaciones/${evaluation.group_id}/nota-final`}
                            className="rounded bg-[#6366f1]/10 px-2 py-1 text-xs text-[#6366f1] hover:underline"
                          >
                            Nota final grupo
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

function EvaluationGradeLink({ evaluation }: { evaluation: Evaluation }) {
  const [firstEnrollment, setFirstEnrollment] = useState<string | null>(null);

  useEffect(() => {
    if (!evaluation.group_id) return;
    enrollmentService.getEnrollments(String(evaluation.group_id)).then((list) => {
      if (list[0]?.id) setFirstEnrollment(String(list[0].id));
    });
  }, [evaluation.group_id]);

  if (!firstEnrollment) {
    return (
      <span className="text-xs text-gray-400">Sin inscripciones</span>
    );
  }

  return (
    <Link
      to={`/evaluaciones/${evaluation.id}/calificar/${firstEnrollment}`}
      className="rounded bg-[#6366f1] px-2 py-1 text-xs text-white hover:bg-opacity-90"
    >
      Calificar
    </Link>
  );
}

export default ListEvaluations;
