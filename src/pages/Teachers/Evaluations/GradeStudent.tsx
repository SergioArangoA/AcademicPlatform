/*
 * Componente GradeStudent
 * Implementa el caso de uso CU-11 (Calificar estudiante con rubrica).
 * Muestra la matriz de la rubrica para un estudiante especifico, permitiendo
 * seleccionar las escalas correspondientes. Calcula la nota final automaticamente
 * y permite guardar un borrador o enviar la calificacion definitiva.
 */
import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { useParams } from 'react-router-dom';
import EvaluationCard from '../../../components/evaluations/EvaluationCard';

interface Scale {
  id: string;
  name: string;
  value: number;
}

interface Criterion {
  id: string;
  name: string;
  weight: number;
  scales: Scale[];
}

const GradeStudent: React.FC = () => {
  const { id } = useParams();

  // CU-11: Rubrica vinculada a la evaluación
  const rubricMock = {
    title: 'Desarrollo Web (Rubrica_1)',
    criteria: [
      {
        id: 'c1',
        name: 'Diseño Responsivo',
        weight: 40,
        scales: [
          { id: 's1', name: 'Excelente', value: 5.0 },
          { id: 's2', name: 'Bueno', value: 4.0 },
          { id: 's3', name: 'Regular', value: 3.0 },
          { id: 's4', name: 'Deficiente', value: 1.0 },
        ]
      },
      {
        id: 'c2',
        name: 'Funcionalidad Javascript',
        weight: 60,
        scales: [
          { id: 's5', name: 'Excelente', value: 5.0 },
          { id: 's6', name: 'Bueno', value: 4.0 },
          { id: 's7', name: 'Regular', value: 3.0 },
          { id: 's8', name: 'Deficiente', value: 1.0 },
        ]
      }
    ]
  };

  const [selectedStudent, setSelectedStudent] = useState('');
  const [grades, setGrades] = useState<Record<string, { scaleId: string, value: number, comment: string }>>({});
  const [finalGrade, setFinalGrade] = useState(0);

  // Mocks para EvaluationCard
  const mockSubject = { id: 1, name: 'Desarrollo Web', career_id: 1, current_semester: 5, credits: 3 } as any;
  const mockGroup = { id: 1, name: 'Grupo A' } as any;
  const mockTeacher = { id: 'u1', first_name: 'Juan', last_name: 'Pérez' } as any;
  const mockEvaluation = { id: id, name: 'Proyecto Final', weight: 40, subject_id: 1, group_id: 1, teacher_id: 'u1', rubric_id: 'r1' } as any;

  const handleScaleSelect = (criterionId: string, scaleId: string, scaleValue: number) => {
    setGrades(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], scaleId, value: scaleValue }
    }));
  };

  const handleCommentChange = (criterionId: string, comment: string) => {
    setGrades(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], comment, scaleId: prev[criterionId]?.scaleId || '', value: prev[criterionId]?.value || 0 }
    }));
  };

  useEffect(() => {
    // Calculo de la suma ponderada: Nota.nota_final = Suma(Escala.valor * (peso_criterio / 100))
    let total = 0;
    rubricMock.criteria.forEach(c => {
      const selected = grades[c.id];
      if (selected && selected.value) {
        total += selected.value * (c.weight / 100);
      }
    });
    setFinalGrade(Number(total.toFixed(2)));
  }, [grades]);

  const handleSave = (isDraft: boolean) => {
    // CU-11 Excepcion E1: Algún Criterio sin escala_id seleccionado al intentar enviar
    if (!isDraft) {
      const missingCriteria = rubricMock.criteria.filter(c => !grades[c.id]?.scaleId);
      if (missingCriteria.length > 0) {
        alert(`No puede enviar la calificación. Faltan por evaluar los criterios: ${missingCriteria.map(c => c.name).join(', ')}`);
        return;
      }
    }

    console.log("Guardando calificación:", {
      student_id: selectedStudent,
      evaluation_id: id,
      final_grade: finalGrade,
      details: grades,
      is_draft: isDraft
    });

    alert(isDraft ? 'Borrador guardado. La nota es provisional.' : 'Calificación enviada al estudiante con éxito.');
  };

  return (
    <>
      <Breadcrumb pageName="Calificar Estudiante" />

      <div className="flex flex-col gap-9">
        <EvaluationCard 
          evaluation={mockEvaluation}
          subject={mockSubject}
          group={mockGroup}
          user={mockTeacher}
          rubric={rubricMock as any}
        />

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Calificación de la Evaluación #{id}
            </h3>
          </div>
          
          <div className="p-6.5">
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white font-semibold">
                Seleccione el Estudiante
              </label>
              <select 
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
              >
                <option value="" disabled>Seleccione...</option>
                <option value="student_1">Estudiante 1 (student1@example.com)</option>
                <option value="student_2">Estudiante 2 (student2@example.com)</option>
              </select>
            </div>

            {selectedStudent && (
              <div className="mb-6 rounded border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4 mt-6">
                <h4 className="mb-4 text-xl font-bold text-black dark:text-white">Rúbrica: {rubricMock.title}</h4>
                
                {rubricMock.criteria.map((criterion) => (
                  <div key={criterion.id} className="mb-6 p-4 border border-stroke dark:border-strokedark rounded bg-white dark:bg-boxdark shadow-1">
                    <div className="flex justify-between items-center mb-3 border-b border-stroke pb-2 dark:border-strokedark">
                      <p className="font-semibold text-lg text-black dark:text-white">{criterion.name}</p>
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded">Peso: {criterion.weight}%</span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      {criterion.scales.map(scale => (
                        <label 
                          key={scale.id} 
                          className={`flex flex-col items-center justify-center p-3 border rounded cursor-pointer transition-colors ${grades[criterion.id]?.scaleId === scale.id ? 'border-primary bg-primary bg-opacity-10 dark:bg-opacity-20' : 'border-stroke dark:border-strokedark hover:bg-gray-2 dark:hover:bg-meta-4'}`}
                        >
                          <input 
                            type="radio" 
                            name={`crit_${criterion.id}`} 
                            value={scale.id}
                            className="sr-only"
                            checked={grades[criterion.id]?.scaleId === scale.id}
                            onChange={() => handleScaleSelect(criterion.id, scale.id, scale.value)}
                          />
                          <span className="font-medium text-black dark:text-white text-center mb-1">{scale.name}</span>
                          <span className="text-sm font-bold text-primary">{scale.value.toFixed(1)}</span>
                        </label>
                      ))}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-black dark:text-white">Comentario (Opcional)</label>
                      <textarea 
                        rows={2} 
                        placeholder="Retroalimentación específica para este criterio"
                        value={grades[criterion.id]?.comment || ''}
                        onChange={e => handleCommentChange(criterion.id, e.target.value)}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 text-sm font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      ></textarea>
                    </div>
                  </div>
                ))}

                <div className="mt-8 flex justify-between items-center bg-white dark:bg-boxdark p-4 rounded border border-stroke dark:border-strokedark">
                  <span className="text-lg font-semibold text-black dark:text-white">Nota Final Calculada:</span>
                  <span className={`text-2xl font-bold ${finalGrade >= 3.0 ? 'text-success' : 'text-danger'}`}>
                    {finalGrade.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {selectedStudent && (
              <div className="flex justify-end gap-4 mt-6">
                <button 
                  onClick={() => handleSave(true)}
                  className="flex justify-center rounded border border-stroke py-3 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  Guardar Borrador
                </button>
                <button 
                  onClick={() => handleSave(false)}
                  className="flex justify-center rounded bg-primary py-3 px-6 font-medium text-gray hover:bg-opacity-90"
                >
                  Enviar Calificación Final
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GradeStudent;
