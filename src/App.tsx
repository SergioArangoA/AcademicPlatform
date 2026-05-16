/*
 * Archivo principal App.tsx
 * Se modifico la ruta raiz para utilizar DashboardIndex, permitiendo asi
 * mostrar una pantalla de inicio distinta dependiendo del rol del usuario.
 */
import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import DashboardIndex from './pages/Dashboard/Index';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Loader from './common/Loader';
import routes from './routes';

import ProtectedRoute from "../src/components/Auth/ProtectedRoute";

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));

function App() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />
      <Routes>
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />

        <Route element={<DefaultLayout />}>
          <Route index element={<DashboardIndex />} />
          <Route
            path="/admin/groups"
            element={<Navigate to="/admin/groups/list" replace />}
          />
          <Route
            path="/teachers/rubrics"
            element={<Navigate to="/teachers/rubrics/list" replace />}
          />
          {routes.map((routes, index) => {
            const { path, component: Component, allowedRoles } = routes;
            return (
              <Route
                key={index}
                path={path}
                element={
                  <Suspense fallback={<Loader />}>
                    <ProtectedRoute allowedRoles={allowedRoles}>
                      <Component />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
            );
          })}
        </Route>
      </Routes>
    </>
  );
}

export default App;


