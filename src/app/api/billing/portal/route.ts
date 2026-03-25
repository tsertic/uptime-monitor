import { NextResponse } from "next/server";
import { requireUser } from "@/lib/user";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const user = await requireUser();
    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return NextResponse.redirect(session.url, 303);
  } catch {
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
