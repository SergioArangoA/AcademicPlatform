import { DropdownProps } from "../models/Components/DropdownProps";

export default function DropdownForm<T>({
  title,
  options,
  value,
  onChange,
  labelKey,
  valueKey,
}: DropdownProps<T>) {

  return (
    <div className="flex flex-col gap-2">

      {/* Label */}
      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
        {title}
      </label>

      {/* Select */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-xl
          border
          border-gray-300

          bg-white
          text-gray-900

          dark:bg-gray-800
          dark:text-gray-100
          dark:border-gray-600

          px-4
          py-2

          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      >
        <option
          value=""
          className="text-gray-500 dark:text-gray-400"
        >
          Seleccione una opción
        </option>

        {options.map((option, index) => (
          <option
            key={index}
            value={String(option[valueKey])}
          >
            {String(option[labelKey])}
          </option>
        ))}

      </select>

    </div>
  );
}