import { GroupWithMeta } from '../Services/GroupWithMeta';

export interface TeacherGroupRow extends GroupWithMeta {
  subject_label: string;
  semester_label: string;
  capacity_label: string;
}
