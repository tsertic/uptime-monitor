import { requireUser } from "@/lib/user";
import { PLANS } from "@/lib/stripe";
import Link from "next/link";

export default async function BillingPage() {
  const user = await requireUser();
  const isPro = user.plan === "PRO";

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Billing</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-900">Current plan</p>
            <p className="text-sm text-gray-500">
              {isPro ? "Pro — unlimited monitors" : "Free — up to 3 monitors"}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${isPro ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {isPro ? "Pro" : "Free"}
          </span>
        </div>

        {isPro ? (
          <form action="/api/billing/portal" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-600 underline hover:text-gray-900"
            >
              Manage subscription / cancel
            </button>
          </form>
        ) : (
          <form action="/api/billing/checkout" method="POST">
            <button
              type="submit"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Upgrade to Pro — €9/month
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div
            key={key}
            className={`rounded-xl border p-5 ${user.plan === key ? "border-gray-900 bg-gray-50" : "border-gray-200"}`}
          >
            <div className="font-semibold text-gray-900 mb-1">{plan.name}</div>
            <div className="text-2xl font-bold text-gray-900 mb-3">
              {plan.price === 0 ? "Free" : `€${plan.price}/mo`}
            </div>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>{plan.monitors === Infinity ? "Unlimited" : plan.monitors} monitors</li>
              <li>Email alerts</li>
              <li>Public status pages</li>
              {key === "PRO" && <li>1-minute checks</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
