import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { rubricService } from '../../../services/rubricService';
import { criterionService } from '../../../services/criterionService';
import { subjectService } from '../../../services/subjectService';
import { Rubric } from '../../../models/Rubric';
import { Criterion } from '../../../models/Criterion';
import { getCriterionWeight } from '../../../utils/criterionWeight';
import RubricInfoCard from '../../../components/evaluations/RubricCard';

const ReviewRubric: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [subjectName, setSubjectName] = useState<string>('-');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      const [rubricData, criteriaData] = await Promise.all([
        rubricService.getRubricById(id),
        criterionService.getCriteriaByRubricId(id),
      ]);
      setRubric(rubricData);
      setCriteria(criteriaData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));

      if (rubricData?.subject_id) {
        const subject = await subjectService.getSubjectById(rubricData.subject_id);
        if (subject?.name) setSubjectName(subject.name);
      }
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="font-sans bg-[#F8F9FA] min-h-screen flex items-center justify-center dark:bg-boxdark-2">
        <p className="text-[14px] text-[#6B7280]">Cargando revisión...</p>
      </div>
    );
  }

  if (!rubric) {
    return (
      <div className="font-sans bg-[#F8F9FA] min-h-screen flex flex-col items-center justify-center dark:bg-boxdark-2">
        <p className="text-[#EF4444] mb-4">No se encontró la rúbrica.</p>
        <Link to="/teachers/rubrics/list" className="text-[#6D28D9] hover:underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  const totalWeight = criteria.reduce((acc, c) => acc + getCriterionWeight(c), 0);

  return (
    <div className="font-sans bg-[#F8F9FA] min-h-screen pb-20 dark:bg-boxdark-2">
      <div className="mb-6 pt-4 px-2">
        <h1 className="text-[22px] font-bold text-[#111827] dark:text-white">Revisión de la rúbrica</h1>
        <p className="text-[13px] text-[#6B7280] mt-1 dark:text-gray-400">
          Paso 3: verifica la información antes de definir escalas o volver al listado.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 mt-8 px-2">
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 dark:bg-boxdark dark:border-strokedark">
          <h2 className="text-[18px] font-bold text-[#111827] mb-4 dark:text-white">{rubric.title}</h2>
          {rubric.description && (
            <p className="text-[14px] text-[#374151] mb-6 dark:text-gray-300">{rubric.description}</p>
          )}

          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#F9FAFB] text-[#6B7280] uppercase text-[12px]">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Criterio</th>
                <th className="py-2 px-3">Peso</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c, idx) => (
                <tr key={c.id ?? idx} className="border-b border-[#F3F4F6] dark:border-strokedark">
                  <td className="py-2 px-3">{idx + 1}</td>
                  <td className="py-2 px-3">
                    <div className="font-medium text-[#111827] dark:text-white">{c.name}</div>
                    {c.description && (
                      <div className="text-[#6B7280] dark:text-gray-400">{c.description}</div>
                    )}
                  </td>
                  <td className="py-2 px-3">{c.weight}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-[13px] mt-4 text-[#6B7280]">
            Suma de pesos:{' '}
            <strong className={totalWeight === 100 ? 'text-[#16A34A]' : 'text-[#EF4444]'}>
              {totalWeight}%
            </strong>
          </p>
        </div>

        <RubricInfoCard
          title="Resumen de la rúbrica"
          rubric={rubric}
          criteria={criteria}
          subjectLabel={subjectName}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-[290px] bg-white border-t border-[#E5E7EB] h-[60px] px-6 flex items-center justify-between z-40 dark:bg-boxdark dark:border-strokedark">
        <button
          type="button"
          onClick={() => navigate('/teachers/rubrics/list')}
          className="text-[14px] font-medium text-[#374151] px-5 py-2.5 hover:bg-gray-100 rounded-md dark:text-gray-300"
        >
          Volver al listado
        </button>
        <div className="flex gap-3">
          <Link
            to={`/teachers/rubrics/${id}/escalas`}
            className="text-[14px] font-semibold text-white bg-[#6D28D9] rounded-md px-5 py-2.5 hover:bg-[#5B21B6]"
          >
            Definir escalas (CU-09) →
          </Link>
          {rubric.is_public && (
            <span className="text-[13px] text-[#16A34A] self-center font-medium">Rúbrica publicada</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewRubric;
