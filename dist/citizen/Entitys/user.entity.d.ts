export declare enum UserRole {
    ADMIN = "Admin",
    RECYCLER = "Recycler",
    ORGANIZATION = "Organization",
    CITIZEN = "Citizen"
}
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    recyclingCenter: any;
}
