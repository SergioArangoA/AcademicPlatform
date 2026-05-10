export default function UnauthorizedAcces() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          403
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Acceso no autorizado
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          No tienes permisos para acceder a esta página.
        </p>

        <button
          onClick={() => window.history.back()}
          className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Volver
        </button>
      </div>
    </div>
  );
}