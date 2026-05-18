import { User as AppUser } from '../../models/User';
import { User as FirebaseUser } from 'firebase/auth';
import { GroupWithMeta } from '../../services/groupService';

/** Usuario de login (Firebase o modelo de la app) usado en utilidades del docente */
export type AuthUser = FirebaseUser | AppUser | null;

export interface TeacherGroupRow extends GroupWithMeta {
  subject_label: string;
  semester_label: string;
  capacity_label: string;
}

export interface TeacherStudentRow {
  enrollment_id: string;
  student_id: string;
  student_code: string;
  student_name: string;
  student_email: string;
  group_label: string;
  subject_label: string;
  status: string;
}

export interface TeacherScaleRow {
  id: string;
  rubric_id: string;
  rubric_title: string;
  criterion_id: string;
  criterion_name: string;
  scale_name: string;
  scale_description: string;
  scale_value: number;
  rubric_status: string;
}

export interface TeacherSubjectOption {
  id: string;
  code: string;
  name: string;
  label: string;
}
