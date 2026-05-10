import { lazy } from 'react';

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

const coreRoutes = [
  {
    path: '/students/evaluations/list',
    title: 'Evaluaciones',
    component: StudentsEvaluations,
  },
  {
    path: '/admin/user-list',
    title: 'Lista Usuarios',
    component: UserList,
  },
  {
    path: '/admin/careers-semesters',
    title: 'Carreras y Semestres',
    component: CareerAndSemesterList,
  },
  {
    path: '/admin/careers/create',
    title: 'Nueva Carrera',
    component: CreateCareer,
  },
  {
    path: '/admin/careers/edit/:id',
    title: 'Editar Carrera',
    component: UpdateCareer,
  },
  {
    path: '/admin/careers/view/:id',
    title: 'Ver Carrera',
    component: ViewCareer,
  },
  {
    path: '/admin/semesters/view/:id',
    title: 'Ver Semestre',
    component: ViewSemester,
  },
  {
    path: '/admin/semesters/create',
    title: 'Nuevo Semestre',
    component: CreateSemester,
  },
  {
    path: '/admin/semesters/edit/:id',
    title: 'Editar Semestre',
    component: UpdateSemester,
  },
  {
    path: '/admin/users/create',
    title: 'Create User',
    component: CreateUser,
  },
  {
    path: '/admin/users/edit/:id',
    title: 'Update User',
    component: UpdateUser,
  },
  {
    path: '/admin/users/view/:id',
    title: 'View User',
    component: ViewUser,
  },
  {
    path: '/users/create',
    title: 'Create User',
    component: UserCreate,
  },
  {
    path: '/users/update/:id',
    title: 'Edit User',
    component: UserUpdate,
  },
  {
    path: '/posts/list',
    title: 'Posts',
    component: Posts,
  },
  {
    path: '/roles-list',
    title: 'Roles',
    component: RoleList,
  },
  {
    path: '/demo',
    title: 'Demo',
    component: Demo,
  },
  {
    path: '/calendar',
    title: 'Calender',
    component: Calendar,
  },
  {
    path: '/profile',
    title: 'Profile',
    component: Profile,
  },
  {
    path: '/forms/form-elements',
    title: 'Forms Elements',
    component: FormElements,
  },
  {
    path: '/forms/form-layout',
    title: 'Form Layouts',
    component: FormLayout,
  },
  {
    path: '/tables',
    title: 'Tables',
    component: Tables,
  },
  {
    path: '/settings',
    title: 'Settings',
    component: Settings,
  },
  {
    path: '/chart',
    title: 'Chart',
    component: Chart,
  },
  {
    path: '/ui/alerts',
    title: 'Alerts',
    component: Alerts,
  },
  {
    path: '/ui/buttons',
    title: 'Buttons',
    component: Buttons,
  },
  {
    path: '/image-editor',
    title: 'Image Editor',
    component: ImageEditor,
  }
];

const routes = [...coreRoutes];
export default routes;
