export interface DropdownProps<T> {
	title: string;
	options: T[];
	value: string;
	onChange: (value: string) => void;
	labelKey: keyof T;
	valueKey: keyof T;
}
