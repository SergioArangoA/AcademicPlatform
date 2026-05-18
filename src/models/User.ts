import { BaseProfile } from './Users/BaseProfile';

export interface User {
    id?: string;
    first_name?: string;
    last_name?: string;
    identification?: number;
    phone?: number;
    speciality?: string;
    user_id?: string;
    role?: string;
    email?: string;
    photoURL?: string;
    code?: string;
    /** Id en tabla teachers/students (es el que usa group.teacher_id y rubric.teacher_id) */
    profile?: BaseProfile;
}