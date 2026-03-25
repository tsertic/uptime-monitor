import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function StatusPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const monitor = await prisma.monitor.findUnique({
    where: { publicSlug: slug, isPublic: true },
    include: {
      incidents: {
        orderBy: { startedAt: "desc" },
        take: 10,
      },
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 48,
      },
    },
  });

  if (!monitor) notFound();

  const isUp = monitor.status === "UP";
  const openIncidents = monitor.incidents.filter((i) => i.status === "OPEN");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">UP</span>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Status page</p>
            <h1 className="font-semibold text-gray-900">{monitor.name}</h1>
          </div>
        </div>

        <div className={`rounded-xl p-6 mb-6 ${isUp ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isUp ? "bg-green-500" : "bg-red-500"}`} />
            <span className={`font-semibold text-lg ${isUp ? "text-green-800" : "text-red-800"}`}>
              {isUp ? "All systems operational" : "Service disruption"}
            </span>
          </div>
          <p className="text-sm mt-2 text-gray-500">
            {monitor.url} &nbsp;·&nbsp; {monitor.uptimePercent}% uptime (30d)
            {monitor.responseTime && ` · ${monitor.responseTime}ms avg response`}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Response time (last 48 checks)</h2>
          <UptimeBar checks={monitor.checks} />
        </div>

        {monitor.incidents.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Incident history</h2>
            <ul className="space-y-3">
              {monitor.incidents.map((incident) => (
                <li key={incident.id} className="flex items-start gap-3 text-sm">
                  <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${incident.status === "OPEN" ? "bg-red-500" : "bg-gray-300"}`} />
                  <div>
                    <p className="text-gray-700">
                      {incident.message ?? "Service disruption"}
                      {" · "}
                      <span className={incident.status === "OPEN" ? "text-red-600 font-medium" : "text-green-600"}>
                        {incident.status === "OPEN" ? "Ongoing" : "Resolved"}
                      </span>
                    </p>
                    <p className="text-gray-400 text-xs">
                      Started: {new Date(incident.startedAt).toLocaleString()}
                      {incident.resolvedAt && ` · Resolved: ${new Date(incident.resolvedAt).toLocaleString()}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-12">
          Powered by UptimePulse
        </p>
      </div>
    </div>
  );
}

function UptimeBar({ checks }: { checks: { status: string; responseTime: number | null; checkedAt: Date }[] }) {
  if (checks.length === 0) {
    return <p className="text-sm text-gray-400">No data yet.</p>;
  }

  return (
    <div className="flex items-end gap-0.5 h-12">
      {[...checks].reverse().map((check, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${check.status === "UP" ? "bg-green-400" : "bg-red-400"}`}
          style={{ height: check.responseTime ? `${Math.min(100, (check.responseTime / 2000) * 100)}%` : "20%" }}
          title={`${check.status} · ${check.responseTime ?? "?"}ms · ${new Date(check.checkedAt).toLocaleTimeString()}`}
        />
      ))}
    </div>
  );
}
