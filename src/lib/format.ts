import type { Money } from "@/src/lib/shopify/types";

export function formatMoney(money: Money) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}