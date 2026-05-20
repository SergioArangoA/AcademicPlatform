import { GradeStatus } from '../Evaluation/Grade';
import { GradeDetailInput } from './GradeDetailInput';

export interface GradeStudentPayload {
    enrollment_id: string;
    evaluation_id?: string;
    rubric_id?: string;
    status: GradeStatus;
    observations?: string;
    details: GradeDetailInput[];
}
