/**
 * El backend no persiste subject_id en rubrics.
 * Índice por asignatura: cualquier docente con un grupo de esa asignatura ve las mismas rúbricas.
 */
const LEGACY_TEACHER_KEY = 'edugest_teacher_rubric_ownership';
const SUBJECT_INDEX_KEY = 'edugest_subject_rubric_index';
const RUBRIC_META_KEY = 'edugest_rubric_subject_meta';

export interface RubricOwnershipRecord {
    teacher_id?: string;
    subject_id: string;
    created_at: string;
}

type LegacyOwnershipMap = Record<string, RubricOwnershipRecord>;
type SubjectIndex = Record<string, string[]>;
type RubricMetaMap = Record<string, RubricOwnershipRecord>;

let legacyMigrated = false;

function readSubjectIndex(): SubjectIndex {
    try {
        const raw = localStorage.getItem(SUBJECT_INDEX_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as SubjectIndex;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeSubjectIndex(index: SubjectIndex): void {
    localStorage.setItem(SUBJECT_INDEX_KEY, JSON.stringify(index));
}

function readRubricMeta(): RubricMetaMap {
    try {
        const raw = localStorage.getItem(RUBRIC_META_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as RubricMetaMap;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeRubricMeta(meta: RubricMetaMap): void {
    localStorage.setItem(RUBRIC_META_KEY, JSON.stringify(meta));
}

function readLegacyMap(): LegacyOwnershipMap {
    try {
        const raw = localStorage.getItem(LEGACY_TEACHER_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as LegacyOwnershipMap;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

/** Migra registros antiguos (por docente) al índice por asignatura. */
export function migrateLegacyOwnershipToSubjectIndex(): void {
    if (legacyMigrated) return;
    legacyMigrated = true;

    const legacy = readLegacyMap();
    const index = readSubjectIndex();
    const meta = readRubricMeta();
    let changed = false;

    Object.entries(legacy).forEach(([rubricId, record]) => {
        const subjectId = record.subject_id ? String(record.subject_id) : '';
        if (!subjectId) return;
        const list = index[subjectId] ?? [];
        if (!list.includes(rubricId)) {
            index[subjectId] = [...list, rubricId];
            changed = true;
        }
        if (!meta[rubricId]) {
            meta[rubricId] = {
                subject_id: subjectId,
                teacher_id: record.teacher_id,
                created_at: record.created_at ?? new Date().toISOString(),
            };
            changed = true;
        }
    });

    if (changed) {
        writeSubjectIndex(index);
        writeRubricMeta(meta);
    }
}

function addRubricToSubjectIndex(rubricId: string, subjectId: string): void {
    const sid = String(subjectId).trim();
    if (!sid) return;
    const index = readSubjectIndex();
    const list = index[sid] ?? [];
    if (!list.includes(rubricId)) {
        index[sid] = [...list, rubricId];
        writeSubjectIndex(index);
    }
}

/** Registra la rúbrica bajo la asignatura (visible para todos los docentes de esa asignatura). */
export function registerRubricForSubject(
    rubricId: string,
    subjectId: string,
    createdByTeacherId?: string
): void {
    if (!rubricId || !subjectId) return;
    const id = String(rubricId);
    const sid = String(subjectId);

    addRubricToSubjectIndex(id, sid);

    const meta = readRubricMeta();
    meta[id] = {
        subject_id: sid,
        teacher_id: createdByTeacherId,
        created_at: new Date().toISOString(),
    };
    writeRubricMeta(meta);

    const legacy = readLegacyMap();
    legacy[id] = meta[id];
    localStorage.setItem(LEGACY_TEACHER_KEY, JSON.stringify(legacy));
}

/** @deprecated Usar registerRubricForSubject */
export function registerTeacherRubricForMatchIds(
    rubricId: string,
    _teacherMatchIds: Set<string>,
    subjectId?: string
): void {
    if (!subjectId) return;
    const ownerId = Array.from(_teacherMatchIds).find(Boolean);
    registerRubricForSubject(rubricId, subjectId, ownerId);
}

/** @deprecated Usar registerRubricForSubject */
export function registerTeacherRubric(
    rubricId: string,
    data: { teacher_id: string; subject_id?: string }
): void {
    if (!data.subject_id) return;
    registerRubricForSubject(rubricId, data.subject_id, data.teacher_id);
}

export function getRubricOwnership(rubricId: string): RubricOwnershipRecord | null {
    migrateLegacyOwnershipToSubjectIndex();
    const meta = readRubricMeta();
    return meta[String(rubricId)] ?? null;
}

/** IDs de rúbricas vinculadas a las asignaturas del docente (índice local). */
export function getRubricIdsForSubjects(subjectIds: Set<string>): Set<string> {
    migrateLegacyOwnershipToSubjectIndex();
    if (subjectIds.size === 0) return new Set();

    const index = readSubjectIndex();
    const ids = new Set<string>();
    subjectIds.forEach((subjectId) => {
        (index[subjectId] ?? []).forEach((rubricId) => ids.add(rubricId));
    });
    return ids;
}

/** Índice local + evaluaciones que ya tienen rubric_id y subject_id en el API. */
export function collectRubricIdsForTeacherSubjects(
    subjectIds: Set<string>,
    evaluations?: Array<{ rubric_id?: string | null; subject_id?: string | number | null }>
): Set<string> {
    const ids = getRubricIdsForSubjects(subjectIds);
    if (!evaluations) return ids;

    evaluations.forEach((ev) => {
        const subjectId = ev.subject_id != null ? String(ev.subject_id) : '';
        const rubricId = ev.rubric_id != null && ev.rubric_id !== '' ? String(ev.rubric_id) : '';
        if (subjectId && rubricId && subjectIds.has(subjectId)) {
            ids.add(rubricId);
        }
    });
    return ids;
}

/** @deprecated Usar getRubricIdsForSubjects / collectRubricIdsForTeacherSubjects */
export function getOwnedRubricIdsForTeacher(teacherMatchIds: Set<string>): Set<string> {
    migrateLegacyOwnershipToSubjectIndex();
    const owned = new Set<string>();
    const legacy = readLegacyMap();
    Object.entries(legacy).forEach(([rubricId, record]) => {
        if (record.teacher_id && teacherMatchIds.has(String(record.teacher_id))) {
            owned.add(rubricId);
        }
    });
    return owned;
}

export function enrichRubricWithOwnership<T extends {
    id?: string;
    teacher_id?: string;
    subject_id?: string | number;
}>(rubric: T): T {
    if (!rubric.id) return rubric;
    const record = getRubricOwnership(String(rubric.id));
    if (!record) return rubric;
    return {
        ...rubric,
        teacher_id: rubric.teacher_id ?? record.teacher_id,
        subject_id: rubric.subject_id ?? record.subject_id,
    };
}
