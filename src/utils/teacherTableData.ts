import { User as AppUser } from '../models/User';
import { User as FirebaseUser } from 'firebase/auth';
import { Group } from '../models/Groups/Group';
import { Semester } from '../models/Semesters/Semester';
import { Subject } from '../models/Subjects/Subject';
import { groupService, GroupWithMeta } from '../services/groupService';
import { enrollmentService, Enrollment } from '../services/enrollmentService';
import { semesterService } from '../services/semesterService';
import { subjectService } from '../services/subjectService';
import { userPService } from '../services/userPService';
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

export async function loadTeacherGroupsData(user: AuthUser): Promise<{
    teacherId: string | null;
    groups: TeacherGroupRow[];
    subjects: Subject[];
    semesters: Semester[];
}> {
    const teacher = await resolveTeacherRecord(user);
    const teacherId = teacher?.id ? String(teacher.id) : null;

    const [allGroups, subjects, semesters] = await Promise.all([
        groupService.getGroupsWithMeta(),
        subjectService.getSubjects(),
        semesterService.getSemesters(),
    ]);

    const subjectMap = new Map<string, Subject>();
    subjects.forEach((s) => {
        if (s.id) subjectMap.set(String(s.id), s);
    });

    const semesterMap = new Map<string, Semester>();
    semesters.forEach((s) => {
        if (s.id) semesterMap.set(String(s.id), s);
    });

    const groups = (teacherId
        ? allGroups.filter((g) => g.teacher_id && String(g.teacher_id) === teacherId)
        : []
    ).map((group) => {
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
    });

    return { teacherId, groups, subjects, semesters };
}

export async function loadTeacherStudentsData(user: AuthUser): Promise<TeacherStudentRow[]> {
    const { groups, subjects } = await loadTeacherGroupsData(user);
    if (groups.length === 0) return [];

    const groupIds = new Set(groups.map((g) => String(g.id)));
    const groupMap = new Map<string, Group>();
    groups.forEach((g) => groupMap.set(String(g.id), g));

    const subjectMap = new Map<string, Subject>();
    subjects.forEach((s) => {
        if (s.id) subjectMap.set(String(s.id), s);
    });

    const [allEnrollments, usersRaw] = await Promise.all([
        enrollmentService.getEnrollments(),
        userPService.getUsers(),
    ]);

    const students = transformUsersForList(usersRaw).filter((u) => u.role === 'STUDENT');
    const studentMap = new Map(students.map((s) => [String(s.id), s]));

    return allEnrollments
        .filter((e: Enrollment) => groupIds.has(String(e.group_id)))
        .map((e: Enrollment) => {
            const group = groupMap.get(String(e.group_id));
            const subject = group?.subject_id ? subjectMap.get(String(group.subject_id)) : undefined;
            const student = studentMap.get(String(e.student_id));
            return {
                enrollment_id: String(e.id),
                student_id: String(e.student_id),
                student_code: student?.code ?? '—',
                student_name: student?.name ?? `Estudiante ${String(e.student_id).slice(0, 8)}…`,
                student_email: student?.email ?? '—',
                group_label: group?.name ?? group?.group_code ?? String(e.group_id),
                subject_label: subject ? `${subject.code} — ${subject.name}` : '—',
                status: e.status === 'ACTIVE' ? 'Activa' : e.status,
            };
        });
}
