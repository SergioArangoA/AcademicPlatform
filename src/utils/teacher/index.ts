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

export {
  resolveTeacherRecord,
  resolveTeacherId,
  resolveVerifiedTeacherId,
  resolveTeacherMatchIds,
  getTeacherEntityId,
  getResolvedTeacherProfileId,
} from './resolveTeacherId';

export {
  getGroupTeacherId,
  getRubricTeacherId,
  filterGroupsByTeacherMatchIds,
  filterRubricsByTeacherMatchIds,
  filterRubricsForTeacher,
  getRubricSubjectId,
  filterGroupsAssignedToTeacher,
  filterRubricsAssignedToTeacher,
} from './filters';

export { getTeacherProfileId } from '../authUser';

export { loadTeacherGroupOptions } from './groupOptions';

export {
  loadTeacherGroupsData,
  loadTeacherStudentsData,
  loadTeacherRubricsData,
  loadTeacherScalesData,
} from './tableData';
export type { TeacherRubricRow } from './tableData';

export {
  loadTeacherSubjects,
  resolveTeacherIdForApi,
  getSubjectByIdSafe,
} from './evaluationHelpers';

export {
  loadTeacherEvaluationsData,
  loadEvaluationStudentsRows,
} from './evaluationData';
export type { TeacherEvaluationRow, EvaluationStudentRow } from './evaluationData';
