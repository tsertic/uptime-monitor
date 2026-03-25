import axios from "axios";
import { prisma } from "./prisma";
import { sendDownAlert, sendUpAlert } from "./resend";
import { MonitorStatus } from "@prisma/client";

export async function checkMonitor(monitorId: string) {
  const monitor = await prisma.monitor.findUnique({
    where: { id: monitorId },
    include: {
      user: {
        include: { notifications: true },
      },
      incidents: {
        where: { status: "OPEN" },
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!monitor || !monitor.active) return;

  const startTime = Date.now();
  let status: MonitorStatus = "DOWN";
  let statusCode: number | undefined;
  let error: string | undefined;
  let responseTime: number | undefined;

  try {
    const response = await axios.get(monitor.url, {
      timeout: 10000,
      validateStatus: (s) => s < 500,
    });
    statusCode = response.status;
    responseTime = Date.now() - startTime;
    status = response.status < 400 ? "UP" : "DOWN";
  } catch (err: unknown) {
    responseTime = Date.now() - startTime;
    if (axios.isAxiosError(err)) {
      error = err.message;
      if (err.response) {
        statusCode = err.response.status;
        status = "DOWN";
      }
    } else {
      error = "Unknown error";
    }
  }

  await prisma.check.create({
    data: {
      monitorId: monitor.id,
      status,
      statusCode,
      responseTime,
      error,
    },
  });

  const previousStatus = monitor.status;
  const openIncident = monitor.incidents[0];

  if (status === "DOWN" && previousStatus !== "DOWN") {
    await prisma.incident.create({
      data: {
        monitorId: monitor.id,
        message: error ?? `Status code: ${statusCode}`,
      },
    });

    const notifSettings = monitor.user.notifications;
    if (notifSettings?.emailEnabled && notifSettings.emailAddress) {
      await sendDownAlert({
        to: notifSettings.emailAddress,
        monitorName: monitor.name,
        url: monitor.url,
        error,
      }).catch(console.error);
    }
  } else if (status === "UP" && previousStatus === "DOWN" && openIncident) {
    await prisma.incident.update({
      where: { id: openIncident.id },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });

    const downtime = formatDowntime(openIncident.startedAt, new Date());
    const notifSettings = monitor.user.notifications;
    if (notifSettings?.emailEnabled && notifSettings.emailAddress) {
      await sendUpAlert({
        to: notifSettings.emailAddress,
        monitorName: monitor.name,
        url: monitor.url,
        downtime,
      }).catch(console.error);
    }
  }

  const uptimePercent = await calculateUptime(monitor.id);

  await prisma.monitor.update({
    where: { id: monitor.id },
    data: {
      status,
      lastChecked: new Date(),
      lastStatusCode: statusCode,
      responseTime,
      uptimePercent,
    },
  });
}

async function calculateUptime(monitorId: string): Promise<number> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const checks = await prisma.check.findMany({
    where: { monitorId, checkedAt: { gte: since } },
    select: { status: true },
  });
  if (checks.length === 0) return 100;
  const upCount = checks.filter((c) => c.status === "UP").length;
  return Math.round((upCount / checks.length) * 10000) / 100;
}

function formatDowntime(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
