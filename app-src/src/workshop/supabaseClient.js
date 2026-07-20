import { createClient } from '@supabase/supabase-js'

// Same project as the self-assessment's submission panel / dashboard — the
// publishable (anon) key is public by design, safe to ship in a static page.
const SUPABASE_URL = 'https://dzywbkiezpznowusvfyo.supabase.co'
const SUPABASE_KEY = 'sb_publishable_V6AwgFi2DUTZomfAY0IKNA_LVr4dOQJ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
