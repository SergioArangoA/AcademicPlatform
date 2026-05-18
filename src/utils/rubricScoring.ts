import { Criterion } from "../models/Evaluation/Criterion";
import { Scale } from "../models/Evaluation/Scale";
import { getCriterionWeight } from "./criterionWeight";

/** Puntaje ponderado: valor × (peso / 100), igual que el backend. */
export function weightedScore(scaleValue: number, criterionWeight: number): number {
    return Number((scaleValue * (criterionWeight / 100)).toFixed(4));
}

export function calculateFinalScoreFromSelections(
    criteria: Criterion[],
    selections: Record<string, { scaleId: string; scaleValue: number }>
): number {
    let total = 0;
    for (const criterion of criteria) {
        const key = String(criterion.id ?? "");
        const sel = selections[key];
        if (!sel?.scaleId) continue;
        total += weightedScore(sel.scaleValue, getCriterionWeight(criterion));
    }
    return Number(total.toFixed(2));
}

export function scalesByCriterion(scales: Scale[], criterionId: string): Scale[] {
    return scales.filter((s) => String(s.criterion_id) === String(criterionId));
}

export function validateCriterionWeights(criteria: Criterion[]): {
    valid: boolean;
    total: number;
    diff: number;
} {
    const total = Number(
        criteria.reduce((acc, c) => acc + getCriterionWeight(c), 0).toFixed(2)
    );
    const diff = Number((100 - total).toFixed(2));
    return { valid: total === 100, total, diff };
}

export function validateScalesForPublish(
    criteria: Criterion[],
    scales: Scale[]
): { ready: boolean; issues: string[] } {
    const issues: string[] = [];
    if (criteria.length === 0) {
        issues.push("La rúbrica no tiene criterios.");
    }
    const weightCheck = validateCriterionWeights(criteria);
    if (!weightCheck.valid) {
        issues.push(
            `La suma de pesos es ${weightCheck.total} % (debe ser 100 %; diferencia: ${weightCheck.diff > 0 ? "faltan" : "sobran"} ${Math.abs(weightCheck.diff)} %).`
        );
    }
    for (const c of criteria) {
        const count = scalesByCriterion(scales, String(c.id)).length;
        if (count < 2) {
            issues.push(`«${c.name}» tiene menos de 2 escalas (${count}).`);
        } else if (count > 5) {
            issues.push(`«${c.name}» tiene más de 5 escalas (${count}).`);
        }
    }
    return { ready: issues.length === 0, issues };
}
