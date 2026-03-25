"use client";

import { useState, useEffect } from "react";

interface Settings {
  emailEnabled: boolean;
  emailAddress: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ emailEnabled: true, emailAddress: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Notifications</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.emailEnabled}
              onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Email alerts when monitor goes down or recovers</span>
          </label>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Alert email address</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={settings.emailAddress}
              onChange={(e) => setSettings({ ...settings, emailAddress: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
