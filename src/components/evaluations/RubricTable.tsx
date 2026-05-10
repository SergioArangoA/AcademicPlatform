import React, { useMemo } from "react";
import { Criterion } from "../../models/Criterion";
import { Scale } from "../../models/Scale";

interface RubricEvaluationTableProps {
  criteria: Criterion[];
  scales: Scale[];
  isInteractive?: boolean;
  selectedScales?: Record<string, string>; // criterion_id -> scale_id
  comments?: Record<string, string>; // criterion_id -> comment
  onScaleSelect?: (criterionId: string, scaleId: string, value: number) => void;
  onCommentChange?: (criterionId: string, comment: string) => void;
}
const RubricEvaluationTable: React.FC<RubricEvaluationTableProps> = ({
  criteria,
  scales,
  isInteractive = false,
  selectedScales = {},
  comments = {},
  onScaleSelect,
  onCommentChange,
}) => {
  const globalScales = useMemo(() => {
    const map = new Map<string, Scale>();

    scales.forEach((s) => {
      const key = `${s.value}-${s.name}`;
      if (!map.has(key)) map.set(key, s);
    });

    return Array.from(map.values()).sort((a, b) => a.value - b.value);
  }, [scales]);

    return (
    <div className="w-full overflow-x-auto rounded-sm border border-stroke bg-white dark:bg-boxdark dark:border-strokedark shadow-default">
        <table className="w-full table-auto">

        <thead>
            <tr className="bg-gray-2 dark:bg-meta-4">
            <th className="py-4 px-4 text-left font-medium text-black dark:text-white">
                Criterio
            </th>

            {globalScales.map((s) => (
                <th
                key={s.id}
                className="py-4 px-3 text-center text-black dark:text-white"
                >
                <div className="font-semibold text-sm">
                    {s.name} ({s.value})
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                </div>
                </th>
            ))}
            {isInteractive && (
                <th className="py-4 px-4 text-center font-medium text-black dark:text-white w-48">
                    Comentario
                </th>
            )}
            </tr>
        </thead>

        <tbody>
            {criteria.map((c) => {
            const criterionScales = scales.filter(
                (s) => s.criterion_id === c.id
            );

            return (
                <tr
                key={c.id}
                className="border-b border-stroke dark:border-strokedark"
                >
                {/* Criterio */}
                <td className="py-5 px-4">
                    <div className="font-medium text-black dark:text-white">
                    {c.name}
                    </div>

                    {c.description && (
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                        {c.description}
                    </div>
                    )}

                    <div className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                    Peso: {c.weight}%
                    </div>
                </td>

                {/* Escalas por criterio */}
                {globalScales.map((globalScale) => {
                    const scale = criterionScales.find(
                    (s) => s.value === globalScale.value
                    );
                    
                    const isSelected = selectedScales[c.id] === scale?.id;

                    return (
                    <td
                        key={globalScale.id}
                        className={`py-5 px-3 align-top text-center transition-colors ${
                          isInteractive ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-meta-4' : ''
                        } ${isSelected ? 'bg-primary bg-opacity-10 dark:bg-opacity-20 border border-primary' : ''}`}
                        onClick={() => {
                          if (isInteractive && scale && onScaleSelect) {
                            onScaleSelect(c.id, scale.id, scale.value);
                          }
                        }}
                    >
                        {scale ? (
                        <div className="space-y-2">
                            <div className={`text-xs ${isSelected ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                            {scale.description || scale.name}
                            </div>
                        </div>
                        ) : (
                        <span className="text-gray-300 dark:text-gray-600">
                            -
                        </span>
                        )}
                    </td>
                    );
                })}
                
                {isInteractive && (
                  <td className="py-5 px-4 align-top">
                    <textarea
                      rows={2}
                      placeholder="Comentario (opcional)"
                      value={comments[c.id] || ''}
                      onChange={(e) => onCommentChange && onCommentChange(c.id, e.target.value)}
                      className="w-full min-w-[150px] rounded border-[1.5px] border-stroke bg-transparent py-2 px-3 text-sm font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </td>
                )}
                </tr>
            );
            })}
        </tbody>

        </table>
    </div>
    );
};

export default RubricEvaluationTable;