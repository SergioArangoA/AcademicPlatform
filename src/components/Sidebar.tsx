/**
 * Menú lateral: según el rol muestro admin, docente o estudiante.
 * El bloque TEACHER agrupa Inicio, Mi clase, Rúbricas y Recursos; las rutas están en routes/index.
 */
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../images/logo/logo.svg';
import SidebarLinkGroup from './SidebarLinkGroup';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { SidebarProps } from '../models/Components/SidebarProps';

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const user = useSelector((state: RootState) => state.user.user);

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-white border-r border-[#E5E7EB] duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM12 12.8L4.08 8.46L12 4.15L19.92 8.46L12 12.8Z" fill="#6D28D9"/>
            <path d="M4 12V16.65C4 18.06 7.58 19.2 12 19.2C16.42 19.2 20 18.06 20 16.65V12C20 12 16.42 14.4 12 14.4C7.58 14.4 4 12 4 12Z" fill="#6D28D9"/>
          </svg>
          <span className="text-[18px] font-bold text-[#111827] dark:text-white">EduGest</span>
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {(!user?.role || user?.role === 'guest') && (
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                MENU
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <NavLink
                    to="/"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      pathname === '/'
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >
                    <svg
                      className="fill-current"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299ZM6.60947 6.30005C6.60947 6.5813 6.38447 6.8063 6.10322 6.8063H2.53135C2.2501 6.8063 2.0251 6.5813 2.0251 6.30005V2.72817C2.0251 2.44692 2.2501 2.22192 2.53135 2.22192H6.10322C6.38447 2.22192 6.60947 2.44692 6.60947 2.72817V6.30005Z"
                        fill=""
                      />
                      <path
                        d="M15.4689 0.956299H11.8971C10.9408 0.956299 10.1533 1.7438 10.1533 2.70005V6.27192C10.1533 7.22817 10.9408 8.01567 11.8971 8.01567H15.4689C16.4252 8.01567 17.2127 7.22817 17.2127 6.27192V2.72817C17.2127 1.7438 16.4252 0.956299 15.4689 0.956299ZM15.9752 6.30005C15.9752 6.5813 15.7502 6.8063 15.4689 6.8063H11.8971C11.6158 6.8063 11.3908 6.5813 11.3908 6.30005V2.72817C11.3908 2.44692 11.6158 2.22192 11.8971 2.22192H15.4689C15.7502 2.22192 15.9752 2.44692 15.9752 2.72817V6.30005Z"
                        fill=""
                      />
                      <path
                        d="M6.10322 9.92822H2.53135C1.5751 9.92822 0.787598 10.7157 0.787598 11.672V15.2438C0.787598 16.2001 1.5751 16.9876 2.53135 16.9876H6.10322C7.05947 16.9876 7.84697 16.2001 7.84697 15.2438V11.7001C7.8751 10.7157 7.0876 9.92822 6.10322 9.92822ZM6.60947 15.272C6.60947 15.5532 6.38447 15.7782 6.10322 15.7782H2.53135C2.2501 15.7782 2.0251 15.5532 2.0251 15.272V11.7001C2.0251 11.4188 2.2501 11.1938 2.53135 11.1938H6.10322C6.38447 11.1938 6.60947 11.4188 6.60947 11.7001V15.272Z"
                        fill=""
                      />
                      <path
                        d="M15.4689 9.92822H11.8971C10.9408 9.92822 10.1533 10.7157 10.1533 11.672V15.2438C10.1533 16.2001 10.9408 16.9876 11.8971 16.9876H15.4689C16.4252 16.9876 17.2127 16.2001 17.2127 15.2438V11.7001C17.2127 10.7157 16.4252 9.92822 15.4689 9.92822ZM15.9752 15.272C15.9752 15.5532 15.7502 15.7782 15.4689 15.7782H11.8971C11.6158 15.7782 11.3908 15.5532 11.3908 15.272V11.7001C11.3908 11.4188 11.6158 11.1938 11.8971 11.1938H15.4689C15.7502 11.1938 15.9752 11.4188 15.9752 11.7001V15.272Z"
                        fill=""
                      />
                    </svg>
                    Inicio
                  </NavLink>
                </li>
              </ul>
            </div>
          )}

          {user?.role === 'ADMIN' && (
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                ACADÉMICO
              </h3>
              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <NavLink
                    to="/admin/careers-semesters"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      (pathname.includes('/admin/careers-semesters') || pathname.includes('/admin/careers') || pathname.includes('/admin/semesters'))
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 fill-current"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span>Carreras y semestres</span>
                  </NavLink>
                  <NavLink
                    to="/admin/subjects-list"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      pathname.includes('/admin/subjects')
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 fill-current"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                         d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span>Asignaturas</span>
                  </NavLink>
                  <NavLink
                    to="/admin/enrollment/users/list"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      pathname.includes('/admin/enrollment/')
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 fill-current"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span>Inscripciones</span>
                  </NavLink>
                </li>
              </ul>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                GESTIÓN
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <NavLink
                    to="/admin/user-list"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      (pathname.includes('/admin/user-list') || pathname.includes('/admin/users'))
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 fill-current"
                    >
                      <path
                        fillRule="evenodd"
                         d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                         d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span>Usuarios</span>
                  </NavLink>
                  <NavLink
                    to="/admin/registration/users/list"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      pathname.includes('/admin/registration/')
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 fill-current"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span>Matrículas</span>
                  </NavLink>
                  <NavLink
                    to="/admin/groups/list"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      pathname.includes('/admin/groups')
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 fill-current">
                      <path d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h2.25A2.25 2.25 0 0 1 11.25 6.75v2.25A2.25 2.25 0 0 1 9 11.25H6.75A2.25 2.25 0 0 1 4.5 9V6.75ZM13.5 6.75A2.25 2.25 0 0 1 15.75 4.5h2.25A2.25 2.25 0 0 1 20.25 6.75v2.25A2.25 2.25 0 0 1 18 11.25h-2.25A2.25 2.25 0 0 1 13.5 9V6.75ZM4.5 15.75A2.25 2.25 0 0 1 6.75 13.5H9a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18v-2.25ZM13.5 15.75A2.25 2.25 0 0 1 15.75 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                    </svg>
                    <span>Grupos</span>
                  </NavLink>
                  <NavLink
                    to="/admin/assign-teacher"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      pathname.includes('/admin/assign-teacher')
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 fill-current">
                      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-7 9a7 7 0 0 1 14 0H5z" />
                    </svg>

                    <span>Asignar docente</span>
                  </NavLink>
                  <NavLink
                    to="/admin/study-plans"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      pathname === '/admin/study-plans'
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 fill-current"
                    >
                      <path d="M4.5 3.75A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V6a2.25 2.25 0 0 0-2.25-2.25h-15Zm0 1.5h15A.75.75 0 0 1 20.25 6v1.5H3.75V6a.75.75 0 0 1 .75-.75Zm-.75 3.75h16.5V18a.75.75 0 0 1-.75.75h-15A.75.75 0 0 1 3.75 18V9Zm3 1.5a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H6.75Zm0 3a.75.75 0 0 0 0 1.5h6.75a.75.75 0 0 0 0-1.5H6.75Z" />
                    </svg>

                    <span>Plan de estudios</span>
                  </NavLink>
                  <NavLink
                    to="/admin/study-plans/create"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      pathname.includes('/admin/study-plans/create')
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>

                    <span>Nuevo plan de estudios</span>
                  </NavLink>
                </li>
              </ul>
            </div>
          )}
                    {user?.role === 'STUDENT' && (
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                MI ESPACIO
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <NavLink
                    to="/students/evaluations/list"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      pathname.includes('students/evaluations/list')
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 fill-current"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span>Mis evaluaciones</span>
                  </NavLink>
                  <NavLink
                    to="/students/evaluations/grades/list"
                    className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${
                      pathname.includes('students/evaluations/grades')
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold'
                        : 'text-[#374151] font-medium dark:text-bodydark1'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 fill-current"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <span>Mis notas</span>
                  </NavLink>
                </li>
              </ul>
            </div>
          )}

          {/* Menú docente: solo rol TEACHER. Enlaces a rutas en routes/index (grupos, evaluaciones, rúbricas, escalas). */}
          {user?.role === 'TEACHER' && (
            <>
              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <NavLink to="/" className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${pathname === '/' || pathname.includes('/teachers/dashboard') ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold' : 'text-[#374151] font-medium dark:text-bodydark1'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span>Inicio</span>
                  </NavLink>
                </li>
              </ul>

              <div>
                <h3 className="mb-4 ml-4 text-[11px] font-semibold text-[#9CA3AF] tracking-wider uppercase">MI CLASE</h3>
                <ul className="mb-6 flex flex-col gap-1.5">
                  <li>
                    <NavLink to="/teachers/groups" className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${pathname.includes('/teachers/groups') ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold' : 'text-[#374151] font-medium dark:text-bodydark1'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                      <span>Grupos</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/teachers/students" className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${pathname.includes('/teachers/students') ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold' : 'text-[#374151] font-medium dark:text-bodydark1'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      <span>Estudiantes</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/evaluaciones" className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${pathname.includes('/teachers/evaluations') || pathname.includes('/evaluaciones') ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold' : 'text-[#374151] font-medium dark:text-bodydark1'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                      </svg>
                      <span>Evaluaciones</span>
                    </NavLink>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 ml-4 text-[11px] font-semibold text-[#9CA3AF] tracking-wider uppercase">RÚBRICAS</h3>
                <ul className="mb-6 flex flex-col gap-1.5">
                  <li>
                    <NavLink to="/teachers/rubrics/list" className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${pathname.includes('/teachers/rubrics') ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold' : 'text-[#374151] font-medium dark:text-bodydark1'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                      </svg>
                      <span>Rúbricas</span>
                    </NavLink>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 ml-4 text-[11px] font-semibold text-[#9CA3AF] tracking-wider uppercase">RECURSOS</h3>
                <ul className="mb-6 flex flex-col gap-1.5">
                  <li>
                    <NavLink to="/teachers/scales" className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${pathname.includes('/teachers/scales') ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold' : 'text-[#374151] font-medium dark:text-bodydark1'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
                      </svg>
                      <span>Escalas</span>
                    </NavLink>
                  </li>
                  {/* Biblioteca: enlace preparado; la ruta aún no está en routes/index */}
                  <li>
                    <NavLink to="/teachers/library" className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${pathname.includes('/teachers/library') ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold' : 'text-[#374151] font-medium dark:text-bodydark1'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                      </svg>
                      <span>Biblioteca</span>
                    </NavLink>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 ml-4 text-[11px] font-semibold text-[#9CA3AF] tracking-wider uppercase">CONFIGURACIÓN</h3>
                <ul className="mb-6 flex flex-col gap-1.5">
                  <li>
                    <NavLink to="/profile" className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${pathname.includes('/profile') ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold' : 'text-[#374151] font-medium dark:text-bodydark1'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      <span>Perfil</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/settings" className={`group relative flex items-center gap-2.5 py-2 px-4 text-[13px] duration-300 ease-in-out hover:bg-[#EDE9FE] hover:text-[#6D28D9] dark:hover:bg-meta-4 ${pathname.includes('/settings') ? 'bg-[#EDE9FE] text-[#6D28D9] border-l-[3px] border-[#6D28D9] font-semibold' : 'text-[#374151] font-medium dark:text-bodydark1'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      <span>Preferencias</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </>
          )}
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;