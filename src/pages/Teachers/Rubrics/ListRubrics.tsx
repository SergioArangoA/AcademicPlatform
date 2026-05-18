/**
 * Mis rúbricas: listado con cantidad de criterios y enlace a crear o editar flujo.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Criterion } from '../../../models/Evaluation/Criterion';
import { criterionService } from '../../../services/criterionService';
import { getCriterionRubricId } from '../../../utils/criterionWeight';
import { loadTeacherRubricsData, TeacherRubricRow } from '../../../utils/teacher';

type RubricRow = TeacherRubricRow & { criteriaCount: number };

const ListRubrics: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<RubricRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { rubrics, error } = await loadTeacherRubricsData(user);
      if (error) {
        setLoadError(error);
        setRows([]);
        return;
      }

      const rubricIds = new Set(rubrics.map((r) => String(r.id)));
      const allCriteria = await criterionService.getCriteria();
      const criteria = allCriteria.filter((c: Criterion) => {
        const rid = getCriterionRubricId(c);
        return rid != null && rubricIds.has(rid);
      });

      const countByRubric = new Map<string, number>();
      criteria.forEach((c: Criterion) => {
        const key = getCriterionRubricId(c) ?? '';
        countByRubric.set(key, (countByRubric.get(key) ?? 0) + 1);
      });

      setRows(
        rubrics.map((r) => ({
          ...r,
          criteriaCount: countByRubric.get(String(r.id)) ?? 0,
        }))
      );
    } catch {
      setLoadError('No se pudieron cargar las rúbricas.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) =>
        (b.updated_at ?? b.created_at ?? '').localeCompare(
          a.updated_at ?? a.created_at ?? ''
        )
      ),
    [rows]
  );

  return (
    <>
      <Breadcrumb pageName="Mis Rúbricas" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="mb-6 flex justify-between items-center">
          <h4 className="text-xl font-semibold text-black dark:text-white">Lista de rúbricas (CU-08)</h4>
          <Link
            to="/teachers/rubrics/create"
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
          >
            Crear rúbrica
          </Link>
        </div>

        {loadError && (
          <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        )}

        {loading ? (
          <p className="py-6 text-center text-gray-500">Cargando...</p>
        ) : sorted.length === 0 ? (
          <p className="py-6 text-center text-gray-500">
            No hay rúbricas. Crea la primera para comenzar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Asignatura</th>
                  <th className="py-3 px-4 text-center">Criterios</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((rubric) => (
                  <tr
                    key={rubric.id}
                    className="border-b border-stroke dark:border-strokedark"
                  >
                    <td className="py-4 px-4">
                      <p className="font-medium text-black dark:text-white">{rubric.title}</p>
                      {rubric.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{rubric.description}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                      {rubric.subject_label}
                    </td>
                    <td className="py-4 px-4 text-center">{rubric.criteriaCount}</td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex rounded-full py-1 px-3 text-xs font-medium ${
                          rubric.is_public
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {rubric.is_public ? 'Publicada' : 'Borrador'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Link
                          to={`/teachers/rubrics/${rubric.id}/revision`}
                          className="text-primary hover:underline text-xs"
                        >
                          Revisar
                        </Link>
                        {!rubric.is_public && (
                          <Link
                            to={`/teachers/rubrics/${rubric.id}/escalas`}
                            className="text-primary hover:underline text-xs"
                          >
                            Escalas
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

export default ListRubrics;
