/**
 * Layout con pasos del wizard para el docente: asociar rúbrica y calificar (CU-10/11).
 */
import { ReactNode } from 'react';
import { Check } from 'lucide-react';

import { WizardStep } from '../../../models/Components/WizardStep';
import { EvaluationFlowLayoutProps } from '../../../models/Components/EvaluationFlowLayoutProps';

const EvaluationFlowLayout = ({
    pageTitle,
    steps,
    main,
    sidebar,
    footer,
    bottomBanners,
}: EvaluationFlowLayoutProps) => (
    <div className="flex min-h-0 flex-col gap-5 pb-28">
        <div>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">{pageTitle}</h2>
            <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {steps.map((step, index) => (
                    <div key={step.label} className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${
                                step.active
                                    ? 'bg-[#6366f1] text-white'
                                    : step.done
                                      ? 'bg-[#ede9fe] text-[#6366f1]'
                                      : 'bg-gray-100 text-gray-500 dark:bg-meta-4 dark:text-bodydark'
                            }`}
                        >
                            {step.done && !step.active ? (
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            ) : (
                                <span className="text-xs">{index + 1}</span>
                            )}
                            {step.label}
                        </span>
                        {index < steps.length - 1 && (
                            <span className="text-gray-300 dark:text-gray-600">→</span>
                        )}
                    </div>
                ))}
            </nav>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">{main}</div>
            <aside className="w-full shrink-0 space-y-4 lg:w-[260px]">{sidebar}</aside>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-stroke bg-white px-4 py-4 shadow-lg dark:border-strokedark dark:bg-boxdark lg:pl-[290px]">
            <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3">
                {footer}
            </div>
        </div>

        {bottomBanners && (
            <div className="fixed bottom-[72px] left-0 right-0 z-30 px-4 lg:pl-[290px]">
                <div className="mx-auto grid max-w-screen-2xl gap-3 md:grid-cols-2">{bottomBanners}</div>
            </div>
        )}
    </div>
);

export default EvaluationFlowLayout;
