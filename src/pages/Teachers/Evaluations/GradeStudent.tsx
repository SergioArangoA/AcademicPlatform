import React from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { useParams } from 'react-router-dom';

const GradeStudent: React.FC = () => {
  const { id } = useParams();

  return (
    <>
      <Breadcrumb pageName="Calificar Estudiante" />

      <div className="flex flex-col gap-9">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Calificación de la Evaluación #{id}
            </h3>
          </div>
          
          <div className="p-6.5">
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Seleccione el Estudiante
              </label>
              <select className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                <option value="">Seleccione...</option>
                <option value="1">Estudiante 1 (student1@example.com)</option>
              </select>
            </div>

            {/* Rúbrica de evaluación - Placeholder */}
            <div className="mb-6 rounded bg-gray-2 p-4 dark:bg-meta-4">
              <h4 className="mb-3 text-lg font-semibold text-black dark:text-white">Rúbrica: Desarrollo Web</h4>
              
              <div className="mb-4 p-3 border border-stroke dark:border-strokedark rounded bg-white dark:bg-boxdark">
                <p className="font-medium mb-2">Criterio 1: Diseño Responsivo</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="crit1" value="excelente" className="form-radio" /> Excelente (5.0)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="crit1" value="bueno" className="form-radio" /> Bueno (4.0)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="crit1" value="regular" className="form-radio" /> Regular (3.0)
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Nota Final Calculada
                </label>
                <input
                  type="number"
                  readOnly
                  value="4.5"
                  className="w-full rounded border-[1.5px] border-stroke bg-gray-100 py-3 px-5 font-medium outline-none dark:border-form-strokedark dark:bg-meta-4"
                />
              </div>

            </div>

            <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray">
              Guardar Calificación
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GradeStudent;
