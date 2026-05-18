/**
 * Utilidades del perfil docente (TEACHER).
 *
 * - resolveTeacherId: usuario logueado → registro teachers del backend
 * - filters: solo grupos/rúbricas asignados al docente
 * - groupOptions: selects de asignatura/grupo
 * - tableData: datos para tablas (grupos, estudiantes, rúbricas, escalas)
 * - evaluationHelpers: flujo CU-10/11/12 (evaluaciones)
 * - types: filas de tabla y tipos compartidos
 */

export type {
  AuthUser,
  TeacherGroupRow,
  TeacherStudentRow,
  TeacherScaleRow,
  TeacherSubjectOption,
} from './types';

export { resolveTeacherRecord, resolveTeacherId } from './resolveTeacherId';

export {
  getGroupTeacherId,
  isGroupAssignedToTeacher,
  filterGroupsAssignedToTeacher,
  getRubricTeacherId,
  isRubricAssignedToTeacher,
  filterRubricsAssignedToTeacher,
} from './filters';

export { loadTeacherGroupOptions } from './groupOptions';

export {
  loadTeacherGroupsData,
  loadTeacherStudentsData,
  loadTeacherRubricsData,
  loadTeacherScalesData,
} from './tableData';

export {
  loadTeacherSubjects,
  resolveTeacherIdForApi,
  getSubjectByIdSafe,
} from './evaluationHelpers';
