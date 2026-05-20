export interface EvaluationStudentRow {
  enrollment_id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  grade_status: 'NONE' | 'DRAFT' | 'SENT';
  final_score: number | null;
  grade_id: string | null;
}
