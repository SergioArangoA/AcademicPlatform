/**
 * Enrutador del inicio "/": según el rol muestro TeacherDashboard, StudentDashboard
 * o el dashboard genérico de admin. Si soy docente, caigo en TeacherDashboard.
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import ECommerce from './ECommerce';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const DashboardIndex: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);

  if (user?.role === 'TEACHER') {
    return <TeacherDashboard />;
  }
  
  if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  }

  return <ECommerce />;
};

export default DashboardIndex;
