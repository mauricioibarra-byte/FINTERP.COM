import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() req: any) {
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        return this.authService.login(user); // Returns JWT
    }

    @Post('register')
    async register(@Body() body: { email: string; password: string; fullName: string; tenantId: string }) {
        return this.authService.register(body);
    }
}
