import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkMonitor } from "@/lib/monitor";

// Called by external cron (e.g. Vercel Cron, cron-job.org) every minute
// Vercel Cron config is in vercel.json
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const monitors = await prisma.monitor.findMany({
    where: { active: true },
    select: { id: true, interval: true, lastChecked: true },
  });

  const due = monitors.filter((m) => {
    if (!m.lastChecked) return true;
    const nextCheck = new Date(m.lastChecked.getTime() + m.interval * 60 * 1000);
    return now >= nextCheck;
  });

  await Promise.allSettled(due.map((m) => checkMonitor(m.id)));

  return NextResponse.json({ checked: due.length, total: monitors.length });
}
