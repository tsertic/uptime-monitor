import { NextResponse } from "next/server";
import { requireUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  interval: z.number().int().min(1).max(60).optional(),
  active: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

async function getMonitor(userId: string, monitorId: string) {
  const monitor = await prisma.monitor.findUnique({ where: { id: monitorId } });
  if (!monitor || monitor.userId !== userId) return null;
  return monitor;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const monitor = await getMonitor(user.id, id);
    if (!monitor) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = patchSchema.parse(await req.json());

    const updateData: Record<string, unknown> = { ...body };
    if (body.isPublic && !monitor.publicSlug) {
      updateData.publicSlug = nanoid();
    }

    const updated = await prisma.monitor.update({ where: { id }, data: updateData });
    return NextResponse.json({ monitor: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const monitor = await getMonitor(user.id, id);
    if (!monitor) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.monitor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
