import type {Router} from "../router";

export type LoginRequestType = {
    email: string;
    password: string;
    rememberMe?: boolean;
};

export type LoginTokensType = {
    accessToken: string;
    refreshToken: string;
};

export type LoginUserType = {
    id: string | number;
    name?: string;
    lastName?: string;
}

export type LoginResponseType = {
    tokens: LoginTokensType;
    user: LoginUserType;
}


