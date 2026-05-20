import { Career } from "../Careers/Career";
import { CareerPayload } from "../Careers/CareerPayload";

export interface CareerFormProps {
	mode: 1 | 2;
	career?: Career | null;
	loading?: boolean;
	onSubmit: (values: CareerPayload) => Promise<void> | void;
}
