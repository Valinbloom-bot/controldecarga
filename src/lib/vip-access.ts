const VIP_EMAILS = [
  "medusashookah@gmail.com",
  "ojose122687@gmail.com",
] as const;

export function isVipEmail(email?: string | null) {
  return !!email && VIP_EMAILS.includes(email.toLowerCase() as (typeof VIP_EMAILS)[number]);
}

export { VIP_EMAILS };