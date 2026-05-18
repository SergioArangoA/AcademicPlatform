/**
 * Definir escalas por criterio de una rúbrica: niveles (nombre, descripción, valor)
 * para poder calificar estudiantes con la rúbrica en el flujo de evaluaciones.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Criterion } from '../../../models/Evaluation/Criterion';
import { Scale } from '../../../models/Evaluation/Scale';
import { Rubric } from '../../../models/Evaluation/Rubric';
import { criterionService } from '../../../services/criterionService';
import { rubricService, getRubricErrorMessage } from '../../../services/rubricService';
import { scaleService, getScaleErrorMessage } from '../../../services/scaleService';
import { scalesByCriterion, validateScalesForPublish } from '../../../utils/rubricScoring';

const emptyScaleForm = () => ({
  name: '',
  description: '',
  value: '',
});

const RulesList = () => (
  <ul className="mt-3 space-y-2 text-[13px] text-[#374151] dark:text-gray-300">
    {[
      'Cada criterio debe tener entre 2 y 5 niveles de escala.',
      'El valor de cada nivel debe ser único dentro del mismo criterio.',
      'Para publicar la rúbrica, todos los criterios deben tener al menos 2 niveles definidos.',
      'Los valores pueden ser numéricos enteros o decimales (ej. 0, 25, 50, 75, 100).',
    ].map((text) => (
      <li key={text} className="flex items-start gap-2">
        <span className="text-[#16A34A] shrink-0">✓</span>
        <span>{text}</span>
      </li>
    ))}
  </ul>
);

const DefineScales: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [activeCriterionId, setActiveCriterionId] = useState('');
  const [scaleForm, setScaleForm] = useState(emptyScaleForm);
  const [cloneFromCriterionId, setCloneFromCriterionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showReusePanel, setShowReusePanel] = useState(false);
  const [dragScaleIndex, setDragScaleIndex] = useState<number | null>(null);
  const scaleNameInputRef = useRef<HTMLInputElement>(null);

  const focusAddScaleRow = () => {
    document.getElementById('scale-add-row')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => scaleNameInputRef.current?.focus(), 300);
  };

  const loadAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [rubricData, criteriaData, scalesData] = await Promise.all([
        rubricService.getRubricById(id),
        criterionService.getCriteriaByRubricId(id),
        scaleService.getScales(),
      ]);
      setRubric(rubricData);
      const sortedCriteria = criteriaData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setCriteria(sortedCriteria);
      const criterionIds = sortedCriteria.map((c) => String(c.id));
      setScales(
        scalesData.filter((s) => criterionIds.includes(String(s.criterion_id)))
      );
      setActiveCriterionId((prev) => {
        if (prev && sortedCriteria.some((c) => String(c.id) === prev)) return prev;
        return sortedCriteria[0]?.id ? String(sortedCriteria[0].id) : '';
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const activeCriterion = criteria.find((c) => String(c.id) === activeCriterionId);
  const activeScales = useMemo(
    () => scalesByCriterion(scales, activeCriterionId).sort((a, b) => a.value - b.value),
    [scales, activeCriterionId]
  );

  const publishCheck = useMemo(
    () => validateScalesForPublish(criteria, scales),
    [criteria, scales]
  );

  const totalWeight = useMemo(
    () => criteria.reduce((acc, c) => acc + Number(c.weight ?? 0), 0),
    [criteria]
  );

  const criteriaWithScalesCount = useMemo(
    () =>
      criteria.filter((c) => scalesByCriterion(scales, String(c.id)).length >= 2).length,
    [criteria, scales]
  );

  const progressPercent = criteria.length
    ? Math.round((criteriaWithScalesCount / criteria.length) * 100)
    : 0;

  const allCriteriaReady = criteria.length > 0 && criteriaWithScalesCount === criteria.length;

  const firstIncompleteCriterion = useMemo(() => {
    return criteria.find((c) => scalesByCriterion(scales, String(c.id)).length < 2);
  }, [criteria, scales]);

  const metaSubject =
    (rubric?.subject_id && String(rubric.subject_id)) ||
    (id ? localStorage.getItem(`rubric_meta_${id}_subject`) : null) ||
    '—';
  const metaGroup =
    (id ? localStorage.getItem(`rubric_meta_${id}_group`) : null) || '—';

  const handleAddScale = async () => {
    if (!activeCriterionId) return;
    const value = Number(scaleForm.value);
    if (!scaleForm.name.trim()) {
      toast.error('Ingresa el nombre de la escala.');
      return;
    }
    if (Number.isNaN(value)) {
      toast.error('Ingresa un valor numérico.');
      return;
    }
    if (activeScales.some((s) => s.value === value)) {
      toast.error('E1: Ya existe una escala con ese valor en este criterio.');
      return;
    }
    if (activeScales.length >= 5) {
      toast.error('Máximo 5 escalas por criterio.');
      return;
    }

    setSaving(true);
    try {
      const created = await scaleService.createScale({
        criterion_id: activeCriterionId,
        name: scaleForm.name.trim(),
        description: scaleForm.description.trim(),
        value,
      });
      setScales((prev) => [...prev, created]);
      setScaleForm(emptyScaleForm());
      toast.success('Escala agregada.');
    } catch (err) {
      toast.error(getScaleErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScale = async (scaleId: string) => {
    if (!window.confirm('¿Eliminar esta escala?')) return;
    try {
      await scaleService.deleteScale(scaleId);
      setScales((prev) => prev.filter((s) => String(s.id) !== String(scaleId)));
      toast.success('Escala eliminada.');
    } catch (err) {
      toast.error(getScaleErrorMessage(err));
    }
  };

  const handleCloneScales = async () => {
    if (!cloneFromCriterionId || !activeCriterionId) return;
    if (cloneFromCriterionId === activeCriterionId) {
      toast.error('Selecciona un criterio distinto para clonar.');
      return;
    }
    setSaving(true);
    try {
      const created = await scaleService.cloneScalesToCriterion(
        cloneFromCriterionId,
        activeCriterionId
      );
      setScales((prev) => {
        const withoutTarget = prev.filter(
          (s) => String(s.criterion_id) !== String(activeCriterionId)
        );
        return [...withoutTarget, ...created];
      });
      setShowReusePanel(false);
      setCloneFromCriterionId('');
      toast.success('Escalas clonadas al criterio actual.');
    } catch (err) {
      toast.error(getScaleErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    if (!publishCheck.ready) {
      toast.error(publishCheck.issues[0] ?? 'Completa las escalas antes de publicar.');
      return;
    }
    setPublishing(true);
    try {
      await rubricService.publishRubric(id);
      toast.success('Rúbrica publicada (es_publica = true).');
      navigate('/teachers/rubrics/list');
    } catch (err) {
      toast.error(getRubricErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  const handleScaleDragStart = (index: number) => setDragScaleIndex(index);

  const handleScaleDrop = (dropIndex: number) => {
    if (dragScaleIndex === null || dragScaleIndex === dropIndex || !activeCriterionId) return;
    const criterionScales = scalesByCriterion(scales, activeCriterionId);
    const otherScales = scales.filter((s) => String(s.criterion_id) !== activeCriterionId);
    const reordered = [...criterionScales];
    const [moved] = reordered.splice(dragScaleIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setScales([...otherScales, ...reordered]);
    setDragScaleIndex(null);
  };

  const handleCancel = () => navigate('/teachers/rubrics/list');

  const handleSaveChanges = () => {
    toast.success('Los cambios de escalas se guardan al agregar o eliminar cada nivel.');
  };

  const handleContinueToReview = () => {
    if (!allCriteriaReady) {
      toast.error('Todos los criterios deben tener al menos 2 niveles definidos.');
      return;
    }
    navigate(`/teachers/rubrics/${id}/revision`);
  };

  if (loading) {
    return (
      <div className="px-6 py-8 font-sans">
        <p className="text-[#6B7280]">Cargando...</p>
      </div>
    );
  }

  if (!rubric) {
    return (
      <div className="px-6 py-8 font-sans">
        <p className="text-[#DC2626]">Rúbrica no encontrada.</p>
        <Link to="/teachers/rubrics/list" className="text-[#6366F1] text-sm mt-2 inline-block hover:underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  const activeScaleCount = activeScales.length;
  const activeCriterionValid = activeScaleCount >= 2;

  return (
    <div className="font-sans bg-[#F8F9FA] min-h-screen pb-28 dark:bg-boxdark-2">
      {/* Header */}
      <div className="px-6 pt-4">
        <h1 className="text-[24px] font-semibold text-[#111827] dark:text-white">
          Definir criterios y escalas
        </h1>
        <p className="text-[14px] text-[#6B7280] mt-1 dark:text-gray-400">
          Define los niveles de desempeño (escalas) para cada criterio de la rúbrica.
        </p>
        <nav className="text-[12px] text-[#9CA3AF] mt-3 flex flex-wrap items-center gap-1">
          <Link to="/" className="hover:text-[#6366F1]">
            Inicio
          </Link>
          <span>&gt;</span>
          <Link to="/teachers/rubrics/list" className="hover:text-[#6366F1]">
            Rúbricas
          </Link>
          <span>&gt;</span>
          <span className="text-[#374151] dark:text-gray-300">{rubric.title}</span>
          <span>&gt;</span>
          <span className="font-medium text-[#6366F1]">Definir escalas</span>
        </nav>
      </div>

      {/* Summary bar */}
      <div className="mx-6 mt-6 bg-white border border-[#E5E7EB] border-b-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.08)] px-5 py-4 dark:bg-boxdark dark:border-strokedark">
        <div className="flex flex-wrap items-center gap-6 lg:gap-10">
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-10 h-10 rounded-lg bg-[#EDE9FE] flex items-center justify-center text-[#6366F1]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h2.25A2.25 2.25 0 0 1 11.25 6.75v2.25A2.25 2.25 0 0 1 9 11.25H6.75A2.25 2.25 0 0 1 4.5 9V6.75ZM13.5 6.75A2.25 2.25 0 0 1 15.75 4.5h2.25A2.25 2.25 0 0 1 20.25 6.75v2.25A2.25 2.25 0 0 1 18 11.25h-2.25A2.25 2.25 0 0 1 13.5 9V6.75ZM4.5 15.75A2.25 2.25 0 0 1 6.75 13.5H9a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18v-2.25ZM13.5 15.75A2.25 2.25 0 0 1 15.75 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[#111827] dark:text-white">{rubric.title}</p>
              <span className="inline-block mt-1 text-[12px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB] dark:bg-meta-4 dark:text-gray-300">
                {rubric.is_public ? 'Publicada' : 'Borrador (no publicada)'}
              </span>
            </div>
          </div>
          <SummaryItem label="Asignatura" value={metaSubject} />
          <SummaryItem label="Grupo" value={metaGroup} />
          <SummaryItem label="Criterios" value={String(criteria.length)} />
          <SummaryItem
            label="Suma de pesos"
            value={`${totalWeight} %`}
            valueClassName={totalWeight === 100 ? 'text-[#16A34A] font-bold' : 'text-[#DC2626] font-bold'}
          />
        </div>
      </div>

      {/* 3 columns */}
      <div className="px-6 mt-6 flex flex-col xl:flex-row gap-5 items-start">
        {/* LEFT — criteria list */}
        <aside className="w-full xl:w-[280px] shrink-0 flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold text-[#111827] dark:text-white">
            Criterios de la rúbrica
          </h2>
          <div className="flex flex-col gap-2">
            {criteria.map((c, idx) => {
              const count = scalesByCriterion(scales, String(c.id)).length;
              const isActive = String(c.id) === activeCriterionId;
              const ok = count >= 2;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveCriterionId(String(c.id));
                    setScaleForm(emptyScaleForm());
                    setShowReusePanel(false);
                  }}
                  className={`w-full text-left rounded-lg border bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-colors dark:bg-boxdark ${
                    isActive
                      ? 'border-[#6366F1] border-l-[3px] bg-[#F5F3FF] dark:border-primary dark:bg-primary/10'
                      : 'border-[#E5E7EB] hover:border-[#C7D2FE] dark:border-strokedark'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-bold text-[14px] text-[#111827] dark:text-white">
                      {idx + 1}. {c.name}
                    </span>
                    <span className="text-[13px] font-semibold text-[#6366F1] shrink-0">
                      {c.weight} %
                    </span>
                  </div>
                  {c.description && (
                    <p className="text-[13px] text-[#6B7280] line-clamp-2 dark:text-gray-400">
                      {c.description}
                    </p>
                  )}
                  <p
                    className={`text-[12px] mt-2 flex items-center gap-1 ${
                      ok ? 'text-[#16A34A]' : 'text-[#D97706]'
                    }`}
                  >
                    <span>{ok ? '✓' : '⚠'}</span>
                    {count} {count === 1 ? 'nivel definido' : 'niveles definidos'}
                  </p>
                </button>
              );
            })}
          </div>
          <Link
            to={`/teachers/rubrics/${id}/revision`}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg border border-[#D1D5DB] bg-white py-2.5 text-[14px] font-medium text-[#374151] hover:bg-[#F9FAFB] dark:bg-boxdark dark:border-strokedark dark:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Vista general de la rúbrica
          </Link>
        </aside>

        {/* CENTER — scales */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
            <p className="flex-1 text-[13px] text-[#1E40AF] flex items-start gap-2">
              <span className="shrink-0">ℹ</span>
              <span>
                Selecciona un criterio para definir sus niveles de desempeño. Cada criterio debe
                tener entre 2 y 5 niveles de escala.
              </span>
            </p>
            <button
              type="button"
              onClick={() => setShowReusePanel((v) => !v)}
              className="shrink-0 rounded-lg border border-[#93C5FD] bg-white px-3 py-1.5 text-[13px] font-medium text-[#1D4ED8] hover:bg-[#DBEAFE]"
            >
              ⇄ Reutilizar escala existente
            </button>
          </div>

          {showReusePanel && activeCriterion && (
            <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4">
              <p className="text-[13px] font-semibold text-[#92400E] mb-2">
                Clonar niveles desde otro criterio
              </p>
              <div className="flex flex-wrap gap-2 items-end">
                <select
                  value={cloneFromCriterionId}
                  onChange={(e) => setCloneFromCriterionId(e.target.value)}
                  className="rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm min-w-[180px]"
                >
                  <option value="">Seleccionar criterio origen...</option>
                  {criteria
                    .filter((c) => String(c.id) !== activeCriterionId)
                    .map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={!cloneFromCriterionId || saving}
                  onClick={handleCloneScales}
                  className="rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Clonar al criterio actual
                </button>
              </div>
            </div>
          )}

          {activeCriterion ? (
            <>
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                  <h3 className="text-[18px] font-bold text-[#111827] dark:text-white">
                    Definir escalas para: {activeCriterion.name}
                  </h3>
                  <p className="text-[14px] text-[#6B7280] mt-1 dark:text-gray-400">
                    {activeCriterion.description || 'Sin descripción'}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#EDE9FE] px-3 py-1 text-[13px] font-semibold text-[#5B21B6]">
                  Peso del criterio: {activeCriterion.weight} %
                </span>
              </div>

              <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-boxdark dark:border-strokedark">
                <div className="flex flex-wrap justify-between items-center gap-3 px-4 pt-4 pb-2 border-b border-[#F3F4F6] dark:border-strokedark">
                  <div>
                    <h4 className="font-semibold text-[#111827] dark:text-white">
                      Niveles de desempeño
                    </h4>
                    <p className="text-[13px] text-[#6B7280]">Agrega entre 2 y 5 niveles de escala.</p>
                  </div>
                  <button
                    type="button"
                    disabled={saving || activeScales.length >= 5}
                    onClick={focusAddScaleRow}
                    className="rounded-lg bg-[#6366F1] px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#4F46E5] disabled:opacity-50"
                  >
                    + Agregar nivel
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-[#F9FAFB] text-[#6B7280] text-left uppercase text-[11px] tracking-wide dark:bg-meta-4">
                        <th className="w-8 py-3 px-2" />
                        <th className="py-3 px-2 w-12">Nivel</th>
                        <th className="py-3 px-3 min-w-[140px]">Nombre (etiqueta)</th>
                        <th className="py-3 px-3">Descripción</th>
                        <th className="py-3 px-3 w-24 text-right">Valor</th>
                        <th className="py-3 px-3 w-20 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeScales.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-3 px-4 text-center text-[13px] text-[#9CA3AF] bg-[#FAFAFA] dark:bg-meta-4/20">
                            Aún no hay niveles guardados. Completa la fila siguiente y pulsa
                            &quot;Guardar&quot;.
                          </td>
                        </tr>
                      )}

                      {activeScales.map((scale, index) => (
                          <tr
                            key={scale.id}
                            draggable
                            onDragStart={() => handleScaleDragStart(index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleScaleDrop(index)}
                            className="border-t border-[#F3F4F6] dark:border-strokedark"
                          >
                            <td className="py-2 px-2 text-[#9CA3AF] cursor-grab text-center select-none">
                              ⠿
                            </td>
                            <td className="py-2 px-2 text-center font-medium text-[#6B7280]">
                              {index + 1}
                            </td>
                            <td className="py-2 px-3">
                              <span className="block w-full max-w-[160px] px-2 py-1.5 rounded border border-transparent bg-[#F9FAFB] text-[#111827] dark:bg-meta-4 dark:text-white">
                                {scale.name}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className="block text-[#374151] dark:text-gray-300">
                                {scale.description || '—'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-[#111827] dark:text-white">
                              {scale.value}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  title="Editar en fila de agregar"
                                  onClick={() => {
                                    setScaleForm({
                                      name: scale.name,
                                      description: scale.description ?? '',
                                      value: String(scale.value),
                                    });
                                    focusAddScaleRow();
                                  }}
                                  className="p-1.5 text-[#6B7280] hover:text-[#6366F1]"
                                >
                                  <PencilIcon />
                                </button>
                                <button
                                  type="button"
                                  title="Eliminar"
                                  onClick={() => scale.id && handleDeleteScale(String(scale.id))}
                                  className="p-1.5 text-[#6B7280] hover:text-[#DC2626]"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {activeScales.length < 5 && (
                        <tr id="scale-add-row" className="border-t-2 border-[#6366F1]/30 bg-[#FAFAFA] dark:bg-meta-4/30">
                          <td className="py-3 px-2" />
                          <td className="py-3 px-2 text-center font-semibold text-[#6366F1]">
                            {activeScales.length + 1}
                          </td>
                          <td className="py-3 px-3">
                            <input
                              ref={scaleNameInputRef}
                              type="text"
                              placeholder="Ej. Excelente"
                              value={scaleForm.name}
                              onChange={(e) =>
                                setScaleForm((f) => ({ ...f, name: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') void handleAddScale();
                              }}
                              className="w-full min-w-[140px] max-w-[200px] rounded-lg border border-[#D1D5DB] px-2 py-1.5 text-sm dark:bg-form-input dark:border-strokedark"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <textarea
                              rows={2}
                              placeholder="Descripción del nivel..."
                              value={scaleForm.description}
                              onChange={(e) =>
                                setScaleForm((f) => ({ ...f, description: e.target.value }))
                              }
                              className="w-full min-w-[180px] rounded-lg border border-[#D1D5DB] px-2 py-1.5 text-sm resize-none dark:bg-form-input dark:border-strokedark"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="100"
                              value={scaleForm.value}
                              onChange={(e) =>
                                setScaleForm((f) => ({ ...f, value: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') void handleAddScale();
                              }}
                              className="w-full min-w-[72px] rounded-lg border border-[#D1D5DB] px-2 py-1.5 text-sm text-right dark:bg-form-input dark:border-strokedark"
                            />
                          </td>
                          <td className="py-3 px-3 text-center align-middle">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void handleAddScale()}
                              className="rounded-md bg-[#6366F1] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#4F46E5] disabled:opacity-50"
                            >
                              Guardar
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col lg:flex-row gap-3 p-4 border-t border-[#F3F4F6] dark:border-strokedark">
                  <div className="flex-1 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2.5 text-[12px] text-[#1E40AF]">
                    <p className="flex items-start gap-1.5">
                      <span>ℹ</span>
                      <span>
                        El valor debe ser único dentro del mismo criterio.
                        <br />
                        Puedes arrastrar los niveles para cambiar su orden.
                      </span>
                    </p>
                  </div>
                  <div className="lg:w-[280px] rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 dark:border-strokedark dark:bg-meta-4">
                    <p className="font-semibold text-[#111827] text-[13px] dark:text-white">
                      Validación del criterio
                    </p>
                    <p
                      className={`text-[12px] mt-1 flex items-center gap-1 ${
                        activeCriterionValid ? 'text-[#16A34A]' : 'text-[#D97706]'
                      }`}
                    >
                      <span>{activeCriterionValid ? '✓' : '⚠'}</span>
                      {activeScaleCount} niveles definidos (mínimo requerido: 2)
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-[#6B7280] text-center py-8">Selecciona un criterio de la lista.</p>
          )}
        </main>

        {/* RIGHT — sidebar */}
        <aside className="w-full xl:w-[260px] shrink-0 space-y-4">
          <SideCard title="Resumen de la rúbrica">
            <SideRow
              label="Estado"
              value={
                <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#5B21B6]">
                  {rubric.is_public ? 'Publicada' : 'Borrador (no publicada)'}
                </span>
              }
            />
            <SideRow label="Criterios" value={String(criteria.length)} />
            <SideRow
              label="Suma de pesos"
              value={`${totalWeight} %`}
              valueClassName={totalWeight === 100 ? 'text-[#16A34A] font-bold' : 'text-[#DC2626] font-bold'}
            />
          </SideCard>

          <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#F59E0B] text-lg">💡</span>
              <h3 className="font-bold text-[14px] text-[#92400E]">Reutilizar escala existente</h3>
            </div>
            <p className="text-[13px] text-[#78350F] mb-3">
              Puedes clonar los niveles de una escala que ya hayas definido en otro criterio.
            </p>
            <button
              type="button"
              onClick={() => setShowReusePanel(true)}
              className="w-full rounded-lg border border-[#FCD34D] bg-white py-2 text-[13px] font-medium text-[#92400E] hover:bg-[#FEF3C7]"
            >
              Ver escalas existentes →
            </button>
          </div>

          <SideCard title="Reglas">
            <RulesList />
          </SideCard>

          <div>
            <div className="flex justify-between text-[13px] mb-1.5">
              <span className="text-[#374151] dark:text-gray-300">
                {criteriaWithScalesCount} de {criteria.length} criterios con escalas definidas
              </span>
              <span className="font-semibold text-[#6366F1]">{progressPercent} %</span>
            </div>
            <div className="h-2 rounded-full bg-[#E5E7EB] overflow-hidden dark:bg-meta-4">
              <div
                className="h-full rounded-full bg-[#6366F1] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Error banner */}
      {!publishCheck.ready && firstIncompleteCriterion && (
        <div className="mx-6 mt-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 flex items-start gap-2 text-[13px] text-[#991B1B]">
          <span className="text-[#DC2626] font-bold">⊗</span>
          <span>
            No se puede publicar: el criterio &apos;{firstIncompleteCriterion.name}&apos; tiene
            menos de 2 niveles de escala definidos.
          </span>
        </div>
      )}

      {/* Sticky footer */}
      <footer className="fixed bottom-0 left-0 right-0 lg:left-[290px] z-40 bg-white border-t border-[#E5E7EB] px-6 py-4 flex flex-wrap items-center justify-between gap-3 dark:bg-boxdark dark:border-strokedark">
        <button
          type="button"
          onClick={handleCancel}
          className="text-[14px] font-medium text-[#374151] px-5 py-2.5 rounded-lg hover:bg-[#F3F4F6] dark:text-gray-300 dark:hover:bg-meta-4"
        >
          Cancelar
        </button>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSaveChanges}
            className="text-[14px] font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-lg px-5 py-2.5 hover:bg-[#F9FAFB] dark:bg-meta-4 dark:border-strokedark dark:text-white"
          >
            Guardar cambios
          </button>
          <button
            type="button"
            disabled={!allCriteriaReady}
            onClick={handleContinueToReview}
            className="text-[14px] font-semibold text-white bg-[#6366F1] rounded-lg px-5 py-2.5 hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar a revisión →
          </button>
          {!rubric.is_public && (
            <button
              type="button"
              disabled={!publishCheck.ready || publishing}
              onClick={handlePublish}
              className="text-[14px] font-semibold text-white bg-[#16A34A] rounded-lg px-5 py-2.5 hover:bg-[#15803D] disabled:opacity-50"
            >
              {publishing ? 'Publicando...' : 'Publicar rúbrica'}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

const SummaryItem: React.FC<{
  label: string;
  value: string;
  valueClassName?: string;
}> = ({ label, value, valueClassName = 'font-semibold text-[#111827] dark:text-white' }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">{label}</p>
    <p className={`text-[14px] mt-0.5 ${valueClassName}`}>{value}</p>
  </div>
);

const SideCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-boxdark dark:border-strokedark">
    <h3 className="font-bold text-[14px] text-[#111827] mb-3 dark:text-white">{title}</h3>
    {children}
  </div>
);

const SideRow: React.FC<{
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}> = ({ label, value, valueClassName }) => (
  <div className="flex justify-between items-center py-1.5 text-[13px] border-b border-[#F3F4F6] last:border-0 dark:border-strokedark">
    <span className="text-[#6B7280]">{label}</span>
    {typeof value === 'string' ? (
      <span className={valueClassName ?? 'font-medium text-[#111827] dark:text-white'}>{value}</span>
    ) : (
      value
    )}
  </div>
);

const PencilIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default DefineScales;
