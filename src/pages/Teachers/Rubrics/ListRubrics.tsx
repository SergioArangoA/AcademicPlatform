/**
 * Listado de rúbricas (CU-08).
 *
 * Pestañas:
 * - Sin evaluación: plantillas que no están en ninguna evaluación.
 * - Mis grupos: rúbricas en evaluaciones de tus grupos.
 *
 * Filtro: utils/teacher/rubricFilters.ts
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Criterion } from '../../../models/Evaluation/Criterion';
import { criterionService } from '../../../services/criterionService';
import { getCriterionRubricId } from '../../../utils/criterionWeight';
import { loadTeacherRubricsData } from '../../../utils/teacher';
import { TeacherRubricRow } from '../../../models/Utils/TeacherRubricRow';
import { filterRubricsWithoutEvaluation } from '../../../utils/teacher/rubricFilters';
import { isRubricEditable } from '../../../utils/rubricEditRules';
import { canTeacherDeleteRubric } from '../../../utils/rubricDeleteRules';
import { rubricService, getRubricErrorMessage } from '../../../services/rubricService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

type RubricRow = TeacherRubricRow & { criteriaCount: number };

type TabFilter = 'all' | 'mine';

function RubricTable({
  rows,
  emptyMessage,
  onDelete,
  deletingId,
}: {
  rows: RubricRow[];
  emptyMessage: string;
  onDelete?: (rubric: RubricRow) => void;
  deletingId?: string | null;
}) {
  if (rows.length === 0) {
    return <p className="py-4 text-center text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="bg-gray-2 text-left dark:bg-meta-4">
            <th className="py-3 px-4">Título</th>
            <th className="py-3 px-4">Origen</th>
            <th className="py-3 px-4">Asignatura / uso</th>
            <th className="py-3 px-4 text-center">Criterios</th>
            <th className="py-3 px-4 text-center">Estado</th>
            <th className="py-3 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((rubric) => {
            const canEdit = isRubricEditable(rubric);
            const statusLabel = rubric.is_archived
              ? 'Archivada'
              : rubric.is_public
                ? 'Publicada'
                : 'Borrador';

            return (
              <tr
                key={rubric.id}
                className="border-b border-stroke dark:border-strokedark"
              >
                <td className="py-4 px-4">
                  <p className="font-medium text-black dark:text-white">{rubric.title}</p>
                  {rubric.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {rubric.description}
                    </p>
                  )}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {rubric.visibility === 'mine' ? 'Mis grupos' : 'Plantilla'}
                </td>
                <td className="py-4 px-4 text-gray-600">{rubric.subject_label}</td>
                <td className="py-4 px-4 text-center">{rubric.criteriaCount}</td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`inline-flex rounded-full py-1 px-3 text-xs font-medium ${
                      rubric.is_public
                        ? 'bg-success/10 text-success'
                        : rubric.is_archived
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    <Link
                      to={`/teachers/rubrics/${rubric.id}/revision`}
                      className="text-primary hover:underline text-xs"
                    >
                      {rubric.is_public ? 'Ver' : 'Revisar'}
                    </Link>
                    {canEdit && (
                      <>
                        <Link
                          to={`/teachers/rubrics/${rubric.id}/edit`}
                          className="text-primary hover:underline text-xs"
                        >
                          Editar
                        </Link>
                        <Link
                          to={`/teachers/rubrics/${rubric.id}/escalas`}
                          className="text-primary hover:underline text-xs"
                        >
                          Escalas
                        </Link>
                      </>
                    )}
                    {onDelete && canTeacherDeleteRubric(rubric) && (
                      <button
                        type="button"
                        disabled={deletingId === String(rubric.id)}
                        onClick={() => onDelete(rubric)}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deletingId === String(rubric.id) ? '...' : 'Eliminar'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const ListRubrics: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<RubricRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const mine = useMemo(
    () => sorted.filter((r) => r.visibility === 'mine'),
    [sorted]
  );

  const withoutEvaluation = useMemo(
    () => filterRubricsWithoutEvaluation(sorted),
    [sorted]
  );

  const displayed = tab === 'mine' ? mine : withoutEvaluation;

  const handleDeleteRubric = async (rubric: RubricRow) => {
    if (!rubric.id || !canTeacherDeleteRubric(rubric)) return;

    const result = await Swal.fire({
      title: '¿Eliminar rúbrica?',
      html: `Se eliminará la plantilla <strong>${rubric.title}</strong>. Solo es posible si no está en ninguna evaluación.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) return;

    setDeletingId(String(rubric.id));
    try {
      await rubricService.deleteRubric(String(rubric.id));
      toast.success('Rúbrica eliminada.');
      await load();
    } catch (err) {
      toast.error(getRubricErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const tabClass = (t: TabFilter) =>
    `rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      tab === t
        ? 'bg-primary text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-200'
    }`;

  return (
    <>
      <Breadcrumb pageName="Rúbricas" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Rúbricas (CU-08)
            </h4>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              <strong>Sin evaluación:</strong> plantillas que aún no están en una evaluación.{' '}
              <strong>Mis grupos:</strong> rúbricas ya asociadas en{' '}
              <Link to="/evaluaciones" className="text-primary hover:underline">
                Evaluaciones
              </Link>
              .
            </p>
          </div>
          <Link
            to="/teachers/rubrics/create"
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
          >
            Crear rúbrica
          </Link>
        </div>

        {!loading && rows.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" className={tabClass('all')} onClick={() => setTab('all')}>
              Sin evaluación ({withoutEvaluation.length})
            </button>
            <button type="button" className={tabClass('mine')} onClick={() => setTab('mine')}>
              Mis grupos ({mine.length})
            </button>
          </div>
        )}

        {loadError && (
          <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        )}

        {loading ? (
          <p className="py-6 text-center text-gray-500">Cargando...</p>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">
              No hay rúbricas visibles. Crea una plantilla o asóciala desde evaluaciones.
            </p>
            <Link
              to="/teachers/rubrics/create"
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90"
            >
              Crear rúbrica
            </Link>
          </div>
        ) : (
          <RubricTable
            rows={displayed}
            emptyMessage={
              tab === 'mine'
                ? 'Ninguna rúbrica asociada a evaluaciones de tus grupos.'
                : 'No hay rúbricas sin evaluación asociada.'
            }
            onDelete={tab === 'all' ? handleDeleteRubric : undefined}
            deletingId={deletingId}
          />
        )}
      </div>
    </>
  );
};

export default ListRubrics;
