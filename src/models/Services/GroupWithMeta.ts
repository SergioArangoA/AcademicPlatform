import { Group } from '../Groups/Group';

export interface GroupWithMeta extends Group {
    enrolled_count: number;
    available_capacity: number;
}
