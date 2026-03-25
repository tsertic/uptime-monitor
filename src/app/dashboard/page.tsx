import { requireUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireUser();

  const monitors = await prisma.monitor.findMany({
    where: { userId: user.id },
    include: {
      incidents: { where: { status: "OPEN" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const upCount = monitors.filter((m) => m.status === "UP").length;
  const downCount = monitors.filter((m) => m.status === "DOWN").length;
  const avgUptime =
    monitors.length > 0
      ? Math.round(monitors.reduce((sum, m) => sum + m.uptimePercent, 0) / monitors.length * 100) / 100
      : 100;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <Link
          href="/dashboard/monitors"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Add monitor
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total monitors" value={monitors.length} />
        <StatCard label="Operational" value={upCount} color="green" />
        <StatCard label="Down" value={downCount} color={downCount > 0 ? "red" : "gray"} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Monitors</h2>
          <span className="text-sm text-gray-500">Avg uptime: {avgUptime}%</span>
        </div>
        {monitors.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <p className="mb-4">No monitors yet.</p>
            <Link href="/dashboard/monitors" className="text-gray-900 underline text-sm">
              Add your first monitor
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {monitors.map((monitor) => (
              <li key={monitor.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusDot status={monitor.status} />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{monitor.name}</p>
                    <p className="text-gray-400 text-xs">{monitor.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>{monitor.uptimePercent}% uptime</span>
                  {monitor.responseTime && <span>{monitor.responseTime}ms</span>}
                  <span className="capitalize">{monitor.status.toLowerCase()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "gray" }: { label: string; value: number; color?: string }) {
  const colors: Record<string, string> = {
    gray: "text-gray-900",
    green: "text-green-600",
    red: "text-red-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    UP: "bg-green-500",
    DOWN: "bg-red-500",
    UNKNOWN: "bg-gray-300",
  };
  return <span className={`w-2.5 h-2.5 rounded-full ${colors[status] ?? "bg-gray-300"}`} />;
}
