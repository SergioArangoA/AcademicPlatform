/**

 * FILTRO DE RÚBRICAS PARA DOCENTES

 * --------------------------------

 * Una rúbrica puede estar en una evaluación (tiene rubric_id en alguna evaluación)

 * o ser una plantilla suelta (no aparece en ninguna evaluación).

 *

 * Reglas:

 * 1) "mine" (mis grupos): la rúbrica está en una evaluación de un grupo del docente.

 *    Solo la ve ese docente en la pestaña "Mis grupos".

 *

 * 2) "shared" (plantillas sin evaluación): la rúbrica NO está en ninguna evaluación.

 *    La ven todos los docentes (borrador, publicada o archivada).

 *    En la pestaña "Todas" solo se listan estas.

 *

 * 3) CU-10 (asociar rúbrica): además exige is_public === true (publicOnly).

 */

import { Rubric } from '../../models/Evaluation/Rubric';



export type EvaluationRubricLink = {

    rubric_id?: string | null;

    subject_id?: string | number | null;

    group_id?: string | number | null;

};



export type RubricVisibility = 'mine' | 'shared';



export type RubricFilterOptions = {

    evaluations: EvaluationRubricLink[];

    groupIds: Set<string>;

    /** Si true, solo rúbricas publicadas (pantalla asociar evaluación). */

    publicOnly?: boolean;

};



/** IDs de rúbricas usadas en al menos una evaluación (cualquier grupo). */

export function collectAllLinkedRubricIds(

    evaluations: EvaluationRubricLink[]

): Set<string> {

    const ids = new Set<string>();

    evaluations.forEach((ev) => {

        if (ev.rubric_id != null && ev.rubric_id !== '') {

            ids.add(String(ev.rubric_id));

        }

    });

    return ids;

}



/** IDs de rúbricas en evaluaciones de los grupos del docente logueado. */

export function collectRubricIdsFromTeacherEvaluations(

    evaluations: EvaluationRubricLink[],

    groupIds: Set<string>

): Set<string> {

    const ids = new Set<string>();

    if (groupIds.size === 0) return ids;



    evaluations.forEach((ev) => {

        const groupId = ev.group_id != null ? String(ev.group_id) : '';

        const rubricId =

            ev.rubric_id != null && ev.rubric_id !== '' ? String(ev.rubric_id) : '';

        if (!groupId || !groupIds.has(groupId) || !rubricId) return;

        ids.add(rubricId);

    });



    return ids;

}



/** @deprecated Usar collectRubricIdsFromTeacherEvaluations */

export function collectRubricIdsFromEvaluations(

    _subjectIds: Set<string>,

    evaluations: EvaluationRubricLink[],

    groupIds?: Set<string>

): Set<string> {

    return collectRubricIdsFromTeacherEvaluations(

        evaluations,

        groupIds ?? new Set<string>()

    );

}



export type RubricWithVisibility<T extends Rubric = Rubric> = T & {

    visibility: RubricVisibility;

};



/**

 * Devuelve las rúbricas que el docente puede ver, con etiqueta mine | shared.

 *

 * Paso a paso por cada rúbrica del API:

 * - Si su id está en una evaluación de MIS grupos → mine.

 * - Si su id NO está en ninguna evaluación → shared (plantilla para todos).

 * - Si está en evaluación de otro grupo (solo global) → no se muestra.

 */

export function filterRubricsVisibleToTeacher<T extends Rubric>(

    rubrics: T[],

    options: RubricFilterOptions

): RubricWithVisibility<T>[] {

    const { evaluations, groupIds, publicOnly } = options;

    const globallyLinked = collectAllLinkedRubricIds(evaluations);

    const mineIds = collectRubricIdsFromTeacherEvaluations(evaluations, groupIds);



    const result: RubricWithVisibility<T>[] = [];



    rubrics.forEach((rubric) => {

        const rubricId = rubric.id != null ? String(rubric.id) : '';

        if (!rubricId) return;



        if (mineIds.has(rubricId)) {

            if (publicOnly && !rubric.is_public) return;

            result.push({ ...rubric, visibility: 'mine' });

            return;

        }



        if (!globallyLinked.has(rubricId)) {

            if (publicOnly && !rubric.is_public) return;

            result.push({ ...rubric, visibility: 'shared' });

        }

    });



    return result;

}



/** Solo plantillas sin evaluación (pestaña "Todas" del listado). */

export function filterRubricsWithoutEvaluation<T extends Rubric>(

    rubrics: RubricWithVisibility<T>[]

): RubricWithVisibility<T>[] {

    return rubrics.filter((r) => r.visibility === 'shared');

}



/** @deprecated Usar filterRubricsVisibleToTeacher */

export function filterRubricsForTeacher<T extends Rubric>(

    rubrics: T[],

    options: RubricFilterOptions

): T[] {

    return filterRubricsVisibleToTeacher(rubrics, options);

}



export function buildRubricSubjectLabelMap(

    evaluations: EvaluationRubricLink[],

    groupIds: Set<string>,

    subjectLabelById: Map<string, string>,

    groupSubjectById: Map<string, string>

): Map<string, string> {

    const labels = new Map<string, string>();



    evaluations.forEach((ev) => {

        const groupId = ev.group_id != null ? String(ev.group_id) : '';

        const rubricId =

            ev.rubric_id != null && ev.rubric_id !== '' ? String(ev.rubric_id) : '';

        if (!groupId || !groupIds.has(groupId) || !rubricId) return;



        const subjectId =

            (ev.subject_id != null ? String(ev.subject_id) : '') ||

            groupSubjectById.get(groupId) ||

            '';



        if (subjectId && subjectLabelById.has(subjectId)) {

            labels.set(rubricId, subjectLabelById.get(subjectId)!);

        }

    });



    return labels;

}



export function buildRubricSubjectIdMap(

    evaluations: EvaluationRubricLink[],

    groupIds: Set<string>,

    groupSubjectById: Map<string, string>

): Map<string, string> {

    const map = new Map<string, string>();



    evaluations.forEach((ev) => {

        const groupId = ev.group_id != null ? String(ev.group_id) : '';

        const rubricId =

            ev.rubric_id != null && ev.rubric_id !== '' ? String(ev.rubric_id) : '';

        if (!groupId || !groupIds.has(groupId) || !rubricId) return;



        const subjectId =

            (ev.subject_id != null ? String(ev.subject_id) : '') ||

            groupSubjectById.get(groupId) ||

            '';



        if (subjectId) map.set(rubricId, subjectId);

    });



    return map;

}



export async function ensureRubricsLoaded(

    apiRubrics: Rubric[],

    rubricIds: Set<string>,

    getRubricById: (id: string) => Promise<Rubric | null>

): Promise<Rubric[]> {

    const byId = new Map<string, Rubric>();

    apiRubrics.forEach((r) => {

        if (r.id != null) byId.set(String(r.id), r);

    });



    const missing = [...rubricIds].filter((id) => !byId.has(id));

    if (missing.length > 0) {

        const fetched = await Promise.all(missing.map((id) => getRubricById(id)));

        fetched.forEach((r) => {

            if (r?.id != null) byId.set(String(r.id), r);

        });

    }



    return [...byId.values()];

}



/** @deprecated Usar ensureRubricsLoaded + filterRubricsVisibleToTeacher */

export async function mergeRubricsFromTeacherEvaluations(

    apiRubrics: Rubric[],

    evaluations: EvaluationRubricLink[],

    groupIds: Set<string>,

    getRubricById: (id: string) => Promise<Rubric | null>

): Promise<Rubric[]> {

    const mineIds = collectRubricIdsFromTeacherEvaluations(evaluations, groupIds);

    const loaded = await ensureRubricsLoaded(apiRubrics, mineIds, getRubricById);

    return filterRubricsVisibleToTeacher(loaded, { evaluations, groupIds });

}


