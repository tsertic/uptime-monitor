import { NextResponse } from "next/server";
import { requireUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { FREE_MONITOR_LIMIT } from "@/lib/stripe";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  interval: z.number().int().min(1).max(60).default(5),
});

export async function GET() {
  try {
    const user = await requireUser();
    const monitors = await prisma.monitor.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ monitors });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const count = await prisma.monitor.count({ where: { userId: user.id } });
    if (user.plan === "FREE" && count >= FREE_MONITOR_LIMIT) {
      return NextResponse.json(
        { error: `Free plan is limited to ${FREE_MONITOR_LIMIT} monitors. Upgrade to Pro for unlimited.` },
        { status: 403 }
      );
    }

    const body = createSchema.parse(await req.json());

    // Pro-only: 1-minute interval
    if (body.interval === 1 && user.plan !== "PRO") {
      return NextResponse.json({ error: "1-minute interval requires Pro plan." }, { status: 403 });
    }

    const monitor = await prisma.monitor.create({
      data: {
        userId: user.id,
        name: body.name,
        url: body.url,
        interval: body.interval,
      },
    });

    return NextResponse.json({ monitor }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
