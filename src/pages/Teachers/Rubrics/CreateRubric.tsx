/**
 * Crear rúbrica (CU-08): título, criterios con pesos que suman 100 %, plantillas, borrador o publicar.
 * Guardo rúbrica y criterios en el API; luego puedo ir a revisión y a definir escalas.
 * Las asignaturas/grupos del select salen de loadTeacherGroupOptions.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';
import { rubricService, getRubricErrorMessage } from '../../../services/rubricService';
import { SubjectGroupOption } from '../../../models/Subjects/SubjectGroupOption';
import { resolveTeacherId, loadTeacherGroupOptions } from '../../../utils/teacher';
import RubricInfoCard from '../../../components/evaluations/RubricCard';
import RubricTemplatesModal, { LocalCriterionDraft } from '../../../components/evaluations/RubricTemplatesModal';
import { Criterion } from '../../../models/Evaluation/Criterion';

const PUBLISH_ERROR =
  'la rúbrica debe tener al menos un criterio y la suma de los pesos debe ser 100 %.';

const newCriterion = (orden: number): LocalCriterionDraft => ({
  id_temp: `crit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  name: '',
  description: '',
  weight: 0,
  orden,
});

const CreateRubric: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teacherId, setTeacherId] = useState('');

  const [subjectOptions, setSubjectOptions] = useState<SubjectGroupOption[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [savingPublish, setSavingPublish] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [savedRubricId, setSavedRubricId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  const [rubric, setRubric] = useState({
    group_id: '',
    subject_id: '',
    title: '',
    description: '',
    is_public: false,
  });
  const [criterios, setCriterios] = useState<LocalCriterionDraft[]>([]);

  const sumaTotal = useMemo(
    () => criterios.reduce((acc, c) => acc + Number(c.weight || 0), 0),
    [criterios]
  );
  const puedePublicar = criterios.length > 0 && sumaTotal === 100;

  const selectedSubjectLabel = useMemo(
    () =>
      subjectOptions.find((o) => o.group_id === rubric.group_id)?.label ??
      subjectOptions.find((o) => o.subject_id === rubric.subject_id)?.label ??
      '—',
    [subjectOptions, rubric.group_id, rubric.subject_id]
  );

  const markDirty = useCallback(() => setIsDirty(true), []);

  const updateRubric = <K extends keyof typeof rubric>(key: K, value: (typeof rubric)[K]) => {
    markDirty();
    setRubric((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingSubjects(true);
      const resolvedTeacherId = await resolveTeacherId(user);
      if (cancelled) return;

      setTeacherId(resolvedTeacherId);
      const options = await loadTeacherGroupOptions(user);
      if (cancelled) return;

      setSubjectOptions(options);
      setLoadingSubjects(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const reindexCriterios = (list: LocalCriterionDraft[]) =>
    list.map((c, i) => ({ ...c, orden: i + 1 }));

  const addCriterion = () => {
    markDirty();
    setCriterios((prev) => reindexCriterios([...prev, newCriterion(prev.length + 1)]));
  };

  const removeCriterion = (idTemp: string) => {
    markDirty();
    setCriterios((prev) => reindexCriterios(prev.filter((c) => c.id_temp !== idTemp)));
  };

  const updateCriterion = (idTemp: string, field: keyof LocalCriterionDraft, value: string | number) => {
    markDirty();
    setCriterios((prev) =>
      prev.map((c) => (c.id_temp === idTemp ? { ...c, [field]: value } : c))
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('dragIndex', index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = Number(e.dataTransfer.getData('dragIndex'));
    if (Number.isNaN(dragIndex) || dragIndex === dropIndex) return;
    markDirty();
    setCriterios((prev) => {
      const updated = [...prev];
      const [dragged] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, dragged);
      return reindexCriterios(updated);
    });
  };

  const applyTemplate = (cloned: LocalCriterionDraft[]) => {
    markDirty();
    setCriterios(reindexCriterios(cloned));
    toast.success('Criterios copiados desde la plantilla.');
  };

  const validateBaseFields = (): boolean => {
    if (!rubric.group_id || !rubric.subject_id || !rubric.title.trim()) {
      setErrorBanner('Selecciona un grupo asignado y completa el título de la rúbrica.');
      return false;
    }
    if (rubric.description.length > 500) {
      setErrorBanner('La descripción no puede superar 500 caracteres.');
      return false;
    }
    return true;
  };

  const buildCriteriaPayload = () =>
    criterios.map((c) => ({
      name: c.name.trim(),
      description: c.description.trim(),
      weight: Number(c.weight || 0),
    }));

  const saveRubric = async (asPublic: boolean) => {
    setErrorBanner('');

    if (!validateBaseFields()) return;
    if (!teacherId) {
      toast.error('No se pudo identificar al docente autenticado.');
      return;
    }

    if (asPublic && (criterios.length === 0 || sumaTotal !== 100)) {
      setErrorBanner(PUBLISH_ERROR);
      return;
    }

    const setLoading = asPublic ? setSavingPublish : setSavingDraft;
    setLoading(true);

    try {
      const saved = await rubricService.saveRubricWithCriteria(
        {
          title: rubric.title.trim(),
          description: rubric.description.trim(),
          is_public: false,
          is_archived: false,
        },
        buildCriteriaPayload()
      );

      setSavedRubricId(String(saved.id));
      setIsDirty(false);

      if (saved.id) {
        localStorage.setItem(`rubric_meta_${saved.id}_subject`, selectedSubjectLabel);
        const groupLabel =
          subjectOptions.find((o) => o.group_id === rubric.group_id)?.groupName ?? rubric.group_id;
        localStorage.setItem(`rubric_meta_${saved.id}_group`, groupLabel);
      }

      if (asPublic) {
        toast.success('Criterios guardados. Continúa con las escalas (CU-09).');
        navigate(`/teachers/rubrics/${saved.id}/escalas`);
      } else {
        toast.success('Rúbrica guardada como borrador.');
      }
    } catch (err) {
      toast.error(getRubricErrorMessage(err));
      if (asPublic) setErrorBanner(PUBLISH_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (isDirty) {
      const result = await Swal.fire({
        title: '¿Descartar cambios?',
        text: 'Tienes cambios sin guardar en esta rúbrica.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Seguir editando',
      });
      if (!result.isConfirmed) return;
    }
    navigate('/teachers/rubrics/list');
  };

  const weightHint = () => {
    if (sumaTotal === 100) return null;
    const diff = 100 - sumaTotal;
    if (diff > 0) return `Faltan ${diff} % para llegar a 100 %.`;
    return `Sobran ${Math.abs(diff)} % para llegar a 100 %.`;
  };

  const criteriaForCard: Criterion[] = criterios.map((c) => ({
    name: c.name,
    description: c.description,
    weight: Number(c.weight || 0),
    rubric_id: '',
  }));

  return (
    <div className="font-sans bg-[#F8F9FA] min-h-screen pb-20 dark:bg-boxdark-2">
      <div className="flex justify-between items-start mb-6 pt-4 px-2">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827] dark:text-white">Crear rúbrica de evaluación</h1>
          <p className="text-[13px] text-[#6B7280] mt-1 dark:text-gray-400">
            Diseña los criterios y asigna los pesos porcentuales para tu rúbrica.
          </p>
        </div>
        <div className="text-[12px] text-[#6B7280]">
          <span className="text-[#9CA3AF] cursor-pointer hover:underline">Inicio</span> &gt;{' '}
          <Link to="/teachers/rubrics/list" className="text-[#9CA3AF] hover:underline">
            Rúbricas
          </Link>{' '}
          &gt; <span className="font-medium text-[#374151] dark:text-gray-300">Crear rúbrica</span>
        </div>
      </div>

      <div className="flex items-center justify-center mb-8 px-4 w-full">
        <WizardStepper />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 mt-12 px-2 items-start">
        <div className="w-full min-w-0">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 mb-6 dark:bg-boxdark dark:border-strokedark">
            <h2 className="text-[18px] font-bold text-[#111827] mb-5 dark:text-white">Información de la rúbrica</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5 dark:text-gray-300">
                    Asignatura <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={rubric.group_id}
                      onChange={(e) => {
                        const option = subjectOptions.find((o) => o.group_id === e.target.value);
                        markDirty();
                        setRubric((prev) => ({
                          ...prev,
                          group_id: e.target.value,
                          subject_id: option?.subject_id ?? '',
                        }));
                      }}
                      disabled={loadingSubjects}
                      className="w-full h-10 px-3 text-[14px] text-[#111827] bg-white border border-[#D1D5DB] rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#6D28D9] focus:border-[#6D28D9] dark:bg-form-input dark:border-form-strokedark dark:text-white disabled:opacity-60"
                    >
                      <option value="" disabled>
                        {loadingSubjects
                          ? 'Cargando grupos asignados...'
                          : subjectOptions.length === 0
                            ? 'No tienes grupos asignados'
                            : 'Seleccione una asignatura...'}
                      </option>
                      {subjectOptions.map((opt) => (
                        <option key={opt.group_id} value={opt.group_id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7280]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5 dark:text-gray-300">
                    Título <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={rubric.title}
                    onChange={(e) => updateRubric('title', e.target.value)}
                    placeholder="Ej. Rúbrica para Proyecto de Programación"
                    className="w-full h-10 px-3 text-[14px] text-[#111827] bg-white border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#6D28D9] focus:border-[#6D28D9] dark:bg-form-input dark:border-form-strokedark dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5 dark:text-gray-300">
                    Estado de la rúbrica
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-[20px] text-[13px] whitespace-nowrap border ${
                      rubric.is_public
                        ? 'text-[#065F46] bg-[#D1FAE5] border-[#6EE7B7]'
                        : 'text-[#374151] bg-[#F3F4F6] border-[#D1D5DB] dark:bg-meta-4 dark:text-white dark:border-strokedark'
                    }`}
                  >
                    {rubric.is_public ? 'Publicada' : 'Borrador (no publicada)'}
                  </span>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5 dark:text-gray-300">
                    Descripción
                  </label>
                  <div className="relative">
                    <textarea
                      value={rubric.description}
                      onChange={(e) => updateRubric('description', e.target.value.slice(0, 500))}
                      maxLength={500}
                      placeholder="Describe el propósito de esta rúbrica..."
                      className="w-full h-[90px] px-3 py-2 text-[14px] text-[#111827] bg-white border border-[#D1D5DB] rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-[#6D28D9] focus:border-[#6D28D9] dark:bg-form-input dark:border-form-strokedark dark:text-white"
                    />
                    <div className="absolute bottom-2 right-2 text-[11px] text-[#9CA3AF]">
                      {rubric.description.length}/500
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 dark:bg-boxdark dark:border-strokedark">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
              <div>
                <h2 className="text-[18px] font-bold text-[#111827] dark:text-white">Criterios de evaluación</h2>
                <p className="text-[13px] text-[#6B7280] mt-1 dark:text-gray-400">
                  Agrega los criterios que utilizarás para evaluar. La suma de los pesos debe ser exactamente 100 %.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTemplatesOpen(true)}
                  disabled={!teacherId}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1D5DB] rounded-md text-[14px] font-medium text-[#374151] hover:bg-gray-50 disabled:opacity-50 dark:bg-meta-4 dark:text-white dark:border-strokedark"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  <span>Plantillas de rúbricas</span>
                </button>
                <button
                  type="button"
                  onClick={addCriterion}
                  className="flex items-center gap-2 px-4 py-2 bg-[#6D28D9] rounded-md text-[14px] font-semibold text-white hover:bg-[#5B21B6] transition-colors"
                >
                  <span>+</span> Agregar criterio
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left" role="table">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[12px] text-[#6B7280] uppercase tracking-[0.05em] dark:bg-meta-4 dark:border-strokedark">
                    <th className="py-3 px-2 w-6" />
                    <th className="py-3 px-2 w-10 text-center">#</th>
                    <th className="py-3 px-3">Nombre del criterio</th>
                    <th className="py-3 px-3">Descripción</th>
                    <th className="py-3 px-3 w-30">Peso (%)</th>
                    <th className="py-3 px-2 w-20 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {criterios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[13px] text-[#9CA3AF]">
                        No hay criterios. Agrega uno o usa una plantilla.
                      </td>
                    </tr>
                  ) : (
                    criterios.map((crit, idx) => (
                      <tr
                        key={crit.id_temp}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, idx)}
                        className="border-b border-[#F3F4F6] bg-white h-14 hover:bg-gray-50 transition-colors dark:bg-boxdark dark:border-strokedark dark:hover:bg-meta-4"
                      >
                        <td className="py-2 px-2 cursor-grab text-[#D1D5DB] hover:text-[#9CA3AF] text-center">⋮⋮</td>
                        <td className="py-2 px-2 text-center text-[13px] text-[#6B7280] font-medium">{crit.orden}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={crit.name}
                            onChange={(e) => updateCriterion(crit.id_temp, 'name', e.target.value)}
                            placeholder="Nombre"
                            className="w-full text-[13px] text-[#111827] bg-transparent border-none focus:ring-0 p-1 dark:text-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={crit.description}
                            onChange={(e) => updateCriterion(crit.id_temp, 'description', e.target.value)}
                            placeholder="Descripción del criterio..."
                            className="w-full text-[13px] text-[#374151] bg-transparent border-none focus:ring-0 p-1 dark:text-gray-300"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center border border-[#D1D5DB] rounded-md overflow-hidden w-20 bg-white focus-within:ring-1 focus-within:ring-[#6D28D9] dark:bg-form-input dark:border-form-strokedark">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={crit.weight || ''}
                              onChange={(e) =>
                                updateCriterion(crit.id_temp, 'weight', Number(e.target.value))
                              }
                              className="w-[50px] px-2 py-1.5 text-[14px] text-center text-[#111827] border-none focus:outline-none dark:bg-transparent dark:text-white"
                            />
                            <span className="text-[13px] text-[#6B7280] pr-2">%</span>
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeCriterion(crit.id_temp)}
                              className="text-[#EF4444] hover:text-[#B91C1C] transition-colors"
                              title="Eliminar"
                              aria-label="Eliminar"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#F3F4F6] dark:border-strokedark">
              <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <span>Arrastra los criterios para cambiar el orden de evaluación.</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-bold text-[#374151] dark:text-gray-300">Suma total de pesos</span>
                  <span className={`text-[28px] font-bold ${sumaTotal === 100 ? 'text-[#16A34A]' : 'text-[#EF4444]'}`}>
                    {sumaTotal} %
                  </span>
                </div>
                {sumaTotal === 100 ? (
                  <div className="text-[13px] text-[#16A34A] flex items-center gap-1 mt-1">
                    <span>✓</span>
                    <span>La suma de los pesos es correcta.</span>
                  </div>
                ) : (
                  weightHint() && (
                    <div className="text-[13px] text-[#EF4444] flex items-center gap-1 mt-1">
                      {weightHint()}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {errorBanner && (
            <div className="mt-6 bg-[#FEF2F2] border border-[#FECACA] rounded-md p-3 flex items-start gap-3">
              <span className="text-[#EF4444]">⚠</span>
              <div>
                <span className="text-[13px] font-bold text-[#EF4444]">No se puede publicar: </span>
                <span className="text-[13px] text-[#991B1B]">{errorBanner}</span>
              </div>
            </div>
          )}
        </div>

        <div className="w-full xl:w-[300px] flex flex-col gap-4">
          <RubricInfoCard
            title="Resumen de la rúbrica"
            rubric={{
              title: rubric.title,
              description: rubric.description,
              is_public: rubric.is_public,
              subject_id: rubric.subject_id,
            }}
            criteria={criteriaForCard}
            subjectLabel={selectedSubjectLabel}
          />

          <div
            className={`rounded-lg p-4 transition-colors ${
              puedePublicar && rubric.title.trim()
                ? 'bg-[#F0FDF4] border border-[#D1FAE5]'
                : 'bg-white border border-[#E5E7EB] opacity-60 dark:bg-boxdark dark:border-strokedark'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`flex items-center justify-center w-5 h-5 rounded-full text-white text-[11px] ${
                  puedePublicar ? 'bg-[#10B981]' : 'bg-[#9CA3AF]'
                }`}
              >
                ✓
              </div>
              <h4
                className={`text-[14px] font-bold ${
                  puedePublicar ? 'text-[#065F46]' : 'text-[#6B7280] dark:text-gray-300'
                }`}
              >
                Listo para publicar
              </h4>
            </div>
            <p
              className={`text-[13px] mt-2 ${
                puedePublicar ? 'text-[#065F46]' : 'text-[#6B7280] dark:text-gray-400'
              }`}
            >
              {puedePublicar
                ? 'Puedes publicar esta rúbrica cuando lo desees.'
                : 'Agrega criterios y completa el 100 % de pesos para publicar.'}
            </p>
          </div>

          <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-4 dark:bg-meta-4 dark:border-strokedark">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#F59E0B]">💡</span>
              <h4 className="text-[14px] font-bold text-[#374151] dark:text-gray-200">Incluye CU-09</h4>
            </div>
            <p className="text-[13px] text-[#6B7280] mb-3 dark:text-gray-400">
              Después de crear los criterios, puedes definir las escalas de evaluación para cada criterio.
            </p>
            {savedRubricId ? (
              <Link
                to={`/teachers/rubrics/${savedRubricId}/escalas`}
                className="inline-block text-[13px] font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors dark:bg-boxdark dark:text-white dark:border-strokedark"
              >
                Definir escalas (CU-09) →
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="text-[13px] font-medium text-[#9CA3AF] bg-white border border-[#E5E7EB] rounded-md px-3 py-1.5 cursor-not-allowed dark:bg-boxdark dark:border-strokedark"
              >
                Definir escalas (CU-09) →
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-[290px] bg-white border-t border-[#E5E7EB] h-[60px] px-6 flex items-center justify-between z-40 dark:bg-boxdark dark:border-strokedark">
        <button
          type="button"
          onClick={handleCancel}
          className="text-[14px] font-medium text-[#374151] px-5 py-2.5 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-300 dark:hover:bg-meta-4"
        >
          Cancelar
        </button>
        <div className="flex gap-4">
          <button
            type="button"
            disabled={savingDraft || savingPublish}
            onClick={() => saveRubric(false)}
            className="flex items-center gap-2 text-[14px] font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-md px-5 py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:bg-meta-4 dark:text-white dark:border-strokedark"
          >
            {savingDraft ? 'Guardando...' : 'Guardar como borrador'}
          </button>
          <button
            type="button"
            disabled={!puedePublicar || savingDraft || savingPublish}
            onClick={() => saveRubric(true)}
            className={`flex items-center gap-2 text-[14px] font-semibold rounded-md px-5 py-2.5 transition-colors disabled:opacity-50 ${
              puedePublicar
                ? 'text-white bg-[#6D28D9] hover:bg-[#5B21B6]'
                : 'text-[#9CA3AF] bg-[#E5E7EB] cursor-not-allowed'
            }`}
          >
            {savingPublish ? 'Procesando...' : 'Guardar y definir escalas →'}
          </button>
        </div>
      </div>

      <RubricTemplatesModal
        open={templatesOpen}
        teacherId={teacherId}
        onClose={() => setTemplatesOpen(false)}
        onApply={applyTemplate}
      />
    </div>
  );
};

const WizardStepper: React.FC = () => (
  <div className="flex items-center">
    <WizardStep n={1} active label="Información de la rúbrica" />
    <WizardDivider />
    <WizardStep n={2} active label="Criterios" />
    <WizardDivider />
    <WizardStep n={3} label="Revisión" />
    <WizardDivider />
    <WizardStep n={4} label="Publicar o guardar" />
  </div>
);

const WizardStep: React.FC<{ n: number; active?: boolean; label: string }> = ({
  n,
  active,
  label,
}) => (
  <div className="flex flex-col items-center relative">
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm z-10 ${
        active ? 'bg-[#6D28D9] text-white' : 'border border-[#D1D5DB] bg-white text-[#9CA3AF]'
      }`}
    >
      {n}
    </div>
    <span
      className={`text-[13px] absolute top-8 whitespace-nowrap ${
        active ? 'font-semibold text-[#6D28D9]' : 'text-[#9CA3AF]'
      }`}
    >
      {label}
    </span>
  </div>
);
const WizardDivider: React.FC = () => (
  <div className="w-16 sm:w-24 md:w-32 border-t border-[#D1D5DB]" />
);

export default CreateRubric;
