import { createClient } from '@supabase/supabase-js'
import { createMockServiceClient } from './supabase-mock'

export const createServiceClient = () => {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase URL or Service Role Key is missing or empty.');
        }
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: { autoRefreshToken: false, persistSession: false }
            }
        )
    } catch (err) {
        console.warn('⚠️ Server-side Service-role Supabase client could not be initialized. Using mock service client.');
        return createMockServiceClient();
    }
}