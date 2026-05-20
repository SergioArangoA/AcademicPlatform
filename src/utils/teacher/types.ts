import { User as AppUser } from '../../models/User';
import { User as FirebaseUser } from 'firebase/auth';
import { TeacherGroupRow } from '../../models/Utils/TeacherGroupRow';
import { TeacherStudentRow } from '../../models/Utils/TeacherStudentRow';
import { TeacherScaleRow } from '../../models/Utils/TeacherScaleRow';
import { TeacherSubjectOption } from '../../models/Utils/TeacherSubjectOption';

/** Usuario de login (Firebase o modelo de la app) usado en utilidades del docente */
export type AuthUser = FirebaseUser | AppUser | null;

export type {
  TeacherGroupRow,
  TeacherStudentRow,
  TeacherScaleRow,
  TeacherSubjectOption,
};
