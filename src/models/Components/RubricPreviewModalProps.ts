import { Rubric } from "../Evaluation/Rubric";

export interface RubricPreviewModalProps {
  rubric: Rubric | null;
  open: boolean;
  onClose: () => void;
}
