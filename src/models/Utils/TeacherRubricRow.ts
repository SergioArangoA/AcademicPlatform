import { Rubric } from '../Evaluation/Rubric';
import { RubricVisibility } from '../../utils/teacher/rubricFilters';

export type TeacherRubricRow = Rubric & {
  subject_label: string;
  visibility: RubricVisibility;
};
