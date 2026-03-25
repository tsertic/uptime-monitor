import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">UP</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg">UptimePulse</span>
        </div>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <Link href="/dashboard" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Sign in
              </Link>
              <Link href="/sign-up" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                Get started free
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
          Free plan includes 3 monitors
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Know when your sites go down<br />
          <span className="text-green-500">before your clients do</span>
        </h1>

        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Monitor your websites every 5 minutes. Get instant email alerts when something goes wrong.
          Share a public status page with your clients.
        </p>

        <div className="flex items-center justify-center gap-4">
          {isSignedIn ? (
            <Link href="/dashboard" className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors text-lg">
              Go to dashboard
            </Link>
          ) : (
            <Link href="/sign-up" className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors text-lg">
              Start monitoring free
            </Link>
          )}
          <Link href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium text-lg">
            See pricing
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-8 text-left">
          {[
            { title: "Instant alerts", desc: "Email notification the moment your site goes down." },
            { title: "Public status page", desc: "Share a status page with your clients at yourname.uptimepulse.com." },
            { title: "30-day uptime history", desc: "Track response times and uptime percentage over time." },
          ].map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <div id="pricing" className="mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-gray-500 mb-12">Start free, upgrade when you need more.</p>

          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="border border-gray-200 rounded-xl p-8 text-left">
              <div className="text-2xl font-bold text-gray-900 mb-1">Free</div>
              <div className="text-gray-500 text-sm mb-6">Forever free</div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8">
                <li>3 monitors</li>
                <li>5-minute checks</li>
                <li>Email alerts</li>
                <li>Public status page</li>
              </ul>
              <Link href="/sign-up" className="block text-center border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:border-gray-900 transition-colors">
                Get started
              </Link>
            </div>

            <div className="border-2 border-gray-900 rounded-xl p-8 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                Most popular
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Pro</div>
              <div className="text-gray-500 text-sm mb-6">€9 / month</div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8">
                <li>Unlimited monitors</li>
                <li>1-minute checks</li>
                <li>Email alerts</li>
                <li>Public status pages</li>
                <li>Custom domains (soon)</li>
              </ul>
              <Link href="/sign-up" className="block text-center bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors">
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
