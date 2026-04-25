import { isTestMode } from "@/lib/stripe";

export function PaymentTestModeBanner() {
  if (!isTestMode) return null;
  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/40 px-3 py-1.5 text-center text-[11px] text-amber-900 dark:text-amber-200">
      Test mode — use card <span className="font-mono font-semibold">4242 4242 4242 4242</span>, any future date and any CVC.
    </div>
  );
}
