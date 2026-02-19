import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDTO, CreateStaffDTO } from '../types';

export class AuthController {
    /**
     * POST /api/auth/login
     */
    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: LoginDTO = req.body;
            const result = await AuthService.login(data);

            res.status(200).json({
                success: true,
                data: result,
                message: 'Login successful.',
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/auth/register (admin only — used for initial setup)
     */
    static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: CreateStaffDTO & { role?: 'admin' | 'staff' } = req.body;
            const user = await AuthService.register(data);

            res.status(201).json({
                success: true,
                data: user,
                message: 'User registered successfully.',
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/auth/me
     */
    static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.status(200).json({
                success: true,
                data: req.user,
            });
        } catch (err) {
            next(err);
        }
    }
}
