export interface User {
    id: number;
    email: string;
    name: string | null;
    avatar: string;
    email_verified_at: string | null;
    permissions?: string[];
    roles?: string[];
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    email?: string;
    user?: User;
    retry_after?: number;
}

export interface SendCodeRequest {
    email: string;
}

export interface VerifyCodeRequest {
    email: string;
    code: string;
}

export interface ValidationErrors {
    email?: string[];
    code?: string[];
}

export interface ErrorResponse {
    success: boolean;
    message: string;
    errors?: ValidationErrors;
    retry_after?: number;
}

export interface PageProps {
    auth: {
        user: User | null;
        permissions?: string[];
        roles?: string[];
    };
    [key: string]: unknown;
}
