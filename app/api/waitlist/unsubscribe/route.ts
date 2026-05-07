import { jsonError, parseString } from '@/lib/server/api'
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'

export const runtime = 'nodejs'

function unsubscribeResponse(title: string, message: string, status = 200) {
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
  </head>
  <body style="margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(145deg,#fff1f2,#fdf4ff,#f0f9ff);font-family:Arial,Helvetica,sans-serif;color:#2d1b4e;">
    <main style="max-width:520px;margin:24px;padding:32px;border-radius:24px;background:white;border:1px solid #eee7f7;text-align:center;box-shadow:0 24px 60px rgba(45,27,78,0.12);">
      <div style="font-size:32px;font-weight:900;letter-spacing:-1px;color:#2d1b4e;">tiny<span style="color:#ff4d4d;">step</span></div>
      <h1 style="margin:24px 0 12px;font-size:28px;line-height:1.2;">${title}</h1>
      <p style="margin:0;font-size:17px;line-height:1.6;color:#6f647d;">${message}</p>
    </main>
  </body>
</html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  )
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = parseString(url.searchParams.get('token'))

    if (!token) {
      return unsubscribeResponse('Link expired', 'This unsubscribe link is invalid or expired.', 400)
    }

    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('waitlist_subscribers')
      .update({ status: 'unsubscribed' })
      .eq('unsubscribe_token', token)
      .select('id')
      .maybeSingle()

    if (error) {
      throw new Error('Unable to unsubscribe.')
    }

    if (!data) {
      return unsubscribeResponse('Link expired', 'This unsubscribe link is invalid or expired.', 400)
    }

    return unsubscribeResponse('You are unsubscribed', 'No hard feelings. You will not receive more waitlist emails from Tinystep. 💛')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unsubscribe request failed.'

    if (request.headers.get('accept')?.includes('application/json')) {
      return jsonError(message, 500)
    }

    return unsubscribeResponse('Something went wrong', 'We could not unsubscribe you just now. Please try again in a minute.', 500)
  }
}
