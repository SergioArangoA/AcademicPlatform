import React from "react";
import { Career } from "../Careers/Career";
import { StudyPlanFormValues } from "./StudyPlanFormValues";

export interface StudyPlanFormProps {
	values: StudyPlanFormValues;
	careers: Career[];
	onValueChange: (key: keyof StudyPlanFormValues, value: string | boolean) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
	loading: boolean;
	loadingCareers: boolean;
	readonlyCareer?: boolean;
	submitButtonLabel?: string;
	pageTitle?: string;
}
