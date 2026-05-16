import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const TRIAL_DAYS = 7

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  // Day 4 of trial = 3 days remaining; Day 5 = 2 days remaining
  // user created N days ago where N in {4, 5}
  const now = Date.now()
  const results: Array<{ day: number; sent: number; skipped: number; errors: number }> = []

  for (const day of [4, 5]) {
    const daysLeft = TRIAL_DAYS - day
    const windowStart = new Date(now - (day + 1) * 86400_000).toISOString()
    const windowEnd = new Date(now - day * 86400_000).toISOString()

    // Fetch users created in the window
    const { data: users, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (error) {
      console.error('listUsers failed', error)
      results.push({ day, sent: 0, skipped: 0, errors: 1 })
      continue
    }

    let sent = 0, skipped = 0, errors = 0

    for (const u of users.users) {
      if (!u.email) continue
      const created = new Date(u.created_at).getTime()
      const ageMs = now - created
      const ageDays = ageMs / 86400_000
      if (ageDays < day || ageDays >= day + 1) continue

      // Skip if admin
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', u.id)
        .eq('role', 'admin')
        .maybeSingle()
      if (adminRole) { skipped++; continue }

      // Skip if active subscription
      const { data: hasSub } = await supabase.rpc('has_active_subscription', {
        user_uuid: u.id,
        check_env: 'live',
      })
      const { data: hasSubSandbox } = await supabase.rpc('has_active_subscription', {
        user_uuid: u.id,
        check_env: 'sandbox',
      })
      if (hasSub || hasSubSandbox) { skipped++; continue }

      // Skip if comp access
      const { data: comp } = await supabase
        .from('comp_access')
        .select('email')
        .ilike('email', u.email)
        .maybeSingle()
      if (comp) { skipped++; continue }

      // Idempotency check
      const { data: already } = await supabase
        .from('trial_reminders_sent')
        .select('id')
        .eq('user_id', u.id)
        .eq('day', day)
        .maybeSingle()
      if (already) { skipped++; continue }

      // Send email
      const name =
        (u.user_metadata?.display_name as string | undefined) ||
        (u.user_metadata?.name as string | undefined) ||
        u.email.split('@')[0]

      const { error: sendErr } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'trial-reminder',
          recipientEmail: u.email,
          idempotencyKey: `trial-reminder-${u.id}-day${day}`,
          templateData: { name, daysLeft },
        },
      })

      if (sendErr) {
        console.error('send failed', { user: u.id, error: sendErr })
        errors++
        continue
      }

      await supabase.from('trial_reminders_sent').insert({ user_id: u.id, day })
      sent++
    }

    results.push({ day, sent, skipped, errors })
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
