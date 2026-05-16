import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Rubric } from '../../models/Rubric';
import { Criterion } from '../../models/Criterion';
import { rubricService } from '../../services/rubricService';
import { criterionService } from '../../services/criterionService';
import { getCriterionWeight } from '../../utils/criterionWeight';

export interface LocalCriterionDraft {
  id_temp: string;
  name: string;
  description: string;
  weight: number;
  orden: number;
}

interface RubricTemplatesModalProps {
  open: boolean;
  teacherId: string;
  onClose: () => void;
  onApply: (criteria: LocalCriterionDraft[]) => void;
}

const RubricTemplatesModal: React.FC<RubricTemplatesModalProps> = ({
  open,
  teacherId,
  onClose,
  onApply,
}) => {
  const [templates, setTemplates] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !teacherId) return;

    const load = async () => {
      setLoading(true);
      const data = await rubricService.getPublicRubrics();
      setTemplates(data);
      setLoading(false);
    };

    load();
  }, [open, teacherId]);

  const handleClone = async (rubric: Rubric) => {
    if (!rubric.id) return;
    setApplyingId(rubric.id);
    try {
      const criteria: Criterion[] = await criterionService.getCriteriaByRubricId(rubric.id);

      if (criteria.length === 0) {
        toast.error('Esta plantilla no tiene criterios para copiar.');
        return;
      }

      const cloned: LocalCriterionDraft[] = criteria
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((c, index) => ({
          id_temp: `tpl-${rubric.id}-${c.id ?? index}`,
          name: c.name,
          description: c.description ?? '',
          weight: getCriterionWeight(c),
          orden: index + 1,
        }));
      onApply(cloned);
      onClose();
    } finally {
      setApplyingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-lg w-full max-w-lg p-6 dark:bg-boxdark dark:border-strokedark">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[16px] font-bold text-[#111827] dark:text-white">Plantillas de rúbricas</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#374151] dark:text-gray-400"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <p className="text-[13px] text-[#6B7280] mb-4 dark:text-gray-400">
          Selecciona una rúbrica publicada para copiar sus criterios a esta rúbrica.
        </p>

        {loading ? (
          <p className="text-[13px] text-[#6B7280] py-6 text-center">Cargando plantillas...</p>
        ) : templates.length === 0 ? (
          <p className="text-[13px] text-[#6B7280] py-6 text-center dark:text-gray-400">
            No tienes rúbricas publicadas para usar como plantilla.
          </p>
        ) : (
          <ul className="max-h-[320px] overflow-y-auto divide-y divide-[#F3F4F6] dark:divide-strokedark">
            {templates.map((tpl) => (
              <li key={tpl.id} className="py-3 flex justify-between items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[#111827] dark:text-white">{tpl.title}</p>
                  {tpl.description && (
                    <p className="text-[12px] text-[#6B7280] line-clamp-1 dark:text-gray-400">{tpl.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={applyingId === tpl.id}
                  onClick={() => handleClone(tpl)}
                  className="shrink-0 px-3 py-1.5 text-[13px] font-medium text-[#6D28D9] border border-[#6D28D9] rounded-md hover:bg-[#EDE9FE] disabled:opacity-50 transition-colors"
                >
                  {applyingId === tpl.id ? 'Copiando...' : 'Usar plantilla'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RubricTemplatesModal;
