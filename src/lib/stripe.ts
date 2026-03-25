import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

export const FREE_MONITOR_LIMIT = 3;

export const PLANS = {
  FREE: {
    name: "Free",
    monitors: FREE_MONITOR_LIMIT,
    price: 0,
  },
  PRO: {
    name: "Pro",
    monitors: Infinity,
    price: 9,
  },
};
