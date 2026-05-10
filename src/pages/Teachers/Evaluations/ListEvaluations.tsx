/*
 * Componente ListEvaluations
 * Muestra el listado de evaluaciones pendientes de calificar por el docente.
 * Implementa el caso de uso CU-10 (Asociar rubrica a evaluacion) permitiendo
 * vincular una rubrica existente a una evaluacion a traves de un menu desplegable.
 */
import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { Link } from 'react-router-dom';
import { evaluationService } from '../../../services/evaluationService';
import { rubricService } from '../../../services/rubricService';
import { Evaluation } from '../../../models/Evaluation';
import { Rubric } from '../../../models/Rubric';

const ListEvaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const evalsData = await evaluationService.getEvaluations();
        const rubricsData = await rubricService.getRubrics();
        setEvaluations(evalsData);
        setRubrics(rubricsData);
      } catch (error) {
        console.error("Error al cargar evaluaciones o rubricas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssociateRubric = async (evalId: any, rubricId: string) => {
    if (!rubricId) return;
    
    try {
      // Endpoint sugerido en el backend para asociar rubrica a evaluacion
      // @evaluation_bp.patch('/evaluations/<evaluation_id>/associate-rubric/<rubric_id>')
      await evaluationService.associateRubric(evalId, rubricId);
      
      setEvaluations(evals => evals.map(e => 
        e.id === evalId ? { ...e, rubric_id: rubricId } : e
      ));
      alert('Rúbrica asociada exitosamente a la evaluación.');
    } catch (error) {
      console.error("Error al asociar la rubrica:", error);
      alert('Hubo un error al asociar la rúbrica.');
    }
  };

  return (
    <>
      <Breadcrumb pageName="Evaluaciones a Calificar" />

      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="mb-6 flex justify-between items-center">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Mis Evaluaciones
            </h4>
          </div>

          <div className="flex flex-col">
            <div className="grid grid-cols-4 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
              <div className="p-2.5 xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Evaluación
                </h5>
              </div>
              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Curso
                </h5>
              </div>
              <div className="hidden p-2.5 text-center sm:block xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Fecha Límite
                </h5>
              </div>
              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Rúbrica (CU-10)
                </h5>
              </div>
              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Acciones
                </h5>
              </div>
            </div>

            {loading ? (
              <div className="p-5 text-center text-black dark:text-white">Cargando...</div>
            ) : evaluations.length === 0 ? (
              <div className="p-5 text-center text-black dark:text-white">No hay evaluaciones pendientes.</div>
            ) : (
              evaluations.map((evaluation) => (
              <div key={evaluation.id} className="grid grid-cols-4 border-b border-stroke dark:border-strokedark sm:grid-cols-5">
                <div className="flex items-center p-2.5 xl:p-5">
                  <p className="text-black dark:text-white sm:block">{evaluation.name}</p>
                </div>
                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className="text-black dark:text-white">{evaluation.subject_id}</p>
                </div>
                <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                  <p className="text-black dark:text-white">N/A</p>
                </div>
                
                {/* CU-10: Asociar Rúbrica */}
                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  {evaluation.rubric_id ? (
                    <span className="text-sm text-success font-medium flex flex-col items-center">
                      Vinculada
                      <select 
                        className="mt-1 text-xs p-1 rounded border border-stroke bg-transparent dark:border-form-strokedark"
                        value={evaluation.rubric_id}
                        onChange={(e) => handleAssociateRubric(evaluation.id, e.target.value)}
                      >
                        {rubrics.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                      </select>
                    </span>
                  ) : (
                    <select 
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-1 px-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      onChange={(e) => handleAssociateRubric(evaluation.id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Asociar Rúbrica...</option>
                      {rubrics.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                    </select>
                  )}
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  {evaluation.rubric_id ? (
                    <Link to={`/teachers/evaluations/${evaluation.id}/grade`} className="rounded bg-primary py-1 px-3 text-white hover:bg-opacity-90">
                      Calificar
                    </Link>
                  ) : (
                    <span className="text-sm text-warning cursor-not-allowed" title="Asocia una rúbrica primero">
                      Requiere Rúbrica
                    </span>
                  )}
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ListEvaluations;
