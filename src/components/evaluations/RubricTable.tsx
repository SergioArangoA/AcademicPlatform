/**
 * Tabla de criterios y escalas al calificar: el docente elige un nivel por fila (CU-11).
 */
import React, { useMemo } from "react";
import { Criterion } from "../../models/Evaluation/Criterion";
import { Scale } from "../../models/Evaluation/Scale";

import { RubricEvaluationTableProps } from "../../models/Components/RubricEvaluationTableProps";

const RubricEvaluationTable: React.FC<RubricEvaluationTableProps> = ({
  criteria,
  scales,
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

                    return (
                    <td
                        key={globalScale.id}
                        className="py-5 px-3 align-top text-center"
                    >
                        {scale ? (
                        <div className="space-y-2">
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                            {scale.description}
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
                </tr>
            );
            })}
        </tbody>

        </table>
    </div>
    );
};

export default RubricEvaluationTable;