/**
 * Contexto de asignatura/grupo de una rúbrica vía evaluaciones (el API no expone subject_id en Rubric).
 */
import { Group } from '../models/Groups/Group';
import { Evaluation } from '../models/Evaluation/Evaluation';
import { evaluationService } from '../services/evaluationService';
import { groupService } from '../services/groupService';
import { subjectService } from '../services/subjectService';

export type RubricEvaluationContext = {
  evaluation: Evaluation;
  subjectId: string;
  groupId: string;
  subjectLabel: string;
  groupLabel: string;
};

export function findEvaluationForRubric(
  rubricId: string,
  evaluations: Evaluation[]
): Evaluation | undefined {
  return evaluations.find(
    (ev) => ev.rubric_id != null && String(ev.rubric_id) === String(rubricId)
  );
}

export async function getRubricEvaluationContext(
  rubricId: string
): Promise<RubricEvaluationContext | null> {
  const [evaluations, groups] = await Promise.all([
    evaluationService.getEvaluations(),
    groupService.getGroups(),
  ]);

  const evaluation = findEvaluationForRubric(rubricId, evaluations);
  if (!evaluation) return null;

  const groupId =
    evaluation.group_id != null ? String(evaluation.group_id) : '';
  const group = groups.find((g) => String(g.id) === groupId);
  const subjectId =
    (evaluation.subject_id != null ? String(evaluation.subject_id) : '') ||
    (group?.subject_id != null ? String(group.subject_id) : '');

  let subjectLabel = '—';
  if (subjectId) {
    const subject = await subjectService.getSubjectById(subjectId);
    subjectLabel = subject ? `${subject.code} — ${subject.name}` : subjectId;
  }

  const groupLabel =
    group?.name ?? group?.group_code ?? (groupId ? groupId : '—');

  return {
    evaluation,
    subjectId,
    groupId,
    subjectLabel,
    groupLabel,
  };
}

export function buildGroupSubjectMap(groups: Group[]): Map<string, string> {
  const map = new Map<string, string>();
  groups.forEach((g) => {
    if (g.id != null && g.subject_id != null) {
      map.set(String(g.id), String(g.subject_id));
    }
  });
  return map;
}
