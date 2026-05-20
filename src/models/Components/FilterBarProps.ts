import { FilterConfig, FilterValues } from "../../components/FilterBar";

export interface FilterBarProps {
	filters: FilterConfig[];
	values: FilterValues;
	onChange: (key: string, value: string) => void;
	onClear: () => void;
}
