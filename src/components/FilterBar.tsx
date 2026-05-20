import React from "react";
import { BaseFilterConfig } from "../models/Components/BaseFilterConfig";
import { TextFilterConfig } from "../models/Components/TextFilterConfig";
import { SelectFilterConfig, SelectOption } from "../models/Components/SelectFilterConfig";
import { FilterBarProps } from "../models/Components/FilterBarProps";
import { FilterInputProps } from "../models/Components/FilterInputProps";

// ─── Types ───────────────────────────────────────────────────────────────────

export type { BaseFilterConfig, TextFilterConfig, SelectFilterConfig, SelectOption };

export type FilterConfig = TextFilterConfig | SelectFilterConfig;

export type FilterValues = Record<string, string>;

// ─── Icons ───────────────────────────────────────────────────────────────────

const SearchIcon = () => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-gray-400"
    >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const ChevronIcon = () => (
    <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-2.5 text-gray-400"
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const ResetIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
    </svg>
);

// ─── FilterInput ─────────────────────────────────────────────────────────────

const FilterInput: React.FC<FilterInputProps> = ({ config, value, onChange }) => {
    if (config.type === "text") {
        return (
            <div className="flex flex-1 min-w-[200px] items-center gap-2 h-[38px] rounded-lg border border-stroke bg-gray-2 px-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 dark:border-strokedark dark:bg-meta-4">
                <SearchIcon />
                <input
                    type="text"
                    placeholder={config.placeholder ?? `Buscar ${config.label}…`}
                    value={value}
                    onChange={(e) => onChange(config.key, e.target.value)}
                    className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-400 dark:text-white"
                />
            </div>
        );
    }

    if (config.type === "select") {
        const getOptionValue = (opt: SelectOption) =>
            typeof opt === "string" ? opt : opt.value;
        const getOptionLabel = (opt: SelectOption) =>
            typeof opt === "string" ? opt : opt.label;

        return (
            <div className="flex flex-col gap-1 shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 pl-0.5">
                    {config.label}
                </span>
                <div className="relative flex items-center">
                    <select
                        value={value}
                        onChange={(e) => onChange(config.key, e.target.value)}
                        className="h-[36px] min-w-[120px] appearance-none rounded-lg border border-stroke bg-gray-2 pl-3 pr-8 text-sm font-medium text-black outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-strokedark dark:bg-meta-4 dark:text-white cursor-pointer"
                    >
                        {config.options.map((opt) => (
                            <option key={getOptionValue(opt)} value={getOptionValue(opt)}>
                                {getOptionLabel(opt)}
                            </option>
                        ))}
                    </select>
                    <ChevronIcon />
                </div>
            </div>
        );
    }

    return null;
};

// ─── FilterBar ────────────────────────────────────────────────────────────────

const FilterBar: React.FC<FilterBarProps> = ({ filters, values, onChange, onClear }) => {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-sm border border-stroke bg-white px-4 py-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            {filters.map((filter, index) => (
                <React.Fragment key={filter.key}>
                    <FilterInput
                        config={filter}
                        value={values[filter.key] ?? ""}
                        onChange={onChange}
                    />
                    {index < filters.length - 1 && filter.type !== "text" && (
                        <div className="h-7 w-px bg-stroke dark:bg-strokedark shrink-0" />
                    )}
                </React.Fragment>
            ))}

            <button
                type="button"
                onClick={onClear}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-stroke bg-white px-3 h-[36px] text-sm font-medium text-black transition hover:bg-gray-2 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4"
            >
                <ResetIcon />
                Limpiar filtros
            </button>
        </div>
    );
};

export default FilterBar;