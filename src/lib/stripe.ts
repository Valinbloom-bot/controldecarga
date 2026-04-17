import { loadStripe, Stripe } from "@stripe/stripe-js";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export const PAYMENTS_ENV: "sandbox" | "live" =
  clientToken?.startsWith("pk_live_") ? "live" : "sandbox";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!clientToken) throw new Error("VITE_PAYMENTS_CLIENT_TOKEN is not set");
    stripePromise = loadStripe(clientToken);
  }
  return stripePromise;
}

export const isTestMode = PAYMENTS_ENV === "sandbox";
