import { Career } from "./Career";

export interface CareersApiResponse {
  data: Career[];
  message?: string;
}