import { Registration } from "../Registration";
import { Career } from "../Careers/Career";

export interface RegistrationCardProps {
  registration: Registration | null;
  career?: Career;
}
