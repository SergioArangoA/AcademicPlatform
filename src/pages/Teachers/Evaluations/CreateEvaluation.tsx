/**
 * Crear evaluación (Postman: POST /evaluation/evaluations).
 * Body: subject_id, group_id, name, description, weight (sin rubric_id).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/Breadcrumb';
import { useAuth } from '../../../context/AuthContext';
import { SubjectGroupOption } from '../../../models/Subjects/SubjectGroupOption';
import {
  evaluationService,
  getEvaluationErrorMessage,
} from '../../../services/evaluationService';
import { loadTeacherGroupOptions } from '../../../utils/teacher';
import { validateEvaluationWeightChange } from '../../../utils/evaluationWeights';

const CreateEvaluation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [groupOptions, setGroupOptions] = useState<SubjectGroupOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  const [form, setForm] = useState({
    group_id: '',
    name: '',
    description: '',
    weight: '40',
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingOptions(true);
      const options = await loadTeacherGroupOptions(user);
      if (cancelled) return;
      setGroupOptions(options);
      setLoadingOptions(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const selectedGroup = useMemo(
    () => groupOptions.find((o) => o.group_id === form.group_id),
    [groupOptions, form.group_id]
  );

  const validate = async (): Promise<boolean> => {
    if (!form.group_id || !selectedGroup?.subject_id) {
      setErrorBanner('Selecciona un grupo de tus asignaturas asignadas.');
      return false;
    }
    if (!form.name.trim()) {
      setErrorBanner('El nombre de la evaluación es obligatorio.');
      return false;
    }
    const weight = Number(form.weight);
    if (Number.isNaN(weight) || weight <= 0 || weight > 100) {
      setErrorBanner('El peso debe ser un número entre 1 y 100.');
      return false;
    }

    const subjectId = String(selectedGroup!.subject_id);
    const existing = await evaluationService.getEvaluations();
    const weightCheck = validateEvaluationWeightChange(existing, subjectId, weight);
    if (!weightCheck.allowed) {
      setErrorBanner(weightCheck.message);
      return false;
    }
    if (form.description.length > 500) {
      setErrorBanner('La descripción no puede superar 500 caracteres.');
      return false;
    }
    setErrorBanner('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await validate())) return;

    setSaving(true);
    try {
      const created = await evaluationService.createEvaluation({
        subject_id: String(selectedGroup!.subject_id),
        group_id: form.group_id,
        name: form.name.trim(),
        description: form.description.trim() || 'Sin descripción',
        weight: Number(form.weight),
      });

      toast.success('Evaluación creada. Podrás asociar la rúbrica cuando esté lista.');
      const subjectId = String(selectedGroup!.subject_id);
      navigate(`/evaluaciones?subject=${encodeURIComponent(subjectId)}`);
    } catch (err) {
      toast.error(getEvaluationErrorMessage(err));
      setErrorBanner(getEvaluationErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loadingOptions) {
    return (
      <>
        <Breadcrumb pageName="Nueva evaluación" />
        <p className="py-8 text-center text-gray-500">Cargando grupos...</p>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Nueva evaluación" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Crear evaluación
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              Al guardar volverás al listado. Asocia la rúbrica cuando la tengas publicada (CU-10).
            </p>
          </div>
          <Link
            to="/evaluaciones"
            className="text-sm font-medium text-[#6366f1] hover:underline"
          >
            ← Volver al listado
          </Link>
        </div>

        {groupOptions.length === 0 && (
          <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No tienes grupos asignados. Pide al administrador que te asigne un grupo antes de
            crear evaluaciones.
          </p>
        )}

        {errorBanner && (
          <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorBanner}
          </p>
        )}

        <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Grupo / asignatura *
            </label>
            <select
              value={form.group_id}
              onChange={(e) => setForm((f) => ({ ...f, group_id: e.target.value }))}
              className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark"
              required
              disabled={groupOptions.length === 0}
            >
              <option value="">Selecciona un grupo</option>
              {groupOptions.map((o) => (
                <option key={o.group_id} value={o.group_id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej. Parcial 1"
              className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark"
              maxLength={120}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ej. Examen parcial del primer corte"
              rows={3}
              maxLength={500}
              className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Peso (%) *
            </label>
            <input
              type="number"
              min={1}
              max={100}
              step={1}
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Todas las evaluaciones de la misma asignatura deben sumar 100 % en total.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || groupOptions.length === 0}
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear evaluación'}
            </button>
            <Link
              to="/evaluaciones"
              className="inline-flex items-center justify-center rounded-md border border-stroke py-2 px-6 font-medium hover:bg-gray-50 dark:border-strokedark"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateEvaluation;
