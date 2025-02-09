export default interface IUser {
    id: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
    token: string;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: unknown;
}