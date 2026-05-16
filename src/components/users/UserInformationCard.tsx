import { UserForList } from "../../models/Users/UserForList";
export default function UserCard(user: UserForList) {
  const isActive = user.is_active;

  return (
    <div
      className={`
        flex
        items-center
        justify-between
        p-4
        rounded-xl
        shadow-md
        border
        transition

        ${
          isActive
            ? "bg-green-100 border-green-400 dark:bg-green-900 dark:border-green-600"
            : "bg-red-100 border-red-400 dark:bg-red-900 dark:border-red-600"
        }
      `}
    >

      {/* IZQUIERDA */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {user.name}
        </h2>

        <p className="text-sm text-gray-700 dark:text-gray-300">
          ID: {user.code}
        </p>

        <p className="text-sm text-gray-700 dark:text-gray-300">
          Email: {user.email}
        </p>
      </div>

      {/* ESTADO */}
      <div className="text-right">
        <span
          className={`
            px-3
            py-1
            rounded-full
            text-sm
            font-semibold
            text-white

            ${
              isActive
                ? "bg-green-600 dark:bg-green-700"
                : "bg-red-600 dark:bg-red-700"
            }
          `}
        >
          {isActive ? "Activo" : "Inactivo"}
        </span>
      </div>

    </div>
  );
}