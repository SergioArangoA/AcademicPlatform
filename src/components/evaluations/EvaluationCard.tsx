import { Evaluation } from "../../models/Evaluation";
import { Subject } from "../../models/Subject";
import { User } from "../../models/User";
import { Group } from "../../models/Group";

interface EvaluationCardProps{
    evaluation: Evaluation,
    subject: Subject,
    group: Group,
    user: User,
}


const EvaluationCard: React.FC<EvaluationCardProps> = ({evaluation,subject,group,user}) => {
  return (
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
            <p><span className="font-medium">Código:</span> {evaluation?.id} </p>
            <p><span className="font-medium">Ponderación:</span> {evaluation?.weight}% </p>
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
  );
};

export default EvaluationCard;