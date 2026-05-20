import { Evaluation } from '../Evaluation/Evaluation';

export interface TeacherEvaluationRow extends Evaluation {
  group_label: string;
  subject_label: string;
  students_total: number;
  /** Con nota guardada (DRAFT o SENT). */
  students_graded: number;
  /** Solo calificaciones oficiales (SENT). */
  students_graded_sent: number;
}
