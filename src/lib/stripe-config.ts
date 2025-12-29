// Stripe Price IDs for TRIAD PRO
export const STRIPE_PRICES = {
  mensal: {
    priceId: "price_1SjiYh5DnYXQ7ukwje1UvvOi",
    productId: "prod_Th6m1pWNFDGFzZ",
    amount: 29,
    interval: "month" as const,
  },
  anual: {
    priceId: "price_1SjiYv5DnYXQ7ukwrBwOJNpB",
    productId: "prod_Th6mpfDBu73kTr",
    amount: 197,
    interval: "year" as const,
  },
} as const;

export type PlanInterval = keyof typeof STRIPE_PRICES;
