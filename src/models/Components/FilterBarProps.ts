import { FilterConfig, FilterValues } from "./FilterConfig";

export interface FilterBarProps {
	filters: FilterConfig[];
	values: FilterValues;
	onChange: (key: string, value: string) => void;
	onClear: () => void;
}
