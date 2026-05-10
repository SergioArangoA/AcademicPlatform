/*
 * Componente FinalGrades
 * Implementa el caso de uso CU-12 (Registrar nota final).
 * Muestra el consolidado de las calificaciones parciales de todos los estudiantes
 * de un grupo y permite al docente hacer el registro oficial e inmutable de la nota definitiva.
 */
import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { gradeService } from '../../../services/gradeService';

const FinalGrades: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      try {
        const data = await gradeService.getGrades();
        setGrades(data);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  const [isOfficial, setIsOfficial] = useState(false);

  const calculateFinalGrade = (evals: any[]) => {
    const total = evals.reduce((sum, ev) => sum + (ev.grade * (ev.weight / 100)), 0);
    return total.toFixed(2);
  };

  const handleRegisterOfficialGrades = () => {
    const confirmIncomplete = window.confirm(
      `¿Desea registrar oficialmente las notas? Ya no se podrán modificar.`
    );
    if (!confirmIncomplete) return;

    setIsOfficial(true);
    alert('Las notas finales se han registrado oficialmente en el semestre. Ya no se pueden modificar.');
  };

  return (
    <>
      <Breadcrumb pageName="Notas Finales (Consolidado)" />

      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="mb-6 flex justify-between items-center">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Consolidado de Grupo: Ingeniería de Software
            </h4>
            {!isOfficial && (
              <button 
                onClick={handleRegisterOfficialGrades}
                className="inline-flex items-center justify-center rounded-md bg-success py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
              >
                Confirmar Registro Oficial
              </button>
            )}
            {isOfficial && (
              <span className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success border border-success">
                Notas Oficiales Registradas
              </span>
            )}
          </div>

          <div className="flex flex-col overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="py-4 px-4 font-medium text-black dark:text-white">ID Inscripción</th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">Rúbrica</th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">Estado</th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white text-right">Nota Final</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-5 px-4 text-center">Cargando...</td></tr>
                ) : grades.length === 0 ? (
                  <tr><td colSpan={4} className="py-5 px-4 text-center">No hay notas registradas</td></tr>
                ) : (
                  grades.map((grade: any, key: number) => (
                    <tr key={key} className={key === grades.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}>
                      <td className="py-5 px-4 dark:text-white">{grade.enrollment_id}</td>
                      <td className="py-5 px-4 dark:text-white">{grade.rubric_id}</td>
                      <td className="py-5 px-4 dark:text-white">{grade.status}</td>
                      <td className="py-5 px-4 text-right">
                        <span className={`font-bold ${Number(grade.final_score) >= 3.0 ? 'text-success' : 'text-danger'}`}>
                          {grade.final_score !== undefined ? grade.final_score : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {isOfficial && (
            <div className="mt-6 mb-4 flex justify-end">
              <button className="text-primary hover:underline font-medium">
                Descargar Reporte (Excel)
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FinalGrades;
