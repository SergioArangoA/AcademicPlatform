/**
 * Rutas de la app: admin, estudiante y docente. Abajo del archivo está el bloque TEACHER
 * (rúbricas, evaluaciones, grupos, calificaciones). El Sidebar enlaza a estas paths.
 */
import { lazy } from 'react';
import Rubrics from '../pages/Students/Rubrics/ListRubrics';
import Grades from '../pages/Students/Evaluations/ListGrades';

const UnauthorizedAcces = lazy(()=>import('../pages/Exceptions/UnauthorizedAcces.tsx'))
const Calendar = lazy(() => import('../pages/Calendar'));
const Chart = lazy(() => import('../pages/Chart'));
const FormElements = lazy(() => import('../pages/Form/FormElements'));
const FormLayout = lazy(() => import('../pages/Form/FormLayout'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Tables = lazy(() => import('../pages/Tables'));
const Alerts = lazy(() => import('../pages/UiElements/Alerts'));
const Buttons = lazy(() => import('../pages/UiElements/Buttons'));
const Demo= lazy(() => import('../pages/Demo'));
const ImageEditor= lazy(() => import('../pages/ImageEditor'));
const UserCreate= lazy(() => import('../pages/Users/Create'));
const UserUpdate= lazy(() => import('../pages/Users/Update'));
const RoleList= lazy(() => import('../pages/Roles/List'));
const Posts= lazy(() => import('../pages/Posts/List'));
const StudentsEvaluations= lazy(() => import('../pages/Students/Evaluations/ListEvaluations'));
const UserList = lazy(() => import('../pages/Admin/userList'));
const SubjectList = lazy(() => import('../pages/Admin/subjectList'));
const CreateSubject = lazy(() => import('../pages/Admin/createSubject'));
const UpdateSubject = lazy(() => import('../pages/Admin/updateSubject'));
const ViewSubject = lazy(() => import('../pages/Admin/viewSubject'));
const CreateUser = lazy(() => import('../pages/Admin/createUser'));
const UpdateUser = lazy(() => import('../pages/Admin/updateUser'));
const ViewUser = lazy(() => import('../pages/Admin/viewUser'));
const CareerAndSemesterList = lazy(() => import('../pages/Admin/careerAndSemesterList'));
const CreateCareer = lazy(() => import('../pages/Admin/createCareer'));
const UpdateCareer = lazy(() => import('../pages/Admin/updateCareer'));
const ViewCareer = lazy(() => import('../pages/Admin/viewCareer.tsx'));
const CreateSemester = lazy(() => import('../pages/Admin/createSemester.tsx'));
const UpdateSemester = lazy(() => import('../pages/Admin/updateSemester.tsx'));
const ViewSemester = lazy(() => import('../pages/Admin/viewSemester.tsx'));
const PlanStudios = lazy(() => import('../pages/Admin/StudyPlans.tsx'));
const ViewEvaluation = lazy(()=> import('../pages/Students/Evaluations/ViewEvaluation'));
const StudentsRubrics = lazy(()=> import ('../pages/Students/Rubrics/ListRubrics'));
const GradesList = lazy(()=> import ('../pages/Students/Evaluations/ListGrades'));
const GradeDetails = lazy(()=> import ('../pages/Students/Evaluations/ViewGrade'));

// Teacher routes
const TeacherListRubrics = lazy(() => import('../pages/Teachers/Rubrics/ListRubrics'));
const TeacherCreateRubric = lazy(() => import('../pages/Teachers/Rubrics/CreateRubric'));
const TeacherReviewRubric = lazy(() => import('../pages/Teachers/Rubrics/ReviewRubric'));
const TeacherDefineScales = lazy(() => import('../pages/Teachers/Rubrics/DefineScales'));
const TeacherListEvaluations = lazy(() => import('../pages/Teachers/Evaluations/ListEvaluations'));
const TeacherGradeStudent = lazy(() => import('../pages/Teachers/Evaluations/GradeStudent'));
const TeacherFinalGrades = lazy(() => import('../pages/Teachers/Evaluations/FinalGrades'));
const AssociateRubricPage = lazy(() => import('../pages/Teachers/Evaluations/AssociateRubricPage'));
const GradeStudentPage = lazy(() => import('../pages/Teachers/Evaluations/GradeStudentPage'));
const RegisterFinalGradePage = lazy(() => import('../pages/Teachers/Evaluations/RegisterFinalGradePage'));
const TeacherGroupList = lazy(() => import('../pages/Teachers/Groups/ListGroups'));
const TeacherStudentList = lazy(() => import('../pages/Teachers/Students/ListStudents'));
const TeacherScaleList = lazy(() => import('../pages/Teachers/Scales/ListScales'));

// Admin routes
const UserRegistrationList = lazy(()=>import('../pages/Admin/registrations/userRegistrationList.tsx'));
const UserRegistration = lazy(()=>import('../pages/Admin/registrations/userRegistration.tsx'));
const AssignTeacher = lazy(() => import('../pages/Admin/assignTeacher'));
const GroupList = lazy(() => import('../pages/Admin/groupList'));
const CreateGroup = lazy(() => import('../pages/Admin/createGroup'));
const UpdateGroup = lazy(() => import('../pages/Admin/updateGroup'));
const UserEnrollmentList = lazy(() => import('../pages/Admin/enrollments/userEnrollmentList'));
const UserEnrollment = lazy(()=>import('../pages/Admin/enrollments/userEnrollment.tsx'));

const coreRoutes = [
  {
    path: '/Acces-denied',
    title: 'Acceso denegado',
    component: UnauthorizedAcces,
    allowedRoles: ['STUDENT','ADMIN','TEACHER']
  },
  {
    path: '/students/evaluations/list',
    title: 'Evaluaciones',
    component: StudentsEvaluations,
    allowedRoles: ['STUDENT'],
  },
  {
    path: '/admin/registration/users/list',
    title: 'Matrículas',
    component: UserRegistrationList,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/registration/users/:id',
    title: 'Gestionar matrícula',
    component: UserRegistration,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/enrollment/users/list',
    title: 'Inscripciones',
    component: UserEnrollmentList,
    allowedRoles: ['ADMIN'],
  },
    {
    path: '/admin/enrollment/users/:id',
    title: 'Inscripciones',
    component: UserEnrollment,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/assign-teacher',
    title: 'Asignar docente',
    component: AssignTeacher,
    allowedRoles: ['ADMIN'],
  },
  // Rutas de grupos (listar, crear y editar) — las armé yo
  {
    path: '/admin/groups/list',
    title: 'Grupos',
    component: GroupList,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/groups/create',
    title: 'Nuevo grupo',
    component: CreateGroup,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/groups/edit/:id',
    title: 'Editar grupo',
    component: UpdateGroup,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/user-list',
    title: 'Lista Usuarios',
    component: UserList,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/subjects-list',
    title: 'Lista Materias',
    component: SubjectList,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/subjects/create',
    title: 'Nueva Asignatura',
    component: CreateSubject,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/subjects/edit/:id',
    title: 'Editar Asignatura',
    component: UpdateSubject,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/subjects/view/:id',
    title: 'Ver Asignatura',
    component: ViewSubject,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/students/evaluations/rubrics/list',
    title: 'Rúbricas',
    component: Rubrics,
    allowedRoles: ['STUDENT'],
  },
  {
    path: '/students/evaluations/grades/list',
    title: 'Notas',
    component: Grades,
    allowedRoles: ['STUDENT'],
  },
  {
    path: '/students/evaluations/:id',
    title: 'Información evaluación',
    component: ViewEvaluation,
    allowedRoles: ['STUDENT'],
  },
    {
    path: '/students/evaluations/grades/:id',
    title: 'Información nota',
    component: GradeDetails,
    allowedRoles: ['STUDENT'],
  },
  {
    path: '/users/list',
    title: 'Users',
    component: UserList,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/careers-semesters',
    title: 'Carreras y Semestres',
    component: CareerAndSemesterList,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/study-plans',
    title: 'Plan de estudios',
    component: PlanStudios,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/careers/create',
    title: 'Nueva Carrera',
    component: CreateCareer,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/careers/edit/:id',
    title: 'Editar Carrera',
    component: UpdateCareer,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/careers/view/:id',
    title: 'Ver Carrera',
    component: ViewCareer,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/semesters/view/:id',
    title: 'Ver Semestre',
    component: ViewSemester,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/semesters/create',
    title: 'Nuevo Semestre',
    component: CreateSemester,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/semesters/edit/:id',
    title: 'Editar Semestre',
    component: UpdateSemester,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/users/create',
    title: 'Create User',
    component: CreateUser,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/users/edit/:id',
    title: 'Update User',
    component: UpdateUser,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin/users/view/:id',
    title: 'View User',
    component: ViewUser,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/users/create',
    title: 'Create User',
    component: UserCreate,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/users/update/:id',
    title: 'Edit User',
    component: UserUpdate,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/posts/list',
    title: 'Posts',
    component: Posts,
    allowedRoles: ['ADMIN', 'TEACHER'],
  },
  {
    path: '/roles-list',
    title: 'Roles',
    component: RoleList,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/demo',
    title: 'Demo',
    component: Demo,
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
  },
  {
    path: '/calendar',
    title: 'Calender',
    component: Calendar,
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
  },
  {
    path: '/profile',
    title: 'Profile',
    component: Profile,
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
  },
  {
    path: '/forms/form-elements',
    title: 'Forms Elements',
    component: FormElements,
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
  },
  {
    path: '/forms/form-layout',
    title: 'Form Layouts',
    component: FormLayout,
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
  },
  {
    path: '/tables',
    title: 'Tables',
    component: Tables,
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
  },
  {
    path: '/settings',
    title: 'Settings',
    component: Settings,
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
  },
  {
    path: '/chart',
    title: 'Chart',
    component: Chart,
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
  },
  {
    path: '/ui/alerts',
    title: 'Alerts',
    component: Alerts,
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
  },
  {
    path: '/ui/buttons',
    title: 'Buttons',
    component: Buttons,
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
  },
  {
    path: '/image-editor',
    title: 'Image Editor',
    component: ImageEditor,
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
  },

  /**
   * Perfil docente (rol TEACHER): rutas que armé para el menú lateral del Sidebar.
   * - Rúbricas: listar, crear (CU-08), revisar y definir escalas por criterio.
   * - Evaluaciones: listado, asociar rúbrica (CU-10), calificar con rúbrica (CU-11), nota final (CU-12).
   * - Consulta: mis grupos, mis estudiantes, escalas y calificaciones consolidadas.
   * Los datos del docente logueado los resuelvo con utils/teacher (resolveTeacherId, tableData, filters).
   */
  {
    path: '/teachers/rubrics/list',
    title: 'Mis Rúbricas',
    component: TeacherListRubrics,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/teachers/rubrics/create',
    title: 'Crear Rúbrica',
    component: TeacherCreateRubric,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/teachers/rubrics/:id/revision',
    title: 'Revisión de Rúbrica',
    component: TeacherReviewRubric,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/teachers/rubrics/:id/escalas',
    title: 'Definir Escalas',
    component: TeacherDefineScales,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/evaluaciones',
    title: 'Evaluaciones',
    component: TeacherListEvaluations,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/teachers/evaluations/list',
    title: 'Calificar Evaluaciones',
    component: TeacherListEvaluations,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/evaluaciones/:evaluacionId/asociar-rubrica',
    title: 'Asociar rúbrica',
    component: AssociateRubricPage,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/evaluaciones/:evaluacionId/calificar/:inscripcionId',
    title: 'Calificar estudiante',
    component: GradeStudentPage,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/calificaciones/:grupoId/nota-final',
    title: 'Nota final del grupo',
    component: RegisterFinalGradePage,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/teachers/evaluations/:id/grade',
    title: 'Calificar Estudiante',
    component: TeacherGradeStudent,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/teachers/grades',
    title: 'Calificaciones Finales',
    component: TeacherFinalGrades,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/teachers/groups',
    title: 'Mis Grupos',
    component: TeacherGroupList,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/teachers/students',
    title: 'Mis Estudiantes',
    component: TeacherStudentList,
    allowedRoles: ['TEACHER'],
  },
  {
    path: '/teachers/scales',
    title: 'Escalas',
    component: TeacherScaleList,
    allowedRoles: ['TEACHER'],
  },
];

const routes = [...coreRoutes];
export default routes;
