insert into public.email_templates (type, subject, html_body)
values
(
  'waitlist_welcome',
  'you just made the list 🌸',
  $tinystep_email$
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>you just made the list</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f1ff;font-family:Arial,Helvetica,sans-serif;color:#2d1b4e;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">You're on the Tinystep waitlist, and honestly? I'm so glad you're here.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1ff;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:10px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:760px;background:#ffffff;border-radius:24px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:38px 28px;background:linear-gradient(135deg,#fff7ed 0%,#fdf4ff 100%);border-bottom:1px solid #eee7f7;">
                <div style="font-size:40px;line-height:1;font-weight:900;letter-spacing:-2px;color:#2d1b4e;">tiny<span style="color:#ff4d4d;">step</span></div>
                <div style="margin-top:12px;font-size:16px;line-height:1.4;font-weight:700;color:#a99db8;">Subject: you just made the list 🌸</div>
              </td>
            </tr>
            <tr>
              <td style="padding:44px 38px 34px;background:#ffffff;">
                <h1 style="margin:0 0 30px;font-size:24px;line-height:1.3;color:#2d1b4e;font-weight:900;">hey {{first_name}} 👋</h1>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">you're on the list. and honestly? i'm so glad you're here.</p>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">i'm alisha, and i built tinystep because i got tired of every planner making me feel worse about myself when i couldn't keep up.</p>
                <p style="margin:0 0 30px;font-size:20px;line-height:1.7;color:#2f2b36;">you know that task that's been sitting on your list for days? the one that would probably take 10 minutes but feels completely impossible to start?</p>
                <div style="margin:32px 0;padding:24px 28px;border-left:5px solid #ff4d4d;border-radius:0 16px 16px 0;background:linear-gradient(135deg,#fff1f2 0%,#f3e8ff 100%);">
                  <p style="margin:0;font-size:20px;line-height:1.6;font-weight:900;color:#2d1b4e;">tinystep is for that task. and every task after it. 💛</p>
                </div>
                <p style="margin:0 0 24px;font-size:20px;line-height:1.7;color:#2f2b36;">here's what we're building for you:</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:20px;">✨</td>
                    <td style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:19px;line-height:1.6;color:#2f2b36;">AI that breaks any task into micro-steps so small the first one takes under 60 seconds</td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:20px;">🔋</td>
                    <td style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:19px;line-height:1.6;color:#2f2b36;">an energy check-in before every task, because monday-morning-you and thursday-afternoon-you are different people</td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:20px;">😵‍💫</td>
                    <td style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:19px;line-height:1.6;color:#2f2b36;">a "I'm stuck" button that gives you a compassionate nudge instead of a productivity lecture</td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:20px;">🎉</td>
                    <td style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:19px;line-height:1.6;color:#2f2b36;">actual confetti when you finish, because every win counts</td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;font-size:20px;">💛</td>
                    <td style="padding:16px 0;font-size:19px;line-height:1.6;color:#2f2b36;">zero streaks, zero shame, zero "you missed 5 days" guilt trips. ever.</td>
                  </tr>
                </table>
                <p style="margin:32px 0 0;font-size:20px;line-height:1.7;color:#2f2b36;">we're launching in a few weeks and you'll be the first to know when the doors open.</p>
                <p style="margin:28px 0 0;font-size:20px;line-height:1.7;color:#2f2b36;">in the meantime, hit reply and tell me: what's the one task that's been haunting your list? i read every single one. 💌</p>
                <div style="margin-top:42px;padding-top:30px;border-top:1px solid #eeeaf2;">
                  <p style="margin:0 0 10px;font-size:20px;line-height:1.4;font-weight:900;color:#2d1b4e;">alisha</p>
                  <p style="margin:0 0 10px;font-size:18px;line-height:1.5;color:#9f95b1;">founder, tinystep</p>
                  <p style="margin:0;font-size:18px;line-height:1.5;color:#b0a6c0;">your brain isn't broken. your planner just was. 💛</p>
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 28px;background:#f7f1ff;border-top:1px solid #eee7f7;">
                <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#aaa0bc;">tinystep · you're receiving this because you joined our waitlist</p>
                <p style="margin:0;font-size:15px;line-height:1.5;color:#aaa0bc;"><a href="{{unsubscribe_url}}" style="color:#ff4d4d;text-decoration:none;">unsubscribe</a> · no hard feelings if you do 💛</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
$tinystep_email$
),
(
  'waitlist_followup',
  'real question 👇',
  $tinystep_email$
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>real question</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f1ff;font-family:Arial,Helvetica,sans-serif;color:#2d1b4e;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">How many of these are you right now?</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1ff;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:760px;background:#ffffff;border-radius:24px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:38px 28px;background:linear-gradient(135deg,#fff7ed 0%,#fdf4ff 100%);border-bottom:1px solid #eee7f7;">
                <div style="font-size:40px;line-height:1;font-weight:900;letter-spacing:-2px;color:#2d1b4e;">tiny<span style="color:#ff4d4d;">step</span></div>
                <div style="margin-top:12px;font-size:16px;line-height:1.4;font-weight:700;color:#a99db8;">Subject: real question 👇</div>
              </td>
            </tr>
            <tr>
              <td style="padding:44px 38px 34px;background:#ffffff;">
                <h1 style="margin:0 0 30px;font-size:24px;line-height:1.3;color:#2d1b4e;font-weight:900;">hey {{first_name}} 💛</h1>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">i have a question and i need you to be honest with me.</p>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">how many of these are you right now?</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:20px;">✅</td>
                    <td style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:19px;line-height:1.6;color:#2f2b36;">to-do list that genuinely stresses you out to look at</td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:20px;">✅</td>
                    <td style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:19px;line-height:1.6;color:#2f2b36;">tasks that would take 10 minutes but have been there for weeks</td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:20px;">✅</td>
                    <td style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:19px;line-height:1.6;color:#2f2b36;">started 4 things today, finished none</td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:20px;">✅</td>
                    <td style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:19px;line-height:1.6;color:#2f2b36;">reorganised your entire wardrobe instead of doing the actual thing</td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;font-size:20px;">✅</td>
                    <td style="padding:16px 0;font-size:19px;line-height:1.6;color:#2f2b36;">feels like your brain is everywhere and nowhere at once</td>
                  </tr>
                </table>
                <div style="margin:34px 0;padding:24px 28px;border-left:5px solid #ff4d4d;border-radius:0 16px 16px 0;background:linear-gradient(135deg,#fff1f2 0%,#f3e8ff 100%);">
                  <p style="margin:0;font-size:20px;line-height:1.7;font-weight:900;color:#2d1b4e;">this isn't a lack of willpower. it's not laziness. it's a brain that needs a different kind of support. 🧠</p>
                </div>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">that's exactly why i'm building tinystep. not to add another system to your life, but to give your brain the tiny nudge it needs to just... start.</p>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">we're getting close to launch and i couldn't be more excited to get this into your hands.</p>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">while you wait, i'd love to know: which of those dots above is you? just hit reply with a number 😁</p>
                <p style="margin:0;font-size:20px;line-height:1.7;color:#2f2b36;">i genuinely read every reply. you're not emailing a robot. 💌</p>
                <div style="margin-top:42px;padding-top:30px;border-top:1px solid #eeeaf2;">
                  <p style="margin:0 0 10px;font-size:20px;line-height:1.4;font-weight:900;color:#2d1b4e;">alisha</p>
                  <p style="margin:0 0 10px;font-size:18px;line-height:1.5;color:#9f95b1;">founder, tinystep</p>
                  <p style="margin:0;font-size:18px;line-height:1.5;color:#b0a6c0;">tiny steps. big wins. zero shame. 💛</p>
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 28px;background:#f7f1ff;border-top:1px solid #eee7f7;">
                <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#aaa0bc;">tinystep · you're receiving this because you joined our waitlist</p>
                <p style="margin:0;font-size:15px;line-height:1.5;color:#aaa0bc;"><a href="{{unsubscribe_url}}" style="color:#ff4d4d;text-decoration:none;">unsubscribe</a> · no hard feelings if you do 💛</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
$tinystep_email$
),
(
  'waitlist_launch',
  'the doors are open 🎉 (you''re first)',
  $tinystep_email$
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>the doors are open</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f1ff;font-family:Arial,Helvetica,sans-serif;color:#2d1b4e;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Tinystep is live, and you're first through the door.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1ff;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:760px;background:#ffffff;border-radius:24px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:38px 28px;background:linear-gradient(135deg,#fff7ed 0%,#fdf4ff 100%);border-bottom:1px solid #eee7f7;">
                <div style="font-size:40px;line-height:1;font-weight:900;letter-spacing:-2px;color:#2d1b4e;">tiny<span style="color:#ff4d4d;">step</span></div>
                <div style="margin-top:12px;font-size:16px;line-height:1.4;font-weight:700;color:#a99db8;">Subject: the doors are open 🎉 (you're first)</div>
              </td>
            </tr>
            <tr>
              <td style="padding:44px 38px 34px;background:#ffffff;">
                <h1 style="margin:0 0 30px;font-size:24px;line-height:1.3;color:#2d1b4e;font-weight:900;">{{first_name}}!!!! 🎉</h1>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">this is the email i've been waiting to send you.</p>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;"><strong>tinystep is live. and you're first through the door.</strong></p>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">you joined our waitlist because something about this resonated with you. that task that won't budge. that brain that works differently. that feeling of knowing what to do and just... not being able to start.</p>
                <p style="margin:0 0 34px;font-size:20px;line-height:1.7;color:#2f2b36;">we built tinystep for exactly that moment.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:0 0 22px;">
                      <a href="{{app_url}}" style="display:block;background:linear-gradient(135deg,#ff4d4d 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;font-size:22px;line-height:1.3;font-weight:900;border-radius:16px;padding:24px 28px;box-shadow:0 14px 28px rgba(255,77,77,0.18);">→ start your free 7 days now</a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0 0 28px;font-size:17px;line-height:1.6;color:#aaa0bc;">no credit card needed. cancel any time. seriously.</td>
                  </tr>
                </table>
                <p style="margin:0 0 20px;font-size:20px;line-height:1.7;color:#2f2b36;">as a waitlist member you get:</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:20px;">🎁</td>
                    <td style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:19px;line-height:1.6;color:#2f2b36;"><strong>7 days completely free</strong>, no card required</td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:20px;">⭐</td>
                    <td style="padding:16px 0;border-bottom:1px solid #eeeaf2;font-size:19px;line-height:1.6;color:#2f2b36;"><strong>founding member pricing</strong>, locked in forever at $7/mo or $49/yr</td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:16px 0;font-size:20px;">💌</td>
                    <td style="padding:16px 0;font-size:19px;line-height:1.6;color:#2f2b36;"><strong>direct access to me</strong>, reply to this email any time, i mean it</td>
                  </tr>
                </table>
                <div style="margin:34px 0;padding:24px 28px;border-left:5px solid #ff4d4d;border-radius:0 16px 16px 0;background:linear-gradient(135deg,#fff1f2 0%,#f3e8ff 100%);">
                  <p style="margin:0;font-size:20px;line-height:1.7;font-weight:900;color:#2d1b4e;">you waited for this. your brain deserves a planner that actually works with it. today's the day. 💛</p>
                </div>
                <p style="margin:0;font-size:20px;line-height:1.7;color:#2f2b36;">i cannot wait to hear what you think. seriously, reply and tell me the first task you break down. i want to celebrate with you. 🎉</p>
                <div style="margin-top:42px;padding-top:30px;border-top:1px solid #eeeaf2;">
                  <p style="margin:0 0 10px;font-size:20px;line-height:1.4;font-weight:900;color:#2d1b4e;">alisha</p>
                  <p style="margin:0 0 10px;font-size:18px;line-height:1.5;color:#9f95b1;">founder, tinystep</p>
                  <p style="margin:0;font-size:18px;line-height:1.5;color:#b0a6c0;">your brain isn't broken. your planner just was. 💛</p>
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 28px;background:#f7f1ff;border-top:1px solid #eee7f7;">
                <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#aaa0bc;">tinystep · you're receiving this because you joined our waitlist</p>
                <p style="margin:0;font-size:15px;line-height:1.5;color:#aaa0bc;"><a href="{{unsubscribe_url}}" style="color:#ff4d4d;text-decoration:none;">unsubscribe</a> · no hard feelings if you do 💛</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
$tinystep_email$
),
(
  'weekly_nudge',
  'what''s one thing? 💛',
  $tinystep_email$
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>what's one thing?</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f1ff;font-family:Arial,Helvetica,sans-serif;color:#2d1b4e;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">It's Sunday. What's the one thing that would help you feel like you moved forward this week?</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1ff;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:10px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:760px;background:#ffffff;border-radius:24px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:38px 28px;background:linear-gradient(135deg,#fff7ed 0%,#fdf4ff 100%);border-bottom:1px solid #eee7f7;">
                <div style="font-size:40px;line-height:1;font-weight:900;letter-spacing:-2px;color:#2d1b4e;">tiny<span style="color:#ff4d4d;">step</span></div>
                <div style="margin-top:12px;font-size:16px;line-height:1.4;font-weight:700;color:#a99db8;">Subject: what's one thing? 💛</div>
              </td>
            </tr>
            <tr>
              <td style="padding:44px 38px 34px;background:#ffffff;">
                <h1 style="margin:0 0 30px;font-size:24px;line-height:1.3;color:#2d1b4e;font-weight:900;">Hey {{first_name}}</h1>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">it's Sunday, a new week is about to start.</p>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">Before the noise kicks in, I want to ask you one thing:</p>
                <div style="margin:32px 0;padding:24px 28px;border-left:5px solid #ff4d4d;border-radius:0 16px 16px 0;background:linear-gradient(135deg,#fff1f2 0%,#f3e8ff 100%);">
                  <p style="margin:0;font-size:20px;line-height:1.7;font-weight:900;color:#2d1b4e;">What's the ONE task that, if you got it done this week, would make you feel like you actually moved forward?</p>
                </div>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">Not your whole list. Not everything. Just one.</p>
                <p style="margin:0 0 34px;font-size:20px;line-height:1.7;color:#2f2b36;">Open tinystep, drop it in, and let it break it down for you. That's it. That's the whole plan.</p>
                <p style="margin:0 0 28px;font-size:20px;line-height:1.7;color:#2f2b36;">One task. Tiny steps. You've got this.</p>
                <div style="margin-top:42px;padding-top:30px;border-top:1px solid #eeeaf2;">
                  <p style="margin:0 0 10px;font-size:20px;line-height:1.4;font-weight:900;color:#2d1b4e;">Alisha</p>
                  <p style="margin:0;font-size:18px;line-height:1.5;color:#9f95b1;">Founder, tinystep</p>
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 28px;background:#f7f1ff;border-top:1px solid #eee7f7;">
                <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#aaa0bc;">tinystep · you're receiving because weekly nudges are enabled</p>
                <p style="margin:0;font-size:15px;line-height:1.5;color:#aaa0bc;"><a href="{{dashboard_url}}" style="color:#ff4d4d;text-decoration:none;">manage preferences</a> · no hard feelings if you pause them 💛</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
$tinystep_email$
)
on conflict (type) do nothing;
