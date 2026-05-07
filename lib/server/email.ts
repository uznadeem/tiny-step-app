import nodemailer from 'nodemailer'

import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'

export type EmailTemplateType = 'waitlist_welcome' | 'waitlist_followup' | 'waitlist_launch' | 'weekly_nudge'

type EmailTemplate = {
  subject: string
  html_body: string
}

type SendTemplateEmailInput = {
  to: string
  type: EmailTemplateType
  variables: Record<string, string>
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing ${name}.`)
  }

  return value
}

function createGmailTransport() {
  const user = getRequiredEnv('GMAIL_SMTP_USER')
  const pass = getRequiredEnv('GMAIL_SMTP_APP_PASSWORD')

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  })
}

export function getAppUrl() {
  return (process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function getDashboardUrl() {
  return `${getAppUrl()}/dashboard`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function replacePlaceholders(template: string, variables: Record<string, string>) {
  return template.replaceAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key: string) => escapeHtml(variables[key] ?? ''))
}

export function createWaitlistUnsubscribeUrl(token: string) {
  return `${getAppUrl()}/api/waitlist/unsubscribe?token=${encodeURIComponent(token)}`
}

export async function getEmailTemplate(type: EmailTemplateType): Promise<EmailTemplate> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('email_templates')
    .select('subject, html_body')
    .eq('type', type)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load ${type} email template.`)
  }

  if (!data) {
    throw new Error(`Missing ${type} email template.`)
  }

  return data
}

async function logEmailSent(email: string, emailType: EmailTemplateType) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('email_logs')
    .insert({
      email,
      email_type: emailType,
    })

  if (error) {
    console.error('Email log insert failed', {
      emailType,
      error: error.message,
    })
  }
}

export async function sendTemplateEmail({ to, type, variables }: SendTemplateEmailInput) {
  const from = getRequiredEnv('SMTP_FROM_EMAIL')
  const replyTo = process.env.SMTP_REPLY_TO_EMAIL?.trim()
  const template = await getEmailTemplate(type)
  const subject = replacePlaceholders(template.subject, variables)
  const html = replacePlaceholders(template.html_body, variables)

  try {
    const transport = createGmailTransport()

    await transport.sendMail({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    })
    await logEmailSent(to, type)
  } catch (error) {
    console.error('Gmail SMTP email request failed', {
      type,
      error: error instanceof Error ? error.message : error,
    })
    throw new Error('Email delivery failed.')
  }
}
