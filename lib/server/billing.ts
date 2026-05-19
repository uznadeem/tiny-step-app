import { getBillingAccess } from '@/lib/billing'
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'

export async function getUserBillingAccess(userId: string) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('status, plan_interval, trial_ends_at, current_period_end, cancel_at_period_end, stripe_status')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return getBillingAccess(data)
}
