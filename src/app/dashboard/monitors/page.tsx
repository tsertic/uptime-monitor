"use client";

import { useState, useEffect } from "react";

interface Monitor {
  id: string;
  name: string;
  url: string;
  interval: number;
  status: string;
  uptimePercent: number;
  responseTime: number | null;
  isPublic: boolean;
  publicSlug: string | null;
}

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", interval: "5" });

  useEffect(() => {
    fetch("/api/monitors")
      .then((r) => r.json())
      .then((data) => {
        setMonitors(data.monitors ?? []);
        setLoaded(true);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, interval: Number(form.interval) }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Failed to create monitor");
        return;
      }
      setMonitors((prev) => [data.monitor, ...prev]);
      setShowForm(false);
      setForm({ name: "", url: "", interval: "5" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this monitor?")) return;
    await fetch(`/api/monitors/${id}`, { method: "DELETE" });
    setMonitors((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleTogglePublic(monitor: Monitor) {
    const res = await fetch(`/api/monitors/${monitor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !monitor.isPublic }),
    });
    const data = await res.json();
    setMonitors((prev) => prev.map((m) => (m.id === monitor.id ? data.monitor : m)));
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Monitors</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Add monitor
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-semibold text-gray-900 mb-4">New monitor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="My website"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">URL</label>
                <input
                  required
                  type="url"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://example.com"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Check interval</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={form.interval}
                  onChange={(e) => setForm({ ...form, interval: e.target.value })}
                >
                  <option value="1">1 minute (Pro)</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create monitor"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        {!loaded ? (
          <div className="px-6 py-16 text-center text-gray-400">Loading...</div>
        ) : monitors.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            No monitors yet. Add one above.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {monitors.map((monitor) => (
              <li key={monitor.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusDot status={monitor.status} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{monitor.name}</p>
                      <p className="text-gray-400 text-xs">{monitor.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">{monitor.uptimePercent}% uptime</span>
                    {monitor.responseTime && (
                      <span className="text-xs text-gray-500">{monitor.responseTime}ms</span>
                    )}
                    <button
                      onClick={() => handleTogglePublic(monitor)}
                      className={`text-xs px-2 py-1 rounded ${
                        monitor.isPublic
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {monitor.isPublic ? "Public" : "Private"}
                    </button>
                    {monitor.isPublic && monitor.publicSlug && (
                      <a
                        href={`/status/${monitor.publicSlug}`}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Status page
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(monitor.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    UP: "bg-green-500",
    DOWN: "bg-red-500",
    UNKNOWN: "bg-gray-300",
  };
  return <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[status] ?? "bg-gray-300"}`} />;
}
