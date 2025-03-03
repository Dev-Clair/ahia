export default interface IUser {
    id: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
    token: string;
    refreshToken?: string;
    iat: Date;
    exp: Date;
    [key: string]: unknown;
}