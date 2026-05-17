import { User as AppUser } from '../models/User';
import { User as FirebaseUser } from 'firebase/auth';
import { Group } from '../models/Groups/Group';
import { Semester } from '../models/Semesters/Semester';
import { Subject } from '../models/Subjects/Subject';
import { Teacher } from '../models/Teachers/Teacher';
import { groupService, GroupWithMeta } from '../services/groupService';
import { enrollmentService, Enrollment } from '../services/enrollmentService';
import { semesterService } from '../services/semesterService';
import { subjectService } from '../services/subjectService';
import { userPService } from '../services/userPService';
import { Criterion } from '../models/Evaluation/Criterion';
import { Rubric } from '../models/Evaluation/Rubric';
import { Scale } from '../models/Evaluation/Scale';
import { criterionService } from '../services/criterionService';
import { rubricService } from '../services/rubricService';
import { scaleService } from '../services/scaleService';
import { getAuthUserId } from './authUser';
import { resolveTeacherRecord } from './resolveTeacherId';
import { transformUsersForList } from './userTransformers';

type AuthUser = FirebaseUser | AppUser | null;

export interface TeacherGroupRow extends GroupWithMeta {
    subject_label: string;
    semester_label: string;
    capacity_label: string;
}

export interface TeacherStudentRow {
    enrollment_id: string;
    student_id: string;
    student_code: string;
    student_name: string;
    student_email: string;
    group_label: string;
    subject_label: string;
    status: string;
}

export interface TeacherScaleRow {
    id: string;
    rubric_id: string;
    rubric_title: string;
    criterion_id: string;
    criterion_name: string;
    scale_name: string;
    scale_description: string;
    scale_value: number;
    rubric_status: string;
}

function rubricBelongsToTeacher(rubric: Rubric, matchIds: Set<string>): boolean {
    if (!rubric.teacher_id) return true;
    return matchIds.has(String(rubric.teacher_id));
}

/** IDs que pueden aparecer en group.teacher_id o en el usuario autenticado */
export function collectTeacherMatchIds(teacher: Teacher | null, user: AuthUser): Set<string> {
    const ids = new Set<string>();

    if (teacher?.id) ids.add(String(teacher.id));
    if (teacher?.user_id) ids.add(String(teacher.user_id));
    if (teacher?.identification) ids.add(String(teacher.identification));

    const authId = getAuthUserId(user);
    if (authId) ids.add(authId);

    const u = user as AppUser;
    if (u?.id) ids.add(String(u.id));
    if (u?.user_id) ids.add(String(u.user_id));
    if (u?.identification) ids.add(String(u.identification));
    if (u?.code) ids.add(String(u.code));

    return ids;
}

function groupBelongsToTeacher(group: Group, matchIds: Set<string>): boolean {
    if (!group.teacher_id || matchIds.size === 0) return false;
    return matchIds.has(String(group.teacher_id));
}

function mapGroupRow(
    group: GroupWithMeta,
    subjectMap: Map<string, Subject>,
    semesterMap: Map<string, Semester>
): TeacherGroupRow {
    const subject = group.subject_id ? subjectMap.get(String(group.subject_id)) : undefined;
    const semester = group.semester_id ? semesterMap.get(String(group.semester_id)) : undefined;
    const enrolled = group.enrolled_count ?? 0;
    const capacity = group.capacity ?? 0;

    return {
        ...group,
        subject_label: subject ? `${subject.code} — ${subject.name}` : '—',
        semester_label: semester?.name ?? '—',
        capacity_label: `${enrolled} / ${capacity} (disp. ${group.available_capacity ?? 0})`,
    };
}

export async function loadTeacherGroupsData(user: AuthUser): Promise<{
    teacherId: string | null;
    groups: TeacherGroupRow[];
    subjects: Subject[];
    semesters: Semester[];
    error: string | null;
}> {
    try {
        const teacher = await resolveTeacherRecord(user);
        const teacherId = teacher?.id ? String(teacher.id) : null;
        const matchIds = collectTeacherMatchIds(teacher, user);

        const [allGroups, subjectsRaw, semestersRaw] = await Promise.all([
            groupService.getGroupsWithMeta(),
            subjectService.getSubjects(),
            semesterService.getSemesters(),
        ]);

        const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];
        const semesters = Array.isArray(semestersRaw) ? semestersRaw : [];
        const groupsSource = Array.isArray(allGroups) ? allGroups : [];

        const subjectMap = new Map<string, Subject>();
        subjects.forEach((s) => {
            if (s.id != null) subjectMap.set(String(s.id), s);
        });

        const semesterMap = new Map<string, Semester>();
        semesters.forEach((s) => {
            if (s.id != null) semesterMap.set(String(s.id), s);
        });

        const groups = groupsSource
            .filter((g) => groupBelongsToTeacher(g, matchIds))
            .map((g) => mapGroupRow(g, subjectMap, semesterMap));

        return { teacherId, groups, subjects, semesters, error: null };
    } catch (error) {
        console.error('Error al cargar grupos del docente:', error);
        return {
            teacherId: null,
            groups: [],
            subjects: [],
            semesters: [],
            error: 'No se pudieron cargar los grupos. Verifica que el backend esté activo.',
        };
    }
}

export async function loadTeacherStudentsData(user: AuthUser): Promise<{
    rows: TeacherStudentRow[];
    error: string | null;
}> {
    try {
        const { groups, subjects, error } = await loadTeacherGroupsData(user);
        if (error) return { rows: [], error };
        if (groups.length === 0) return { rows: [], error: null };

        const groupIds = new Set(groups.map((g) => String(g.id)));
        const groupMap = new Map<string, Group>();
        groups.forEach((g) => groupMap.set(String(g.id), g));

        const subjectMap = new Map<string, Subject>();
        subjects.forEach((s) => {
            if (s.id != null) subjectMap.set(String(s.id), s);
        });

        const [allEnrollments, usersRaw] = await Promise.all([
            enrollmentService.getEnrollments(),
            userPService.getUsers(),
        ]);

        const enrollments = Array.isArray(allEnrollments) ? allEnrollments : [];
        const usersList = Array.isArray(usersRaw) ? usersRaw : [];
        const students = transformUsersForList(usersList).filter((u) => u.role === 'STUDENT');
        const studentMap = new Map(students.map((s) => [String(s.id), s]));

        const rows = enrollments
            .filter((e: Enrollment) => groupIds.has(String(e.group_id)))
            .map((e: Enrollment) => {
                const group = groupMap.get(String(e.group_id));
                const subject = group?.subject_id ? subjectMap.get(String(group.subject_id)) : undefined;
                const student = studentMap.get(String(e.student_id));
                const statusRaw = e.status ?? '';
                const status =
                    statusRaw === 'ACTIVE' || statusRaw === 'Activa' ? 'Activa' : statusRaw || '—';

                return {
                    enrollment_id: String(e.id),
                    student_id: String(e.student_id),
                    student_code: student?.code ?? '—',
                    student_name: student?.name ?? `Estudiante ${String(e.student_id).slice(0, 8)}…`,
                    student_email: student?.email ?? '—',
                    group_label: group?.name ?? group?.group_code ?? String(e.group_id),
                    subject_label: subject ? `${subject.code} — ${subject.name}` : '—',
                    status,
                };
            });

        return { rows, error: null };
    } catch (error) {
        console.error('Error al cargar estudiantes del docente:', error);
        return {
            rows: [],
            error: 'No se pudieron cargar los estudiantes. Verifica que el backend esté activo.',
        };
    }
}

export async function loadTeacherScalesData(user: AuthUser): Promise<{
    rows: TeacherScaleRow[];
    rubrics: Rubric[];
    error: string | null;
}> {
    try {
        const teacher = await resolveTeacherRecord(user);
        const matchIds = collectTeacherMatchIds(teacher, user);

        const [rubricsRaw, criteriaRaw, scalesRaw] = await Promise.all([
            rubricService.getRubrics(),
            criterionService.getCriteria(),
            scaleService.getScales(),
        ]);

        const rubrics = (Array.isArray(rubricsRaw) ? rubricsRaw : []).filter((r) =>
            rubricBelongsToTeacher(r, matchIds)
        );
        const rubricIds = new Set(rubrics.map((r) => String(r.id)));
        const rubricMap = new Map<string, Rubric>();
        rubrics.forEach((r) => {
            if (r.id) rubricMap.set(String(r.id), r);
        });

        const criteria = (Array.isArray(criteriaRaw) ? criteriaRaw : []).filter((c) =>
            rubricIds.has(String(c.rubric_id))
        );
        const criterionMap = new Map<string, Criterion>();
        criteria.forEach((c) => {
            if (c.id) criterionMap.set(String(c.id), c);
        });

        const scales = Array.isArray(scalesRaw) ? scalesRaw : [];
        const rows: TeacherScaleRow[] = scales
            .filter((s: Scale) => criterionMap.has(String(s.criterion_id)))
            .map((s: Scale) => {
                const criterion = criterionMap.get(String(s.criterion_id));
                const rubric = criterion?.rubric_id
                    ? rubricMap.get(String(criterion.rubric_id))
                    : undefined;

                return {
                    id: String(s.id),
                    rubric_id: String(criterion?.rubric_id ?? ''),
                    rubric_title: rubric?.title ?? '—',
                    criterion_id: String(s.criterion_id),
                    criterion_name: criterion?.name ?? '—',
                    scale_name: s.name,
                    scale_description: s.description || '—',
                    scale_value: s.value,
                    rubric_status: rubric?.is_public ? 'Publicada' : 'Borrador',
                };
            })
            .sort((a, b) => {
                const byRubric = a.rubric_title.localeCompare(b.rubric_title);
                if (byRubric !== 0) return byRubric;
                const byCriterion = a.criterion_name.localeCompare(b.criterion_name);
                if (byCriterion !== 0) return byCriterion;
                return a.scale_value - b.scale_value;
            });

        return { rows, rubrics, error: null };
    } catch (error) {
        console.error('Error al cargar escalas del docente:', error);
        return {
            rows: [],
            rubrics: [],
            error: 'No se pudieron cargar las escalas. Verifica que el backend esté activo.',
        };
    }
}
