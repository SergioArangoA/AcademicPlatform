import React from "react";
import { Registration } from "../../models/Registration";
import { Career } from "../../models/Careers/Career";

interface RegistrationCardProps {
  registration: Registration | null;
  career?: Career;
}

const RegistrationCard: React.FC<RegistrationCardProps> = ({
  registration,
  career,
}) => {
  if (!registration) {
    return (
      <div className="rounded-sm border border-stroke bg-white dark:bg-boxdark dark:border-strokedark shadow-default p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
          Información de matrícula
        </h3>

        <div className="text-center text-sm text-gray-600 dark:text-gray-300 py-6">
          No hay matrícula registrada
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white dark:bg-boxdark dark:border-strokedark shadow-default p-6">
      
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
        Información de matrícula
      </h3>

      <div className="space-y-3 text-sm">

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">ID</span>
          <span className="font-medium text-black dark:text-white">
            {registration.id ?? "-"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Carrera</span>
          <span className="font-medium text-black dark:text-white">
            {career?.code || registration.career_id || "-"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Periodo</span>
          <span className="font-medium text-black dark:text-white">
            {registration.admission_period}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Estado académico</span>

          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              registration.academic_status === "ACTIVE"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : registration.academic_status === "INACTIVE"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                : registration.academic_status === "RETIRED"
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                : registration.academic_status === "GRADUATED"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {registration.academic_status}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Activo</span>

          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              registration.is_active
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {registration.is_active ? "Sí" : "No"}
          </span>
        </div>

      </div>
    </div>
  );
};

export default RegistrationCard;