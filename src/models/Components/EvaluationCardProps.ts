import { Evaluation } from "../Evaluation/Evaluation";
import { Subject } from "../Subjects/Subject";
import { User } from "../User";
import { Group } from "../Groups/Group";
import { Rubric } from "../Evaluation/Rubric";

export interface EvaluationCardProps {
	evaluation: Evaluation;
	subject: Subject;
	group: Group;
	user: User;
	rubric: Rubric;
}
