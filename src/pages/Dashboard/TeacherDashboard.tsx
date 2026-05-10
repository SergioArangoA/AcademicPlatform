/*
 * Componente TeacherDashboard
 * Este componente es la vista principal que se muestra al usuario con rol TEACHER.
 * Sirve como punto de entrada para que el docente gestione sus grupos y rubricas.
 */
import React from 'react';
import Breadcrumb from '../../components/Breadcrumb';

const TeacherDashboard: React.FC = () => {
  return (
    <>
      <Breadcrumb pageName="Dashboard Docente" />

      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="mb-6 flex justify-between items-center">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Bienvenido a tu panel docente
            </h4>
          </div>
          <p className="text-body mb-6">
            Desde aquí podrás gestionar tus grupos, estudiantes, rúbricas de evaluación y calificaciones.
            Utiliza el menú lateral para acceder a las diferentes herramientas.
          </p>
        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;
