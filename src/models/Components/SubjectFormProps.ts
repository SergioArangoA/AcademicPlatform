import { Subject } from "../Subjects/Subject";
import { SubjectPayload } from "../Subjects/SubjectPayload";

export interface SubjectFormProps {
	mode: 1 | 2;
	subject?: Subject | null;
	loading?: boolean;
	onSubmit: (values: SubjectPayload) => Promise<void> | void;
}
