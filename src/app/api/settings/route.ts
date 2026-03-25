import { NextResponse } from "next/server";
import { requireUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireUser();
    const settings = await prisma.notificationSettings.findUnique({
      where: { userId: user.id },
    });
    return NextResponse.json(settings ?? { emailEnabled: true, emailAddress: "" });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireUser();
    const { emailEnabled, emailAddress } = await req.json();

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: user.id },
      update: { emailEnabled, emailAddress },
      create: { userId: user.id, emailEnabled, emailAddress },
    });

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
