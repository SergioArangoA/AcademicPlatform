import { Group } from "../Groups/Group";
import { GroupPayload } from "../Groups/GroupPayload";

export interface GroupFormProps {
	mode: 1 | 2;
	group?: Group | null;
	loading?: boolean;
	onSubmit: (values: GroupPayload) => Promise<void> | void;
}
