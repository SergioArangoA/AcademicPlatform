import { Semester } from "../Semesters/Semester";
import { SemesterPayload } from "../Semesters/SemesterPayload";

export interface SemesterFormProps {
	mode: 1 | 2;
	semester?: Semester | null;
	loading?: boolean;
	onSubmit: (values: SemesterPayload) => Promise<void> | void;
}
