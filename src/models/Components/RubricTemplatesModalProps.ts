import { LocalCriterionDraft } from "./LocalCriterionDraft";

export interface RubricTemplatesModalProps {
  open: boolean;
  teacherId: string;
  onClose: () => void;
  onApply: (criteria: LocalCriterionDraft[]) => void;
}
