/*
 * CU-10 – Asociar rúbrica publicada a evaluación
 */
import React, { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  evaluationService,
  getEvaluationErrorMessage,
} from '../../../services/evaluationService';
import { rubricService } from '../../../services/rubricService';
import { gradeService } from '../../../services/gradeService';
import { Evaluation } from '../../../models/Evaluation';
import { Rubric } from '../../../models/Rubric';

const ListEvaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [publicRubrics, setPublicRubrics] = useState<Rubric[]>([]);
  const [grades, setGrades] = useState<{ rubric_id?: string; enrollment_id?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [evalsData, rubricsData, gradesData] = await Promise.all([
          evaluationService.getEvaluations(),
          rubricService.getPublicRubrics(),
          gradeService.getGrades(),
        ]);
        setEvaluations(evalsData);
        setPublicRubrics(rubricsData);
        setGrades(gradesData);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  const rubricTitleById = useMemo(() => {
    const map = new Map<string, string>();
    publicRubrics.forEach((r) => {
      if (r.id) map.set(String(r.id), r.title ?? 'Sin título');
    });
    return map;
  }, [publicRubrics]);

  const evaluationHasGrades = (evaluation: Evaluation): boolean => {
    if (!evaluation.rubric_id) return false;
    return grades.some((g) => String(g.rubric_id) === String(evaluation.rubric_id));
  };

  const handleAssociateRubric = async (evalId: string, rubricId: string) => {
    if (!rubricId) return;

    const evaluation = evaluations.find((e) => String(e.id) === String(evalId));
    if (
      evaluation?.rubric_id &&
      evaluationHasGrades(evaluation) &&
      String(evaluation.rubric_id) !== rubricId
    ) {
      toast.error(
        'E2: Ya existen notas vinculadas a esta evaluación. No se puede cambiar la rúbrica.'
      );
      return;
    }

    try {
      const updated = await evaluationService.associateRubric(evalId, rubricId);
      setEvaluations((evals) =>
        evals.map((e) => (String(e.id) === String(evalId) ? { ...e, ...updated } : e))
      );
      toast.success('Rúbrica asociada a la evaluación y asignatura actualizadas.');
    } catch (error) {
      toast.error(getEvaluationErrorMessage(error));
    }
  };

  return (
    <>
      <Breadcrumb pageName="Evaluaciones (CU-10)" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
          Asociar rúbrica a evaluación
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Solo se listan rúbricas publicadas (es_publica = true). Si no hay ninguna,{' '}
          <Link to="/teachers/rubrics/create" className="text-primary hover:underline">
            crea y publica una rúbrica (CU-08)
          </Link>
          .
        </p>

        {loading ? (
          <p className="py-6 text-center">Cargando...</p>
        ) : evaluations.length === 0 ? (
          <p className="py-6 text-center">No hay evaluaciones registradas.</p>
        ) : publicRubrics.length === 0 ? (
          <p className="py-6 text-center text-amber-600">
            E1: No hay rúbricas publicadas. Publica una rúbrica antes de asociarla.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-2 dark:bg-meta-4 text-left">
                  <th className="py-3 px-4">Evaluación</th>
                  <th className="py-3 px-4">Grupo</th>
                  <th className="py-3 px-4">Rúbrica</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evaluation) => {
                  const locked =
                    !!evaluation.rubric_id && evaluationHasGrades(evaluation);
                  return (
                    <tr
                      key={evaluation.id}
                      className="border-b border-stroke dark:border-strokedark"
                    >
                      <td className="py-4 px-4 font-medium text-black dark:text-white">
                        {evaluation.name}
                        <span className="block text-xs text-gray-500">
                          Peso: {evaluation.weight}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                        {evaluation.group_id}
                      </td>
                      <td className="py-4 px-4">
                        {locked ? (
                          <span className="text-xs text-gray-500">
                            {rubricTitleById.get(String(evaluation.rubric_id)) ?? evaluation.rubric_id}
                            <span className="block text-amber-600">Con notas — no editable</span>
                          </span>
                        ) : (
                          <select
                            className="w-full max-w-xs rounded border border-stroke py-1.5 px-2 text-sm dark:bg-form-input dark:border-strokedark"
                            value={evaluation.rubric_id ?? ''}
                            onChange={(e) =>
                              handleAssociateRubric(String(evaluation.id), e.target.value)
                            }
                          >
                            <option value="" disabled>
                              {evaluation.rubric_id ? 'Cambiar rúbrica...' : 'Asociar rúbrica...'}
                            </option>
                            {publicRubrics.map((r) => (
                              <option key={r.id} value={String(r.id)}>
                                {r.title}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {evaluation.rubric_id ? (
                          <Link
                            to={`/teachers/evaluations/${evaluation.id}/grade`}
                            className="inline-flex rounded bg-primary py-1.5 px-3 text-xs text-white hover:bg-opacity-90"
                          >
                            Calificar (CU-11)
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">Asocia una rúbrica</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ListEvaluations;
