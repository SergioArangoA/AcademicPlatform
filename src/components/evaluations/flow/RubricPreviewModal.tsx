import { useEffect, useState } from 'react';
import { X, Eye } from 'lucide-react';
import { Rubric } from '../../../models/Evaluation/Rubric';
import { Criterion } from '../../../models/Evaluation/Criterion';
import { Scale } from '../../../models/Evaluation/Scale';
import { criterionService } from '../../../services/criterionService';
import { scaleService } from '../../../services/scaleService';
import { scalesByCriterion } from '../../../utils/rubricScoring';

import { RubricPreviewModalProps } from '../../../models/Components/RubricPreviewModalProps';

const RubricPreviewModal = ({ rubric, open, onClose }: RubricPreviewModalProps) => {
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [scales, setScales] = useState<Scale[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !rubric?.id) return;
        const load = async () => {
            setLoading(true);
            const [crit, allScales] = await Promise.all([
                criterionService.getCriteriaByRubricId(String(rubric.id)),
                scaleService.getScales(),
            ]);
            const ids = crit.map((c) => String(c.id));
            setCriteria(crit);
            setScales(allScales.filter((s) => ids.includes(String(s.criterion_id))));
            setLoading(false);
        };
        void load();
    }, [open, rubric?.id]);

    if (!open || !rubric) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-boxdark">
                <div className="flex items-center justify-between border-b border-stroke px-5 py-4 dark:border-strokedark">
                    <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-[#6366f1]" />
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                            Vista previa: {rubric.title}
                        </h3>
                    </div>
                    <button type="button" onClick={onClose} className="rounded p-1 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="max-h-[calc(90vh-4rem)] overflow-y-auto p-5">
                    {loading ? (
                        <p className="text-gray-500">Cargando criterios y escalas...</p>
                    ) : criteria.length === 0 ? (
                        <p className="text-gray-500">Sin criterios definidos.</p>
                    ) : (
                        <div className="space-y-4">
                            {criteria.map((c) => (
                                <div
                                    key={c.id}
                                    className="rounded-lg border border-stroke p-4 dark:border-strokedark"
                                >
                                    <p className="font-semibold text-black dark:text-white">
                                        {c.name}{' '}
                                        <span className="text-xs font-normal text-gray-500">
                                            ({c.weight}%)
                                        </span>
                                    </p>
                                    {c.description && (
                                        <p className="mt-1 text-sm text-gray-500">{c.description}</p>
                                    )}
                                    <ul className="mt-2 space-y-1 text-sm">
                                        {scalesByCriterion(scales, String(c.id)).map((s) => (
                                            <li key={s.id} className="flex justify-between gap-2">
                                                <span>
                                                    {s.name} — {s.description || '—'}
                                                </span>
                                                <span className="font-medium text-[#6366f1]">
                                                    {s.value}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RubricPreviewModal;
