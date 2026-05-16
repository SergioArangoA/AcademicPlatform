import React from "react";
import { Rubric } from "../../models/Evaluation/Rubric";
import { Criterion } from "../../models/Evaluation/Criterion";
import { Subject } from "../../models/Subjects/Subject";
import { Evaluation } from "../../models/Evaluation/Evaluation";
import { getCriterionWeight } from "../../utils/criterionWeight";

interface RubricInfoCardProps {
  rubric: Rubric | null;
  criteria: Criterion[] | null;
  subject?: Subject;
  subjectLabel?: string;
  evaluation?: Evaluation;
  title?: string;
}

const RubricInfoCard: React.FC<RubricInfoCardProps> = ({
  rubric,
  criteria,
  subject,
  subjectLabel,
  evaluation,
  title = "Información de la rúbrica",
}) => {
  const totalWeight =
    criteria?.reduce((acc, c) => acc + getCriterionWeight(c), 0) || 0;

  return (
    <div className="rounded-sm border border-stroke bg-white dark:bg-boxdark dark:border-strokedark shadow-default p-6">
      {/* Título */}
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
        {title}
      </h3>

      {!rubric ? (
        <div className="text-center text-sm text-gray-600 dark:text-gray-300 py-6">
          Completa los datos de la rúbrica
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          {/* Título rúbrica */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Título</span>
            <span className="font-medium text-black dark:text-white">
              {rubric.title || "—"}
            </span>
          </div>

          {/* Estado */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Estado</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                rubric.is_public
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              }`}
            >
              {rubric.is_public ? "Publicada" : "Borrador (no publicada)"}
            </span>
          </div>

          {/* Cantidad de criterios */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Criterios</span>
            <span className="font-medium text-black dark:text-white">
              {criteria?.length || 0}
            </span>
          </div>

          {/* Suma de pesos */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Peso total</span>
            <span className="font-medium text-black dark:text-white">
              {totalWeight}%
            </span>
          </div>

          {/* Asignatura */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Asignatura</span>
            <span className="font-medium text-black dark:text-white">
              {subjectLabel || subject?.name || "-"}
            </span>
          </div>

          {/* Evaluación */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Evaluación</span>
            <span className="font-medium text-black dark:text-white">
              {evaluation?.name || "-"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RubricInfoCard;