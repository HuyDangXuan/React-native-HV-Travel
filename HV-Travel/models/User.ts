export interface User {
    _id: string;
    fullName: string,
    email: string,
    phone?: string,
    gender?: string,
    birthday?: string | null;
    address?: string;
    favourite_tours?: string[];
    avatar?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    tokenVersion: number;
}