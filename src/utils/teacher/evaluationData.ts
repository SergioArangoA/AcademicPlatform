/**
 * Carga evaluaciones y progreso de calificación para el docente (CU-10, CU-11, CU-12).
 */
import { Evaluation } from '../../models/Evaluation/Evaluation';
import { Grade } from '../../models/Evaluation/Grade';
import { Group } from '../../models/Groups/Group';
import { Subject } from '../../models/Subjects/Subject';
import { evaluationService } from '../../services/evaluationService';
import { gradeService } from '../../services/gradeService';
import { enrollmentService } from '../../services/enrollmentService';
import { groupService } from '../../services/groupService';
import { subjectService } from '../../services/subjectService';
import { userPService } from '../../services/userPService';
import { buildStudentLookupMap, resolveStudentFromEnrollment, transformUsersForList } from '../userTransformers';
import { filterGroupsByTeacherMatchIds } from './filters';
import { resolveTeacherMatchIds, resolveTeacherRecord } from './resolveTeacherId';
import type { AuthUser } from './types';

export interface TeacherEvaluationRow extends Evaluation {
  group_label: string;
  subject_label: string;
  students_total: number;
  students_graded_sent: number;
}

export interface EvaluationStudentRow {
  enrollment_id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  grade_status: 'NONE' | 'DRAFT' | 'SENT';
  final_score: number | null;
  grade_id: string | null;
}

export async function loadTeacherEvaluationsData(user: AuthUser): Promise<{
  evaluations: TeacherEvaluationRow[];
  error: string | null;
}> {
  try {
    const teacher = await resolveTeacherRecord(user);
    const matchIds = resolveTeacherMatchIds(user, teacher);
    if (matchIds.size === 0) {
      return {
        evaluations: [],
        error:
          'No se encontró tu perfil de docente. Inicia sesión de nuevo o contacta al administrador.',
      };
    }

    const [allEvaluations, allGroups, allSubjects, allGrades] = await Promise.all([
      evaluationService.getEvaluations(),
      groupService.getGroups(),
      subjectService.getSubjects(),
      gradeService.getGrades(),
    ]);

    const teacherGroups = filterGroupsByTeacherMatchIds(
      Array.isArray(allGroups) ? allGroups : [],
      matchIds
    );
    const groupIds = new Set(teacherGroups.map((g) => String(g.id)));

    const subjectMap = new Map<string, Subject>();
    (Array.isArray(allSubjects) ? allSubjects : []).forEach((s) => {
      if (s.id != null) subjectMap.set(String(s.id), s);
    });

    const groupMap = new Map<string, Group>();
    teacherGroups.forEach((g) => groupMap.set(String(g.id), g));

    const evaluations = (Array.isArray(allEvaluations) ? allEvaluations : []).filter((ev) =>
      groupIds.has(String(ev.group_id))
    );

    const rows: TeacherEvaluationRow[] = await Promise.all(
      evaluations.map(async (ev) => {
        const group = groupMap.get(String(ev.group_id));
        const subject = group?.subject_id
          ? subjectMap.get(String(group.subject_id))
          : ev.subject_id
            ? subjectMap.get(String(ev.subject_id))
            : undefined;

        const enrollments = await enrollmentService.getEnrollments(String(ev.group_id));
        const active = enrollments.filter((e) => e.status === 'ACTIVE' || e.status === 'Activa');

        let sent = 0;
        if (ev.rubric_id) {
          for (const enr of active) {
            const grade = (allGrades as Grade[]).find(
              (g) =>
                String(g.enrollment_id) === String(enr.id) &&
                String(g.rubric_id) === String(ev.rubric_id) &&
                g.status === 'SENT'
            );
            if (grade) sent += 1;
          }
        }

        return {
          ...ev,
          group_label: group?.name ?? group?.group_code ?? String(ev.group_id),
          subject_label: subject ? `${subject.code} — ${subject.name}` : '—',
          students_total: active.length,
          students_graded_sent: sent,
        };
      })
    );

    rows.sort((a, b) =>
      (b.updated_at ?? b.created_at ?? '').localeCompare(a.updated_at ?? a.created_at ?? '')
    );

    return { evaluations: rows, error: null };
  } catch (error) {
    console.error('Error al cargar evaluaciones del docente:', error);
    return {
      evaluations: [],
      error: 'No se pudieron cargar las evaluaciones. Verifica que el backend esté activo.',
    };
  }
}

export async function loadEvaluationStudentsRows(
  evaluationId: string
): Promise<{
  evaluation: Evaluation | null;
  students: EvaluationStudentRow[];
  subject_label: string;
  group_label: string;
  error: string | null;
}> {
  try {
    const evaluation = await evaluationService.getEvaluationById(evaluationId);
    if (!evaluation) {
      return {
        evaluation: null,
        students: [],
        subject_label: '—',
        group_label: '—',
        error: 'Evaluación no encontrada.',
      };
    }

    const [group, subject, enrollments, grades, usersRaw] = await Promise.all([
      groupService.getGroupById(String(evaluation.group_id)),
      evaluation.subject_id
        ? subjectService.getSubjectById(evaluation.subject_id)
        : Promise.resolve(null),
      enrollmentService.getEnrollments(String(evaluation.group_id)),
      gradeService.getGrades(),
      userPService.getUsers(),
    ]);

    const studentsList = transformUsersForList(
      Array.isArray(usersRaw) ? usersRaw : []
    ).filter((u) => u.role === 'STUDENT');
    const studentMap = buildStudentLookupMap(studentsList);

    const active = enrollments.filter((e) => e.status === 'ACTIVE' || e.status === 'Activa');

    const students: EvaluationStudentRow[] = active.map((enr) => {
      const st = resolveStudentFromEnrollment(studentMap, String(enr.student_id));
      const grade =
        evaluation.rubric_id &&
        grades.find(
          (g) =>
            String(g.enrollment_id) === String(enr.id) &&
            String(g.rubric_id) === String(evaluation.rubric_id)
        );

      let grade_status: EvaluationStudentRow['grade_status'] = 'NONE';
      if (grade?.status === 'SENT') grade_status = 'SENT';
      else if (grade?.status === 'DRAFT') grade_status = 'DRAFT';

      return {
        enrollment_id: String(enr.id),
        student_id: String(enr.student_id),
        student_name: st?.name ?? `Estudiante ${String(enr.student_id).slice(0, 8)}`,
        student_code: st?.code ?? '—',
        grade_status,
        final_score: grade?.final_score != null ? Number(grade.final_score) : null,
        grade_id: grade?.id ? String(grade.id) : null,
      };
    });

    students.sort((a, b) => a.student_name.localeCompare(b.student_name));

    return {
      evaluation,
      students,
      subject_label: subject ? `${subject.code} — ${subject.name}` : '—',
      group_label: group?.name ?? group?.group_code ?? String(evaluation.group_id),
      error: null,
    };
  } catch (error) {
    console.error('Error al cargar estudiantes de la evaluación:', error);
    return {
      evaluation: null,
      students: [],
      subject_label: '—',
      group_label: '—',
      error: 'No se pudieron cargar los estudiantes.',
    };
  }
}
