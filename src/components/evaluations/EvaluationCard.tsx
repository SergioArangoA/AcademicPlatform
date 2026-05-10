import { Evaluation } from "../../models/Evaluation";
import { Subject } from "../../models/Subject";
import { User } from "../../models/User";
import { Group } from "../../models/Group";
import { Rubric } from "../../models/Rubric";

interface EvaluationCardProps{
    evaluation: Evaluation,
    subject: Subject,
    group: Group,
    user: User,
    rubric: Rubric,
}


const EvaluationCard: React.FC<EvaluationCardProps> = ({ evaluation, subject, group, user, rubric }) => {
  return (
    <>
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid grid-cols-4 gap-6">
          
          <div>
            <h5 className="text-sm font-semibold text-gray-500 mb-2">
              Evaluación
            </h5>

            <h4 className="text-lg font-bold text-black dark:text-white mb-3">
              {evaluation?.name}
            </h4>

            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Ponderación:</span> {evaluation?.weight}%
              </p>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-gray-500 mb-2">
              Asignatura
            </h5>

            <p className="text-black dark:text-white font-medium">
              {subject?.name}
            </p>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-gray-500 mb-2">
              Grupo
            </h5>

            <p className="text-black dark:text-white font-medium">
              {group?.name}
            </p>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-gray-500 mb-2">
              Docente
            </h5>

            <p className="text-black dark:text-white font-medium">
              {user?.first_name} {user?.last_name}
            </p>
          </div>

        </div>
      </div>

      <div className="mt-6">
        {rubric ? (
          <div className="flex w-full border-l-6 border-[#34D399] bg-[#34D399] bg-opacity-[15%] px-5 py-4 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30">
            <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#34D399]">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  d="M15.2984 0.826822L5.91888 9.45376L2.05667 5.2868"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <h5 className="font-semibold text-black dark:text-[#34D399]">
                Rúbrica asignada
              </h5>
              <p className="text-sm text-body">
                Esta evaluación ya tiene una rúbrica asociada.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex w-full border-l-6 border-[#F87171] bg-[#F87171] bg-opacity-[15%] px-5 py-4 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30">
            <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#F87171]">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M6.5 0L13 13H0L6.5 0Z"
                  fill="white"
                />
              </svg>
            </div>
            <div>
              <h5 className="font-semibold text-[#B45454]">
                Sin rúbrica
              </h5>
              <p className="text-sm text-[#CD5D5D]">
                Esta evaluación no tiene una rúbrica asignada.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EvaluationCard;