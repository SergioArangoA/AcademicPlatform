import { Scale } from "./Scale";
export interface Criterion{
    rubric_id?: number;
    name?: string;
    description?: string;
    weight?: number;
    scales?: Scale[];
}