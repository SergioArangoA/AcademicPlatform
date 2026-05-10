/*
 * Componente DashboardIndex
 * Funciona como un enrutador de inicio. Evalua el rol del usuario actual
 * y decide que dashboard renderizar TeacherDashboard, StudentDashboard o el default.
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
