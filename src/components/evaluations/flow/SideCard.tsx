import { ReactNode } from 'react';

interface SideCardProps {
    title: string;
    children: ReactNode;
    className?: string;
}

export const SideCard = ({ title, children, className = '' }: SideCardProps) => (
    <div
        className={`rounded-lg border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark ${className}`}
    >
        <h4 className="mb-3 text-sm font-semibold text-black dark:text-white">{title}</h4>
        {children}
    </div>
);

interface ErrorBannerProps {
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const ErrorBanner = ({ title, message, actionLabel, onAction }: ErrorBannerProps) => (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
        <p className="font-semibold text-[#dc2626]">⊗ {title}</p>
        <p className="mt-1 text-sm text-red-800 dark:text-red-200">{message}</p>
        {actionLabel && onAction && (
            <button
                type="button"
                onClick={onAction}
                className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
                {actionLabel}
            </button>
        )}
    </div>
);
