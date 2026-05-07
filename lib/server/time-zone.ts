const DEFAULT_APP_TIME_ZONE = 'Asia/Karachi'

export function getAppTimeZone() {
  return (
    process.env.APP_TIME_ZONE ||
    process.env.LLM_QUOTA_TIME_ZONE ||
    process.env.EMAIL_TIME_ZONE ||
    DEFAULT_APP_TIME_ZONE
  ).trim()
}
