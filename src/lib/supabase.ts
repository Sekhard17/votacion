import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oakkdetxlgnmusdupxhk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ha2tkZXR4bGdubXVzZHVweGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU4MjMxNDYsImV4cCI6MjA0MTM5OTE0Nn0.yioSzKVtPFccDr8NINS6C1ArMAXk2iRq-dPgIOqveTQ'
const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase }
