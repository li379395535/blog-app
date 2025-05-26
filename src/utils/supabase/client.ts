import { LooseObject } from '@/global'
import { createBrowserClient } from '@supabase/ssr'
export function createClient<T extends LooseObject = LooseObject>() {
  return createBrowserClient<T>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
