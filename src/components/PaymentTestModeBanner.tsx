import { isTestMode } from "@/lib/stripe";

export function PaymentTestModeBanner() {
  if (!isTestMode) return null;
  return (
    <div className="w-full bg-orange-100 dark:bg-orange-950/40 border-b border-orange-300 dark:border-orange-800 px-3 py-1.5 text-center text-[11px] text-orange-900 dark:text-orange-200">
      Modo de prueba — usa la tarjeta <span className="font-mono font-semibold">4242 4242 4242 4242</span>, fecha futura y CVC cualquiera.
    </div>
  );
}
