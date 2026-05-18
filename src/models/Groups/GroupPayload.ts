/** Datos que envío al backend cuando creo o edito un grupo */
export interface GroupPayload {
    subject_id: string;
    semester_id: string;
    teacher_id: string;
    name: string;
    group_code: string;
    capacity: number;
}
