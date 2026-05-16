import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumb';

const DefineScales: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <Breadcrumb pageName="Definir escalas de evaluación" />
      <div className="rounded-sm border border-stroke bg-white px-6 py-8 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 className="text-xl font-semibold text-black dark:text-white mb-2">
          CU-09 – Escalas por criterio
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Rúbrica <span className="font-mono text-primary">{id}</span>. Esta pantalla completará la
          definición de escalas para cada criterio.
        </p>
        <Link
          to={`/teachers/rubrics/${id}/revision`}
          className="inline-flex items-center text-primary hover:underline text-sm font-medium"
        >
          ← Volver a revisión
        </Link>
      </div>
    </>
  );
};

export default DefineScales;
