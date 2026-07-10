import { createClient } from '@supabase/supabase-js'

// You must create a .env.local file in the root of the project with these variables:
// VITE_SUPABASE_URL=your-supabase-url
// VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
