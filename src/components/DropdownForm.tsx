interface DropdownProps<T> {
  title: string;
  options: T[];
  value: string;
  onChange: (value: string) => void;

  labelKey: keyof T;
  valueKey: keyof T;
}

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

      <label className="text-sm font-medium">
        {title}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-xl
          border
          border-gray-300
          bg-white
          px-4
          py-2
        "
      >
        <option value="">
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