import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vwylsusacaucxyphbxad.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3eWxzdXNhY2F1Y3h5cGhieGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTg1MjEsImV4cCI6MjA2ODY5NDUyMX0.g8WA6KE07scLfDTHiGyYAgS2PL-36FSztg2dJsE4rPI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)