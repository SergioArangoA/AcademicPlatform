import { FilterConfig } from "./FilterConfig";

export interface FilterInputProps {
	config: FilterConfig;
	value: string;
	onChange: (key: string, value: string) => void;
}
