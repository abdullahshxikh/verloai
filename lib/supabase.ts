import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://nsydfvhxfptfelfdtmxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zeWRmdmh4ZnB0ZmVsZmR0bXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTA3ODgsImV4cCI6MjA4MTkyNjc4OH0.81RXN90yFNtLnofHNiZLhA_1oT874FJSQ2a1PTOCymw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
