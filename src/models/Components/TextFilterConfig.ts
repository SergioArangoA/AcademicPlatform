import { BaseFilterConfig } from "./BaseFilterConfig";

export interface TextFilterConfig extends BaseFilterConfig {
	type: "text";
	placeholder?: string;
}
