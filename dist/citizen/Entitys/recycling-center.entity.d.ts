import { User } from './user.entity';
export declare class RecyclingCenter {
    id: number;
    name: string;
    address: string;
    material_types_accepted: string;
    contact_number: string;
    created_at: Date;
    note: string;
    image: string;
    user: User;
}
