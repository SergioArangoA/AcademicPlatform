/**
 * Carga datos para tablas del perfil docente: grupos, estudiantes, rúbricas y escalas.
 */
import { Group } from '../../models/Groups/Group';
import { Semester } from '../../models/Semesters/Semester';
import { Subject } from '../../models/Subjects/Subject';
import { Enrollment } from '../../models/Enrollment';
import { Criterion } from '../../models/Evaluation/Criterion';
import { Rubric } from '../../models/Evaluation/Rubric';
import { Scale } from '../../models/Evaluation/Scale';
import { groupService, GroupWithMeta } from '../../services/groupService';
import { enrollmentService } from '../../services/enrollmentService';
import { semesterService } from '../../services/semesterService';
import { subjectService } from '../../services/subjectService';
import { userPService } from '../../services/userPService';
import { criterionService } from '../../services/criterionService';
import { rubricService } from '../../services/rubricService';
import { scaleService } from '../../services/scaleService';
import { transformUsersForList } from '../userTransformers';
import { filterGroupsAssignedToTeacher, filterRubricsAssignedToTeacher } from './filters';
import { resolveTeacherRecord } from './resolveTeacherId';
import type {
  AuthUser,
  TeacherGroupRow,
  TeacherScaleRow,
  TeacherStudentRow,
} from './types';

export type { TeacherGroupRow, TeacherStudentRow, TeacherScaleRow } from './types';

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

    if (!teacher) {
      return {
        teacherId: null,
        groups: [],
        subjects: [],
        semesters: [],
        error: null,
      };
    }

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

    const assignedGroups = filterGroupsAssignedToTeacher(groupsSource, teacher);
    const groups = assignedGroups.map((g) => mapGroupRow(g, subjectMap, semesterMap));

    const assignedSubjectIds = new Set(
      assignedGroups.map((g) => String(g.subject_id)).filter((id) => id && id !== 'undefined')
    );
    const subjectsForFilters = subjects.filter(
      (s) => s.id != null && assignedSubjectIds.has(String(s.id))
    );

    return {
      teacherId,
      groups,
      subjects: subjectsForFilters,
      semesters,
      error: null,
    };
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

export async function loadTeacherRubricsData(user: AuthUser): Promise<{
  teacherId: string | null;
  rubrics: Rubric[];
  error: string | null;
}> {
  try {
    const teacher = await resolveTeacherRecord(user);
    const teacherId = teacher?.id ? String(teacher.id) : null;

    if (!teacher) {
      return { teacherId: null, rubrics: [], error: null };
    }

    const rubricsRaw = await rubricService.getRubrics();
    const rubrics = filterRubricsAssignedToTeacher(
      Array.isArray(rubricsRaw) ? rubricsRaw : [],
      teacher
    );

    return { teacherId, rubrics, error: null };
  } catch (error) {
    console.error('Error al cargar rúbricas del docente:', error);
    return {
      teacherId: null,
      rubrics: [],
      error: 'No se pudieron cargar las rúbricas. Verifica que el backend esté activo.',
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

    if (!teacher) {
      return { rows: [], rubrics: [], error: null };
    }

    const [rubricsRaw, criteriaRaw, scalesRaw] = await Promise.all([
      rubricService.getRubrics(),
      criterionService.getCriteria(),
      scaleService.getScales(),
    ]);

    const rubrics = filterRubricsAssignedToTeacher(
      Array.isArray(rubricsRaw) ? rubricsRaw : [],
      teacher
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
