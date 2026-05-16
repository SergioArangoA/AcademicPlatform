import { User as AppUser } from '../models/User';
import { User as FirebaseUser } from 'firebase/auth';
import { Subject } from '../models/Subjects/Subject';
import { subjectService } from '../services/subjectService';
import { loadTeacherGroupOptions } from './loadTeacherGroupOptions';
import { resolveTeacherRecord } from './resolveTeacherId';

type AuthUser = FirebaseUser | AppUser | null;

export interface TeacherSubjectOption {
    id: string;
    code: string;
    name: string;
    label: string;
}

export async function loadTeacherSubjects(user: AuthUser): Promise<TeacherSubjectOption[]> {
    const options = await loadTeacherGroupOptions(user);
    const map = new Map<string, TeacherSubjectOption>();
    options.forEach((o) => {
        if (!o.subject_id) return;
        map.set(String(o.subject_id), {
            id: String(o.subject_id),
            code: o.subjectCode || '—',
            name: o.subjectName || 'Asignatura',
            label: `${o.subjectCode || '—'} — ${o.subjectName || 'Asignatura'}`,
        });
    });
    return Array.from(map.values());
}

export async function resolveTeacherIdForApi(user: AuthUser): Promise<string | null> {
    const teacher = await resolveTeacherRecord(user);
    return teacher?.id ? String(teacher.id) : null;
}

export async function getSubjectByIdSafe(id?: string | number | null): Promise<Subject | null> {
    if (id == null || id === '') return null;
    return subjectService.getSubjectById(id);
}
