const PageSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-10 w-2/3 rounded-lg bg-gray-200 dark:bg-meta-4" />
        <div className="flex gap-6">
            <div className="flex-1 space-y-4">
                <div className="h-32 rounded-lg bg-gray-200 dark:bg-meta-4" />
                <div className="h-64 rounded-lg bg-gray-200 dark:bg-meta-4" />
            </div>
            <div className="hidden w-[260px] shrink-0 space-y-4 lg:block">
                <div className="h-40 rounded-lg bg-gray-200 dark:bg-meta-4" />
                <div className="h-32 rounded-lg bg-gray-200 dark:bg-meta-4" />
            </div>
        </div>
    </div>
);

export default PageSkeleton;
