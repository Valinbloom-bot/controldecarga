const VIP_EMAILS = [
  "medusashookah@gmail.com",
  "ojose122687@gmail.com",
] as const;

export const VIP_LANDING_PATH = "/panel";

export function isVipEmail(email?: string | null) {
  return !!email && VIP_EMAILS.includes(email.toLowerCase() as (typeof VIP_EMAILS)[number]);
}

export function getPostLoginPath(email?: string | null) {
  return isVipEmail(email) ? VIP_LANDING_PATH : "/panel";
}

export { VIP_EMAILS };