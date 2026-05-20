import { FilterConfig } from "../../components/FilterBar";

export interface FilterInputProps {
	config: FilterConfig;
	value: string;
	onChange: (key: string, value: string) => void;
}
