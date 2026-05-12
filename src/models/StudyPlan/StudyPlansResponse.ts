import { StudyPlan } from "./StudyPlan";

export interface StudyPlansResponse{
    data: StudyPlan[];
    message?: string;
}