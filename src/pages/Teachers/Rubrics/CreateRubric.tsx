import React from 'react';
import Breadcrumb from '../../../components/Breadcrumb';

const CreateRubric: React.FC = () => {
  return (
    <>
      <Breadcrumb pageName="Crear Rúbrica" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9 sm:col-span-2">
          {/* <!-- Formulario Rúbrica --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Detalles de la Rúbrica
              </h3>
            </div>
            <form action="#">
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Nombre de la Rúbrica
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Evaluación Final de Software"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Descripción
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Descripción detallada de la rúbrica"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  ></textarea>
                </div>

                {/* Zona de Criterios (Placeholder) */}
                <div className="mb-6 rounded bg-gray-2 p-4 dark:bg-meta-4">
                  <h4 className="mb-3 text-lg font-semibold text-black dark:text-white">Criterios de Evaluación</h4>
                  <p className="text-sm">Aquí puedes implementar la lógica para agregar criterios y escalas.</p>
                  <button type="button" className="mt-3 flex items-center justify-center rounded bg-primary py-2 px-4 font-medium text-white hover:bg-opacity-90">
                    Añadir Criterio
                  </button>
                </div>

                <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray">
                  Guardar Rúbrica
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateRubric;
