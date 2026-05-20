/**
 * Asociación manual rúbrica ↔ evaluación (CU-10): solo PUT desde pantalla Asociar rúbrica.
 * No se enlaza automáticamente al crear rúbrica ni al crear evaluación sin rúbrica.
 */
import { Evaluation } from '../models/Evaluation/Evaluation';
import { evaluationService } from '../services/evaluationService';
import { UpdateEvaluationPayload } from '../models/Services/UpdateEvaluationPayload';


/** CU-10: PUT evaluación con rubric_id (Postman «Update Evaluation»). */
export async function linkRubricToEvaluation(
  evaluation: Evaluation,
  rubricId: string
): Promise<Evaluation> {
  if (!evaluation.id) {
    throw new Error('La evaluación no tiene id.');
  }

  const subjectId =
    evaluation.subject_id != null ? String(evaluation.subject_id) : '';
  const groupId =
    evaluation.group_id != null ? String(evaluation.group_id) : '';

  if (!subjectId || !groupId) {
    throw new Error('La evaluación debe tener subject_id y group_id.');
  }

  const body: UpdateEvaluationPayload = {
    subject_id: subjectId,
    group_id: groupId,
    rubric_id: rubricId,
    name: evaluation.name,
    description: evaluation.description ?? '',
    weight: Number(evaluation.weight ?? 0),
  };

  return evaluationService.updateEvaluation(String(evaluation.id), body);
}
