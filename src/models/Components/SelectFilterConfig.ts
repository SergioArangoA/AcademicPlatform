import { BaseFilterConfig } from "./BaseFilterConfig";

export type SelectOption = string | { value: string; label: string };

export interface SelectFilterConfig extends BaseFilterConfig {
	type: "select";
	options: SelectOption[];
}
