import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { User, CreateStaffDTO } from '../types';
import { AppError } from '../middleware/errorHandler';
import { AuthService } from './auth.service';

export class StaffService {
    /**
     * Create a new staff member.
     */
    static async createStaff(data: CreateStaffDTO): Promise<Omit<User, 'password_hash'>> {
        return AuthService.register({ ...data, role: 'staff' });
    }

    /**
     * Get all staff members.
     */
    static async getAllStaff(): Promise<Omit<User, 'password_hash'>[]> {
        const supabase = getSupabase();

        const { data: staff, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .eq('role', 'staff')
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Failed to fetch staff', error);
            throw new AppError('Failed to fetch staff.', 500);
        }

        return staff || [];
    }

    /**
     * Get a single staff member by ID.
     */
    static async getStaffById(id: string): Promise<Omit<User, 'password_hash'>> {
        const supabase = getSupabase();

        const { data: staff, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .eq('id', id)
            .eq('role', 'staff')
            .single();

        if (error || !staff) {
            throw new AppError('Staff member not found.', 404);
        }

        return staff;
    }

    /**
     * Delete a staff member.
     */
    static async deleteStaff(id: string): Promise<void> {
        const supabase = getSupabase();

        // Check exists
        await StaffService.getStaffById(id);

        // Unassign all conversations
        await supabase
            .from('conversations')
            .update({ assigned_to: null })
            .eq('assigned_to', id);

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)
            .eq('role', 'staff');

        if (error) {
            logger.error('Failed to delete staff', error);
            throw new AppError('Failed to delete staff.', 500);
        }

        logger.info('Staff member deleted', { staffId: id });
    }

    /**
     * Get staff activity – conversations assigned and messages sent.
     */
    static async getStaffActivity(staffId: string): Promise<{
        staff: Omit<User, 'password_hash'>;
        assignedConversations: number;
        messagesSent: number;
        recentReplies: any[];
    }> {
        const supabase = getSupabase();
        const staff = await StaffService.getStaffById(staffId);

        // Count assigned conversations
        const { count: assignedCount } = await supabase
            .from('conversations')
            .select('id', { count: 'exact', head: true })
            .eq('assigned_to', staffId);

        // Count messages sent by this staff
        const { count: msgCount } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('sender_type', 'staff')
            .in(
                'conversation_id',
                (await supabase.from('conversations').select('id').eq('assigned_to', staffId)).data?.map((c: any) => c.id) || []
            );

        // Recent replies (last 20)
        const { data: recentReplies } = await supabase
            .from('messages')
            .select('id, conversation_id, content, platform, created_at')
            .eq('sender_type', 'staff')
            .in(
                'conversation_id',
                (await supabase.from('conversations').select('id').eq('assigned_to', staffId)).data?.map((c: any) => c.id) || []
            )
            .order('created_at', { ascending: false })
            .limit(20);

        return {
            staff,
            assignedConversations: assignedCount || 0,
            messagesSent: msgCount || 0,
            recentReplies: recentReplies || [],
        };
    }
}
