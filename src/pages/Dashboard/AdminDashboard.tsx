/*
 * Componente StudentDashboard
 * Este componente es la vista principal que se muestra al usuario con rol STUDENT.
 * Sirve como punto de entrada para que el estudiante acceda a sus notas y progreso.
 */
import React from 'react';
import Breadcrumb from '../../components/Breadcrumb';

const AdminDashboard: React.FC = () => {
  return (
    <>
      <Breadcrumb pageName="Mi Espacio" />

      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="mb-6 flex justify-between items-center">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Bienvenido a tu espacio de administrador
            </h4>
          </div>
          <p className="text-body mb-6">
            Aquí podrás gestionar a tus estudiantes, profesores, grupos, asignaturas y semestres.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
