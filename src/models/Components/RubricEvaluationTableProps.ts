import { Criterion } from "../Evaluation/Criterion";
import { Scale } from "../Evaluation/Scale";

export interface RubricEvaluationTableProps {
  criteria: Criterion[];
  scales: Scale[];
}
