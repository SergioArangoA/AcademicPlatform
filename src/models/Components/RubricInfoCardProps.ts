import { Rubric } from "../Evaluation/Rubric";
import { Criterion } from "../Evaluation/Criterion";
import { Subject } from "../Subjects/Subject";
import { Evaluation } from "../Evaluation/Evaluation";

export interface RubricInfoCardProps {
	rubric: Rubric | null;
	criteria: Criterion[] | null;
	subject?: Subject;
	subjectLabel?: string;
	evaluation?: Evaluation;
	title?: string;
}
