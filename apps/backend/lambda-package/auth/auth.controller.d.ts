import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
    }>;
    register(body: {
        email: string;
        password: string;
        fullName: string;
        tenantId: string;
    }): Promise<{
        tenantId: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        email: string;
        password: string;
        fullName: string;
        roleId: string | null;
    }>;
}
