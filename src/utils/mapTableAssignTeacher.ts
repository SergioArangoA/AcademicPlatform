import { Subject } from "../models/Subject";
import { AssignTeacherTableRow } from "../models/Teachers/AssignTeacherTableRow";
import { Teacher } from "../models/Teachers/Teacher";
import { groupService } from "../services/groupService";
import { subjectService } from "../services/subjectService";
import { teacherService } from "../services/teacherService";


const getTeacherName = (teacher?: Teacher | null, fallbackId?: string) => {
    if (!teacher) {
        return fallbackId ? `Docente ${fallbackId}` : "Sin asignar";
    }

    const fullName = [teacher.first_name, teacher.last_name].filter(Boolean).join(" ").trim();

    if (fullName !== "") {
        return fullName;
    }

    return teacher.identification || fallbackId || "Sin asignar";
};

export const mapTableAssignTeacher = async (semesterId: string): Promise<AssignTeacherTableRow[]> => {
    const normalizedSemesterId = String(semesterId ?? "").trim();

    if (normalizedSemesterId === "") {
        return [];
    }

    const [groups, subjects, teachers] = await Promise.all([
        groupService.getGroups(),
        subjectService.getSubjects(),
        teacherService.searchTeacher(""),
    ]);

    const subjectMap = new Map<string, Subject>();
    subjects.forEach((subject) => {
        if (subject.id !== undefined && subject.id !== null) {
            subjectMap.set(String(subject.id), subject);
        }

        if (subject.code) {
            subjectMap.set(subject.code, subject);
        }
    });



    const teacherMap = new Map<string, Teacher>();
    teachers.forEach((teacher) => {
        teacherMap.set(String(teacher.id), teacher);

        if (teacher.identification) {
            teacherMap.set(teacher.identification, teacher);
        }
    });

    return groups
        .filter((group) => String(group.semester_id ?? "") === normalizedSemesterId)
        .map((group) => {
            const subjectKey = group.subject_id ? String(group.subject_id) : "";
            const subject = subjectMap.get(subjectKey);
            const teacher = group.teacher_id ? teacherMap.get(String(group.teacher_id)) : undefined;

            return {
                id: group.id,
                subject_id: String(subject?.id ?? group.subject_id ?? ""),
                teacher_id: String(group.teacher_id ?? ""),
                group_code: group.group_code ?? "-",
                group_name: group.name ?? "-",
                subject_name: subject?.name ?? "-",
                subject_code: subject?.code ?? "-",
                teacher_name: getTeacherName(teacher, group.teacher_id),
            };
        });
};