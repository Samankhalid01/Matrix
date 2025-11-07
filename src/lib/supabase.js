import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdwsqbzlhyxhebdlqath.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd3NxYnpsaHl4aGViZGxxYXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDAzMTUsImV4cCI6MjA3NTk3NjMxNX0.0du6WYqc6zr9PFvK7_8a961ZqSJtproSVAQ57rzxw4U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  return {
    error: error.message || 'Database operation failed',
    details: error.details || null
  };
};
