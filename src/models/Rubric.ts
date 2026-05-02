import { Criterion } from "./Criterion";
export interface Rubric{
    subject_id?: number;
    title?: string;
    description?: string;
    is_public?: boolean;
    is_archived?: boolean;
    criteria?: Criterion[];
}