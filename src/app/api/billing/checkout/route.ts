import { NextResponse } from "next/server";
import { requireUser } from "@/lib/user";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const user = await requireUser();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
      success_url: `${appUrl}/dashboard/billing?success=1`,
      cancel_url: `${appUrl}/dashboard/billing`,
      metadata: { userId: user.id },
    });

    return NextResponse.redirect(session.url!, 303);
  } catch {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
