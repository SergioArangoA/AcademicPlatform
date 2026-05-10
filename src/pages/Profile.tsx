/*
 * Componente Profile
 * Muestra la informacion detallada del usuario logueado actualmente.
 * Extrae los datos (nombre, correo, rol, codigo, identificacion y foto) 
 * desde el estado global de Redux y Firebase. No expone informacion sensible como la contrasena.
 */
import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import CoverOne from '../images/cover/cover-01.png';
import UserOne from '../images/user/user-01.png';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const { user: authUser } = useAuth();

  const authU = authUser as any || {};
  const reduxU = user as any || {};

  // Buscar recursivamente si la data vino anidada
  const safeReduxU = reduxU?.user || reduxU;
  const safeAuthU = authU?.user || authU;

  const firstName = safeAuthU?.first_name || safeAuthU?.firstName || safeReduxU?.first_name || safeReduxU?.firstName || '';
  const lastName = safeAuthU?.last_name || safeAuthU?.lastName || safeReduxU?.last_name || safeReduxU?.lastName || '';

  const fullName = firstName || lastName
    ? `${firstName} ${lastName}`.trim()
    : authU?.displayName || safeAuthU?.email || safeReduxU?.email || 'Usuario';

  const profilePhoto = authUser && 'photoURL' in authUser && authUser.photoURL 
    ? authUser.photoURL 
    : null;

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0] ? names[0][0].toUpperCase() : 'U';
  };

  const email = safeAuthU?.email || safeReduxU?.email || 'Correo no disponible';
  const role = safeAuthU?.role || safeReduxU?.role || 'Rol no definido';
  
  // Validar si es "null" como string o realmente null
  const rawIdentification = safeAuthU?.identification || safeReduxU?.identification;
  const identification = rawIdentification && rawIdentification !== "null" ? rawIdentification : 'No registra aun';

  const rawCode = safeAuthU?.code || safeReduxU?.code;
  const code = rawCode && rawCode !== "null" ? rawCode : 'No registrado';

  return (
    <>
      <Breadcrumb pageName="Perfil" />

      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="relative z-20 h-35 md:h-65">
          <img
            src={CoverOne}
            alt="profile cover"
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
          />
        </div>
        
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="relative drop-shadow-2 w-full h-full rounded-full flex items-center justify-center bg-[#6D28D9] text-white text-4xl font-bold">
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt="profile" 
                  className="rounded-full w-full h-full object-cover aspect-square bg-white"
                />
              ) : (
                getInitials(fullName)
              )}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
              {fullName}
            </h3>
            <p className="font-medium text-primary mb-2">
              {role}
            </p>
            
            <p className="text-sm font-medium mb-4">
              {email}
            </p>

            <div className="mx-auto mt-4.5 mb-5.5 grid max-w-94 grid-cols-2 rounded-md border border-stroke py-4 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  Identificacion:
                </span>
                <span className="text-sm">{identification}</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
                <span className="font-semibold text-black dark:text-white">
                  Codigo:
                </span>
                <span className="text-sm">{code}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
