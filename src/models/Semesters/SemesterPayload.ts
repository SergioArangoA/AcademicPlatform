export interface SemesterPayload {
	code: string;
	name: string;
	start_date: string;
	end_date: string;
	is_active?: boolean;
}