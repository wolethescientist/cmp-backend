import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../config/supabase';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { User, JwtPayload, LoginDTO, CreateStaffDTO } from '../types';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12;

export class AuthService {
    /**
     * Register a new user (admin or staff).
     */
    static async register(data: CreateStaffDTO & { role?: 'admin' | 'staff' }): Promise<Omit<User, 'password_hash'>> {
        const supabase = getSupabase();

        // Check for existing user
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', data.email)
            .single();

        if (existing) {
            throw new AppError('A user with this email already exists.', 409);
        }

        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        const { data: user, error } = await supabase
            .from('users')
            .insert({
                name: data.name,
                email: data.email,
                password_hash: passwordHash,
                role: data.role || 'staff',
            })
            .select('id, name, email, role, created_at')
            .single();

        if (error || !user) {
            logger.error('Failed to create user', error);
            throw new AppError('Failed to create user.', 500);
        }

        logger.info('User registered', { userId: user.id, role: user.role });
        return user;
    }

    /**
     * Authenticate user and return JWT.
     */
    static async login(data: LoginDTO): Promise<{ token: string; user: Omit<User, 'password_hash'> }> {
        const supabase = getSupabase();

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', data.email)
            .single();

        if (error || !user) {
            throw new AppError('Invalid email or password.', 401);
        }

        const valid = await bcrypt.compare(data.password, user.password_hash);
        if (!valid) {
            throw new AppError('Invalid email or password.', 401);
        }

        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const token = jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        } as jwt.SignOptions);

        logger.info('User logged in', { userId: user.id });

        const { password_hash, ...safeUser } = user;
        return { token, user: safeUser };
    }
}
