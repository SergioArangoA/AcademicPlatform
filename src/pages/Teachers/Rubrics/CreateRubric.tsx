import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rubricService } from '../../../services/rubricService';
import { subjectService } from '../../../services/subjectService';
import { Subject } from '../../../models/Subject';

interface Scale {
  name: string;
  description: string;
  value: number;
}

interface Criterion {
  name: string;
  description: string;
  weight: number;
  scales: Scale[];
}

interface Rubric {
  subject_id: string;
  title: string;
  description: string;
  is_public: boolean;
  criteria: Criterion[];
}

const CreateRubric: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [rubric, setRubric] = useState<Rubric>({
    subject_id: '',
    title: '',
    description: '',
    is_public: false,
    criteria: [
      { name: 'Funcionalidad', description: 'El sistema cumple con los requisitos y funciona correctamente.', weight: 30, scales: [] },
      { name: 'Calidad del código', description: 'El código es legible, modular y sigue buenas prácticas.', weight: 25, scales: [] },
      { name: 'Pruebas y validación', description: 'Se implementan pruebas adecuadas y el sistema no presenta errores.', weight: 25, scales: [] },
      { name: 'Documentación', description: 'La documentación del proyecto es clara, completa y organizada.', weight: 20, scales: [] },
    ]
  });

  const [errorBanner, setErrorBanner] = useState<string>('');

  useEffect(() => {
    const fetchSubjects = async () => {
      const data = await subjectService.getSubjects();
      setSubjects(data);
    };
    fetchSubjects();
  }, []);

  const totalWeight = rubric.criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);

  const addCriterion = () => {
    setRubric({
      ...rubric,
      criteria: [...rubric.criteria, { name: '', description: '', weight: 0, scales: [] }]
    });
  };

  const removeCriterion = (index: number) => {
    const updated = [...rubric.criteria];
    updated.splice(index, 1);
    setRubric({ ...rubric, criteria: updated });
  };

  const updateCriterion = (index: number, field: keyof Criterion, value: any) => {
    const updated = [...rubric.criteria];
    updated[index] = { ...updated[index], [field]: value };
    setRubric({ ...rubric, criteria: updated });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('dragIndex', index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = Number(e.dataTransfer.getData('dragIndex'));
    if (dragIndex === dropIndex) return;
    const updated = [...rubric.criteria];
    const [draggedItem] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);
    setRubric({ ...rubric, criteria: updated });
  };

  const handleSubmit = async (e: React.FormEvent, asPublic: boolean) => {
    e.preventDefault();
    setErrorBanner('');

    if (!rubric.subject_id || !rubric.title) {
        setErrorBanner('Por favor, completa los campos obligatorios de información.');
        return;
    }

    if (totalWeight !== 100) {
      setErrorBanner(`la rúbrica debe tener al menos un criterio y la suma de los pesos debe ser 100 %.`);
      return;
    }
    if (rubric.criteria.length === 0) {
      setErrorBanner(`la rúbrica debe tener al menos un criterio y la suma de los pesos debe ser 100 %.`);
      return;
    }

    const payload = { ...rubric, is_public: asPublic };
    setLoading(true);
    try {
        await rubricService.createFullRubric(payload);
        alert(asPublic ? "Rúbrica publicada exitosamente" : "Borrador guardado exitosamente");
        navigate('/teachers/rubrics/list');
    } catch (err: any) {
        setErrorBanner("la rúbrica debe tener al menos un criterio y la suma de los pesos debe ser 100 %.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="font-sans bg-[#F8F9FA] min-h-screen pb-20 dark:bg-boxdark-2">
      
      {/* Header local de la vista */}
      <div className="flex justify-between items-start mb-6 pt-4 px-2">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827] dark:text-white">Crear rúbrica de evaluación</h1>
          <p className="text-[13px] text-[#6B7280] mt-1 dark:text-gray-400">Diseña los criterios y asigna los pesos porcentuales para tu rúbrica.</p>
        </div>
        <div className="text-[12px] text-[#6B7280]">
          <span className="text-[#9CA3AF] cursor-pointer hover:underline">Inicio</span> &gt; <span className="text-[#9CA3AF] cursor-pointer hover:underline">Rúbricas</span> &gt; <span className="font-medium text-[#374151] dark:text-gray-300">Crear rúbrica</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-8 px-4 w-full">
        <div className="flex items-center">
          <div className="flex flex-col items-center relative">
            <div className="w-7 h-7 rounded-full bg-[#6D28D9] text-white flex items-center justify-center font-bold text-sm z-10">1</div>
            <span className="text-[13px] font-semibold text-[#6D28D9] absolute top-8 whitespace-nowrap">Información de la rúbrica</span>
          </div>
          <div className="w-16 sm:w-24 md:w-32 border-t border-[#D1D5DB]"></div>
          <div className="flex flex-col items-center relative">
            <div className="w-7 h-7 rounded-full border border-[#D1D5DB] bg-white text-[#9CA3AF] flex items-center justify-center font-medium text-sm z-10">2</div>
            <span className="text-[13px] text-[#9CA3AF] absolute top-8 whitespace-nowrap">Criterios</span>
          </div>
          <div className="w-16 sm:w-24 md:w-32 border-t border-[#D1D5DB]"></div>
          <div className="flex flex-col items-center relative">
            <div className="w-7 h-7 rounded-full border border-[#D1D5DB] bg-white text-[#9CA3AF] flex items-center justify-center font-medium text-sm z-10">3</div>
            <span className="text-[13px] text-[#9CA3AF] absolute top-8 whitespace-nowrap">Revisión</span>
          </div>
          <div className="w-16 sm:w-24 md:w-32 border-t border-[#D1D5DB]"></div>
          <div className="flex flex-col items-center relative">
            <div className="w-7 h-7 rounded-full border border-[#D1D5DB] bg-white text-[#9CA3AF] flex items-center justify-center font-medium text-sm z-10">4</div>
            <span className="text-[13px] text-[#9CA3AF] absolute top-8 whitespace-nowrap">Publicar o guardar</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 mt-12 px-2 items-start">
        {/* Main Content Area */}
        <div className="w-full min-w-0">
          
          {/* SECCIÓN 1: Información de la rúbrica */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 mb-6 dark:bg-boxdark dark:border-strokedark">
            <h2 className="text-[18px] font-bold text-[#111827] mb-5 dark:text-white">Información de la rúbrica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5 dark:text-gray-300">
                    Asignatura <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={rubric.subject_id}
                      onChange={e => setRubric({ ...rubric, subject_id: e.target.value })}
                      className="w-full h-10 px-3 text-[14px] text-[#111827] bg-white border border-[#D1D5DB] rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#6D28D9] focus:border-[#6D28D9] dark:bg-form-input dark:border-form-strokedark dark:text-white"
                    >
                      <option value="" disabled>Seleccione una asignatura...</option>
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6B7280]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5 dark:text-gray-300">
                    Título <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={rubric.title}
                    onChange={e => setRubric({ ...rubric, title: e.target.value })}
                    placeholder="Ej. Rúbrica para Proyecto de Programación"
                    className="w-full h-10 px-3 text-[14px] text-[#111827] bg-white border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#6D28D9] focus:border-[#6D28D9] dark:bg-form-input dark:border-form-strokedark dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5 dark:text-gray-300">
                    Estado de la rúbrica
                  </label>
                  <div>
                    <span className="inline-block px-3 py-1 rounded-[20px] text-[13px] text-[#374151] bg-[#F3F4F6] border border-[#D1D5DB] whitespace-nowrap dark:bg-meta-4 dark:text-white dark:border-strokedark">
                      Borrador (no publicada)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5 dark:text-gray-300">
                    Descripción
                  </label>
                  <div className="relative">
                    <textarea
                      value={rubric.description}
                      onChange={e => setRubric({ ...rubric, description: e.target.value })}
                      placeholder="Describe el propósito de esta rúbrica..."
                      className="w-full h-[90px] px-3 py-2 text-[14px] text-[#111827] bg-white border border-[#D1D5DB] rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-[#6D28D9] focus:border-[#6D28D9] dark:bg-form-input dark:border-form-strokedark dark:text-white"
                    />
                    <div className="absolute bottom-2 right-2 text-[11px] text-[#9CA3AF]">
                      {rubric.description.length}/500
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Criterios de evaluación */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 dark:bg-boxdark dark:border-strokedark">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
              <div>
                <h2 className="text-[18px] font-bold text-[#111827] dark:text-white">Criterios de evaluación</h2>
                <p className="text-[13px] text-[#6B7280] mt-1 dark:text-gray-400">Agrega los criterios que utilizarás para evaluar. La suma de los pesos debe ser exactamente 100 %.</p>
              </div>
              <div className="flex gap-3">
                <button type="button" className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1D5DB] rounded-md text-[14px] font-medium text-[#374151] hover:bg-gray-50 dark:bg-meta-4 dark:text-white dark:border-strokedark dark:hover:bg-boxdark">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  <span>Plantillas de rúbricas</span>
                </button>
                <button type="button" onClick={addCriterion} className="flex items-center gap-2 px-4 py-2 bg-[#6D28D9] rounded-md text-[14px] font-semibold text-white hover:bg-[#5B21B6] transition-colors">
                  <span>+</span> Agregar criterio
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left" role="table">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[12px] text-[#6B7280] uppercase tracking-[0.05em] dark:bg-meta-4 dark:border-strokedark dark:text-gray-400">
                    <th className="py-3 px-2 w-6"></th>
                    <th className="py-3 px-2 w-10 text-center">#</th>
                    <th className="py-3 px-3 w-45">Nombre del criterio</th>
                    <th className="py-3 px-3">Descripción</th>
                    <th className="py-3 px-3 w-30">Peso (%)</th>
                    <th className="py-3 px-2 w-20 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rubric.criteria.map((crit, idx) => (
                    <tr 
                      key={idx} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, idx)}
                      className="border-b border-[#F3F4F6] bg-white h-14 hover:bg-gray-50 transition-colors dark:bg-boxdark dark:border-strokedark dark:hover:bg-meta-4"
                    >
                      <td className="py-2 px-2 cursor-grab text-[#D1D5DB] hover:text-[#9CA3AF] text-center">
                        ⋮⋮
                      </td>
                      <td className="py-2 px-2 text-center text-[13px] text-[#6B7280] font-medium">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={crit.name}
                          onChange={(e) => updateCriterion(idx, 'name', e.target.value)}
                          placeholder="Nombre"
                          className="w-full text-[13px] text-[#111827] bg-transparent border-none focus:ring-0 p-1 dark:text-white"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={crit.description}
                          onChange={(e) => updateCriterion(idx, 'description', e.target.value)}
                          placeholder="Descripción del criterio..."
                          className="w-full text-[13px] text-[#374151] bg-transparent border-none focus:ring-0 p-1 dark:text-gray-300"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center border border-[#D1D5DB] rounded-md overflow-hidden w-20 bg-white focus-within:ring-1 focus-within:ring-[#6D28D9] focus-within:border-[#6D28D9] dark:bg-form-input dark:border-form-strokedark">
                          <input
                            type="number"
                            value={crit.weight || ''}
                            onChange={(e) => updateCriterion(idx, 'weight', Number(e.target.value))}
                            className="w-[50px] px-2 py-1.5 text-[14px] text-center text-[#111827] border-none focus:outline-none dark:bg-transparent dark:text-white"
                          />
                          <span className="text-[13px] text-[#6B7280] pr-2">%</span>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" className="text-[#6B7280] hover:text-[#374151] transition-colors" title="Editar" aria-label="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          </button>
                          <button type="button" onClick={() => removeCriterion(idx)} className="text-[#EF4444] hover:text-[#B91C1C] transition-colors" title="Eliminar" aria-label="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#F3F4F6] dark:border-strokedark">
              <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <span>Arrastra los criterios para cambiar el orden de evaluación.</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-bold text-[#374151] dark:text-gray-300">Suma total de pesos</span>
                  <span className={`text-[28px] font-bold ${totalWeight === 100 ? 'text-[#16A34A]' : 'text-[#EF4444]'}`}>
                    {totalWeight} %
                  </span>
                </div>
                {totalWeight === 100 ? (
                  <div className="text-[13px] text-[#16A34A] flex items-center gap-1 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span>La suma de los pesos es correcta.</span>
                  </div>
                ) : (
                  <div className="text-[13px] text-[#EF4444] flex items-center gap-1 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    <span>Faltan {100 - totalWeight} % para completar.</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {errorBanner && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-md p-3 mb-6 flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#EF4444] mt-0.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="text-[13px] font-bold text-[#EF4444]">No se puede publicar: </span>
                <span className="text-[13px] text-[#991B1B]">{errorBanner}</span>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar Area */}
        <div className="w-full xl:w-[300px] flex flex-col gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm dark:bg-boxdark dark:border-strokedark">
            <h3 className="text-[16px] font-bold text-[#111827] mb-4 dark:text-white">Resumen de la rúbrica</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start border-b border-stroke pb-2 dark:border-strokedark">
                <span className="text-[13px] text-[#6B7280] dark:text-gray-400">Asignatura:</span>
                <span className="text-[13px] text-[#111827] font-medium text-right dark:text-gray-200">
                  {subjects.find(s => s.id === Number(rubric.subject_id))?.name || 'No seleccionada'}
                </span>
              </div>
              <div className="flex justify-between items-start border-b border-stroke pb-2 dark:border-strokedark">
                <span className="text-[13px] text-[#6B7280] dark:text-gray-400">Título:</span>
                <span className="text-[13px] text-[#111827] font-medium text-right truncate max-w-[150px] dark:text-gray-200" title={rubric.title}>
                  {rubric.title || 'Sin título'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-stroke pb-2 dark:border-strokedark">
                <span className="text-[13px] text-[#6B7280] dark:text-gray-400">Estado:</span>
                <span className="text-[11px] bg-[#F3F4F6] border border-[#D1D5DB] text-[#374151] px-2 py-0.5 rounded-full dark:bg-meta-4 dark:border-strokedark dark:text-gray-300">
                  Borrador
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-stroke pb-2 dark:border-strokedark">
                <span className="text-[13px] text-[#6B7280] dark:text-gray-400">Criterios:</span>
                <span className="text-[13px] text-[#111827] font-medium dark:text-gray-200">{rubric.criteria.length}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[13px] text-[#6B7280] dark:text-gray-400">Suma de pesos:</span>
                <span className={`text-[13px] font-bold ${totalWeight === 100 ? 'text-[#16A34A]' : 'text-[#EF4444]'}`}>
                  {totalWeight} %
                </span>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-4 transition-colors ${totalWeight === 100 && rubric.title ? 'bg-[#F0FDF4] border border-[#D1FAE5]' : 'bg-white border border-[#E5E7EB] opacity-60 dark:bg-boxdark dark:border-strokedark'}`}>
            <div className="flex items-center gap-2 mb-1">
              {totalWeight === 100 ? (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white text-[11px]">✓</div>
              ) : (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#9CA3AF] text-white text-[11px]">✓</div>
              )}
              <h4 className={`text-[14px] font-bold ${totalWeight === 100 ? 'text-[#065F46]' : 'text-[#6B7280] dark:text-gray-300'}`}>Listo para publicar</h4>
            </div>
            <p className={`text-[13px] mt-2 ${totalWeight === 100 ? 'text-[#065F46]' : 'text-[#6B7280] dark:text-gray-400'}`}>
              Puedes publicar esta rúbrica cuando lo desees.
            </p>
          </div>

          <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-4 dark:bg-meta-4 dark:border-strokedark">
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#F59E0B]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.829 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.487 1.508 1.333 1.508 2.316V18" />
              </svg>
              <h4 className="text-[14px] font-bold text-[#374151] dark:text-gray-200">Incluye CU-09</h4>
            </div>
            <p className="text-[13px] text-[#6B7280] mb-3 dark:text-gray-400">
              Después de crear los criterios, puedes definir las escalas de evaluación para cada criterio.
            </p>
            <button className="text-[13px] font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors dark:bg-boxdark dark:text-white dark:border-strokedark">
              Definir escalas (CU-09) →
            </button>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px] dark:bg-boxdark dark:border-strokedark">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#9CA3AF] mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-[14px] font-bold text-[#374151] dark:text-gray-300">Historial de la rúbrica</h4>
            <p className="text-[13px] text-[#9CA3AF] text-center mt-1 dark:text-gray-500">Aún no hay historial.</p>
          </div>
        </div>
      </div>

      {/* Action Footer Sticky */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[290px] bg-white border-t border-[#E5E7EB] h-[60px] px-6 flex items-center justify-between z-40 dark:bg-boxdark dark:border-strokedark">
        <div>
          <button type="button" onClick={() => navigate(-1)} className="text-[14px] font-medium text-[#374151] px-5 py-2.5 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-300 dark:hover:bg-meta-4">
            Cancelar
          </button>
        </div>
        <div className="flex gap-4">
          <button 
            type="button" 
            disabled={loading}
            onClick={(e) => handleSubmit(e, false)} 
            className="flex items-center gap-2 text-[14px] font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-md px-5 py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:bg-meta-4 dark:text-white dark:border-strokedark dark:hover:bg-boxdark"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            <span>Guardar como borrador</span>
          </button>
          <button 
            type="button" 
            disabled={loading}
            onClick={(e) => handleSubmit(e, true)} 
            className="flex items-center gap-2 text-[14px] font-semibold text-white bg-[#6D28D9] rounded-md px-5 py-2.5 hover:bg-[#5B21B6] transition-colors disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Revisar y continuar →'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default CreateRubric;
