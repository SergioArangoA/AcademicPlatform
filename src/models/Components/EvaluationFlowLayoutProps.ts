import { ReactNode } from "react";
import { WizardStep } from "./WizardStep";

export interface EvaluationFlowLayoutProps {
  pageTitle: string;
  steps: WizardStep[];
  main: ReactNode;
  sidebar: ReactNode;
  footer: ReactNode;
  bottomBanners?: ReactNode;
}
