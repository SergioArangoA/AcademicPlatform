/**
 * Evaluaciones del docente: listado, asociar rúbrica (solo si falta), calificar, eliminar.
 * Los pesos por asignatura deben sumar 100 % entre todas sus evaluaciones.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';
import {
  loadTeacherEvaluationsData,
  TeacherEvaluationRow,
} from '../../../utils/teacher/evaluationData';
import { loadTeacherSubjects } from '../../../utils/teacher/evaluationHelpers';
import type { TeacherSubjectOption } from '../../../utils/teacher/types';
import {
  checkSubjectWeights,
  summarizeWeightsBySubject,
} from '../../../utils/evaluationWeights';
import { getSubjectFinalGradesStatus } from '../../../utils/subjectGradingStatus';
import {
  evaluationService,
  getEvaluationErrorMessage,
} from '../../../services/evaluationService';

const ListEvaluations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rows, setRows] = useState<TeacherEvaluationRow[]>([]);
  const [subjects, setSubjects] = useState<TeacherSubjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [subjectFilter, setSubjectFilter] = useState(
    () => searchParams.get('subject') ?? 'all'
  );
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const [evalResult, teacherSubjects] = await Promise.all([
      loadTeacherEvaluationsData(user),
      loadTeacherSubjects(user),
    ]);
    setRows(evalResult.evaluations);
    setLoadError(evalResult.error);
    setSubjects(teacherSubjects);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const fromUrl = searchParams.get('subject');
    if (fromUrl) setSubjectFilter(fromUrl);
  }, [searchParams]);

  const handleSubjectFilterChange = (value: string) => {
    setSubjectFilter(value);
    if (value === 'all') {
      searchParams.delete('subject');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ subject: value }, { replace: true });
    }
  };

  const weightBySubject = useMemo(
    () => summarizeWeightsBySubject(rows),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((ev) => {
      if (subjectFilter !== 'all' && String(ev.subject_id) !== subjectFilter) {
        return false;
      }
      if (q) {
        const hay = `${ev.name} ${ev.subject_label} ${ev.group_label}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, subjectFilter, search]);

  const activeSubjectWeight = useMemo(() => {
    if (subjectFilter === 'all') return null;
    return weightBySubject.get(subjectFilter) ?? checkSubjectWeights(rows, subjectFilter);
  }, [subjectFilter, weightBySubject, rows]);

  const subjectFinalGrades = useMemo(() => {
    if (subjectFilter === 'all') return null;
    return getSubjectFinalGradesStatus(rows, subjectFilter);
  }, [rows, subjectFilter]);

  const handleDeleteEvaluation = async (evaluation: TeacherEvaluationRow) => {
    if (!evaluation.id) return;

    const hasGrades = evaluation.students_graded > 0;
    const result = await Swal.fire({
      title: '¿Eliminar evaluación?',
      html: hasGrades
        ? `<p>Se eliminará <strong>${evaluation.name}</strong>. Hay calificaciones enviadas; el backend puede rechazar la operación.</p>`
        : `<p>Se eliminará <strong>${evaluation.name}</strong>. Esta acción no se puede deshacer.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) return;

    setDeletingId(String(evaluation.id));
    try {
      await evaluationService.deleteEvaluation(String(evaluation.id));
      toast.success('Evaluación eliminada.');
      await load();
    } catch (err) {
      toast.error(getEvaluationErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

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
              Asocia la rúbrica una sola vez, luego califica desde el listado de estudiantes.
              Los pesos de cada asignatura deben sumar 100 %.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/evaluaciones/crear"
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-5 text-center text-sm font-medium text-white hover:bg-opacity-90"
            >
              Crear evaluación
            </Link>
            <Link
              to="/teachers/rubrics/list"
              className="text-sm font-medium text-[#6366f1] hover:underline"
            >
              Rúbricas →
            </Link>
          </div>
        </div>

        {!loading && rows.length > 0 && (
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Asignatura
              </label>
              <select
                value={subjectFilter}
                onChange={(e) => handleSubjectFilterChange(e.target.value)}
                className="min-w-[220px] rounded border border-stroke bg-transparent py-2 px-3 text-sm outline-none focus:border-primary dark:border-strokedark"
              >
                <option value="all">Todas las asignaturas</option>
                {subjects.map((s) => {
                  const w = weightBySubject.get(s.id);
                  const suffix =
                    w && !w.isValid
                      ? ` (${w.total}% / 100%)`
                      : w?.isValid
                        ? ' ✓'
                        : '';
                  return (
                    <option key={s.id} value={s.id}>
                      {s.label}
                      {suffix}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Buscar
              </label>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, grupo..."
                className="min-w-[200px] rounded border border-stroke bg-transparent py-2 px-3 text-sm outline-none focus:border-primary dark:border-strokedark"
              />
            </div>
            <p className="pb-2 text-xs text-gray-500">
              {filteredRows.length} de {rows.length} evaluación(es)
            </p>
          </div>
        )}

        {activeSubjectWeight && (
          <p
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              activeSubjectWeight.isValid
                ? 'border-green-300 bg-green-50 text-green-800'
                : 'border-amber-300 bg-amber-50 text-amber-900'
            }`}
          >
            {activeSubjectWeight.isValid ? (
              <>
                Peso total de la asignatura: <strong>100 %</strong> (correcto).
              </>
            ) : activeSubjectWeight.total > 100 ? (
              <>
                Peso total: <strong>{activeSubjectWeight.total}%</strong> — supera 100 %.
                Ajusta o elimina evaluaciones.
              </>
            ) : (
              <>
                Peso total: <strong>{activeSubjectWeight.total}%</strong> — faltan{' '}
                <strong>{activeSubjectWeight.remaining}%</strong> para llegar a 100 %.
              </>
            )}
          </p>
        )}

        {subjectFinalGrades && subjectFilter !== 'all' && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stroke bg-gray-50 px-4 py-3 dark:border-strokedark dark:bg-meta-4">
            <div>
              <p className="text-sm font-medium text-black dark:text-white">
                Notas finales de la asignatura
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{subjectFinalGrades.message}</p>
            </div>
            <button
              type="button"
              disabled={!subjectFinalGrades.canRegister}
              onClick={() =>
                navigate(`/teachers/grades?subject=${encodeURIComponent(subjectFilter)}`)
              }
              className="rounded-md bg-success px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Registrar notas finales
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
              No hay evaluaciones en tus grupos asignados.
            </p>
            <Link
              to="/evaluaciones/crear"
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90"
            >
              Crear primera evaluación
            </Link>
          </div>
        ) : filteredRows.length === 0 ? (
          <p className="py-6 text-center text-gray-500">
            No hay evaluaciones con los filtros actuales.
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
                {filteredRows.map((evaluation) => {
                  const evalId = String(evaluation.id);
                  const isDeleting = deletingId === evalId;

                  return (
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
                          <span className="text-[#16a34a] text-xs font-medium">Lista</span>
                        ) : (
                          <span className="text-amber-600 text-xs">Pendiente</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center text-xs text-gray-600">
                        {evaluation.rubric_id
                          ? `${evaluation.students_graded}/${evaluation.students_total}${
                              evaluation.students_graded_sent > 0
                                ? ` (${evaluation.students_graded_sent} env.)`
                                : ''
                            }`
                          : '—'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap justify-center gap-2">
                          {!evaluation.rubric_id ? (
                            <Link
                              to={`/evaluaciones/${evalId}/asociar-rubrica`}
                              className="rounded border border-amber-400 bg-amber-50 px-2 py-1 text-xs text-amber-800 hover:bg-amber-100"
                            >
                              Asociar rúbrica
                            </Link>
                          ) : (
                            <Link
                              to={`/evaluaciones/${evalId}/estudiantes`}
                              className="rounded bg-[#6366f1] px-2 py-1 text-xs text-white hover:bg-opacity-90"
                            >
                              Calificar
                            </Link>
                          )}
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => void handleDeleteEvaluation(evaluation)}
                            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {isDeleting ? '...' : 'Eliminar'}
                          </button>
                        </div>
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
