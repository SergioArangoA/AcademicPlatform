import React from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { Link } from 'react-router-dom';

const ListRubrics: React.FC = () => {
  return (
    <>
      <Breadcrumb pageName="Mis Rúbricas" />

      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="mb-6 flex justify-between items-center">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Lista de Rúbricas
            </h4>
            <Link
              to="/teachers/rubrics/create"
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
            >
              Crear Rúbrica
            </Link>
          </div>

          <div className="flex flex-col">
            <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-4">
              <div className="p-2.5 xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Nombre
                </h5>
              </div>
              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Criterios
                </h5>
              </div>
              <div className="hidden p-2.5 text-center sm:block xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Estado
                </h5>
              </div>
              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Acciones
                </h5>
              </div>
            </div>

            {/* Placeholder row */}
            <div className="grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-4">
              <div className="flex items-center p-2.5 xl:p-5">
                <p className="text-black dark:text-white sm:block">Rúbrica de Software</p>
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-black dark:text-white">4</p>
              </div>
              <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                <p className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                  Activa
                </p>
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <button className="text-primary hover:underline">Ver / Editar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListRubrics;
