import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { Customer, Platform } from '../types';
import { AppError } from '../middleware/errorHandler';

export class CustomerService {
    /**
     * Find or create a customer from an incoming message.
     */
    static async findOrCreateCustomer(data: {
        platform: Platform;
        platformUserId: string;
        name?: string;
        phoneNumber?: string;
    }): Promise<Customer> {
        const supabase = getSupabase();

        // Try to find existing customer
        const { data: existing } = await supabase
            .from('customers')
            .select('*')
            .eq('platform', data.platform)
            .eq('platform_user_id', data.platformUserId)
            .single();

        if (existing) {
            // Update name if we have a new one
            if (data.name && data.name !== existing.name) {
                await supabase
                    .from('customers')
                    .update({ name: data.name })
                    .eq('id', existing.id);
                existing.name = data.name;
            }
            return existing;
        }

        // Create new customer
        const { data: customer, error } = await supabase
            .from('customers')
            .insert({
                platform: data.platform,
                platform_user_id: data.platformUserId,
                name: data.name || null,
                phone_number: data.phoneNumber || null,
            })
            .select('*')
            .single();

        if (error || !customer) {
            logger.error('Failed to create customer', error);
            throw new AppError('Failed to create customer.', 500);
        }

        logger.info('New customer created', { customerId: customer.id, platform: data.platform });
        return customer;
    }

    /**
     * List all customers with optional platform filter.
     */
    static async listCustomers(platform?: Platform): Promise<Customer[]> {
        const supabase = getSupabase();

        let query = supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (platform) {
            query = query.eq('platform', platform);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Failed to fetch customers', error);
            throw new AppError('Failed to fetch customers.', 500);
        }

        return data || [];
    }
}
