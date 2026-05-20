import { TextFilterConfig } from "./TextFilterConfig";
import { SelectFilterConfig, SelectOption } from "./SelectFilterConfig";

export type { TextFilterConfig, SelectFilterConfig, SelectOption };

export type FilterConfig = TextFilterConfig | SelectFilterConfig;

export type FilterValues = Record<string, string>;
