export type SignupRequestType = {
    name: string,
    lastName: string,
    email: string,
    password: string,
    passwordRepeat: string
}

export type SignupResponseType = {
    user: {
        id: string | number;
        email: string;
        name: string;
        lastName: string;
    };
    error?: boolean | string;
}


