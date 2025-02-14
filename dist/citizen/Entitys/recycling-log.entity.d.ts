import { User } from './user.entity';
import { RecyclingCenter } from './recycling-center.entity';
export declare class RecyclingLog {
    id: number;
    user: User;
    recycling_center: RecyclingCenter;
    material_type: string;
    quantity: number;
    status: string;
    reward_points: number;
    timestamp: Date;
    image: string;
    message: string;
}
