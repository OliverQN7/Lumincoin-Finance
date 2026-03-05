export type AuthKeyType = "accessToken" | "refreshToken" | "userInfo";

export type AuthInfoMapType = Record<AuthKeyType, string | null>;