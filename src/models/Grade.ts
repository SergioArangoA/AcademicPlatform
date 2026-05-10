export interface Grade{
    id?: string;
    enrollment_id: string;
    rubric_id: string;
    status?: string;
    observations?: string;
    details:[
        {
            scale_id: string;
            comment?: string;
        }
    ]

}