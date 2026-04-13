"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  contactPerson?: string;
  timezone?: string;
  status: string;
  services: Array<{ type: string; status: string; monthlyCost?: number }>;
  createdAt: string;
  calendars: Array<{
    id: string; month: string; year: number; status: string; createdAt: string;
    _count: { briefs: number };
  }>;
  projects: Array<{
    id: string; name: string; type: string; status: string; progressPercentage: number; createdAt: string;
  }>;
  _count: { shoots: number; videos: number };
}

const serviceLabels: Record<string, string> = {
  social_media: "Social Media", app_dev: "App Development", web_dev: "Web Development",
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "calendars" | "projects">("overview");

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setClient(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <Topbar title="Client" />
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-28 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!client) return (
    <div>
      <Topbar title="Client" />
      <div className="p-6"><p className="text-[#9CA3AF]">Client not found.</p></div>
    </div>
  );

  const tabs = ["overview", "calendars", "projects"] as const;

  return (
    <div>
      <Topbar title={client.name} />
      <div className="p-6 space-y-5">

        {/* Header card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#6B5B95]/10 flex items-center justify-center text-[#6B5B95] font-bold text-xl">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#2D3142]">{client.name}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(client.status)}`}>
                    {getStatusLabel(client.status)}
                  </span>
                </div>
                <p className="text-[#6B7280] text-sm mt-0.5">{client.email}</p>
                {client.contactPerson && <p className="text-xs text-[#9CA3AF] mt-0.5">Contact: {client.contactPerson}</p>}
              </div>
            </div>
            <Link href={`/clients`} className="text-sm text-[#6B5B95] hover:underline">← All Clients</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#F3F4F6]">
            {[
              { label: "Calendars", value: client.calendars.length },
              { label: "Projects", value: client.projects.length },
              { label: "Shoots", value: client._count.shoots },
              { label: "Videos", value: client._count.videos },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-[#6B5B95]">{value}</p>
                <p className="text-xs text-[#9CA3AF] font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-[#E5E7EB] p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? "bg-[#6B5B95] text-white" : "text-[#6B7280] hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact info */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-semibold text-[#2D3142] mb-4">Contact Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Email", value: client.email },
                  { label: "Phone", value: client.phone || "—" },
                  { label: "Contact Person", value: client.contactPerson || "—" },
                  { label: "Timezone", value: client.timezone || "—" },
                  { label: "Member Since", value: formatDate(client.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#9CA3AF]">{label}</span>
                    <span className="text-[#2D3142] font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-semibold text-[#2D3142] mb-4">Active Services</h3>
              {client.services.length === 0 ? (
                <p className="text-[#9CA3AF] text-sm">No services configured</p>
              ) : (
                <div className="space-y-3">
                  {client.services.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#2D3142]">{serviceLabels[s.type] || s.type}</p>
                        {s.monthlyCost && <p className="text-xs text-[#9CA3AF]">₹{s.monthlyCost}/mo</p>}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(s.status)}`}>
                        {getStatusLabel(s.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 md:col-span-2">
              <h3 className="font-semibold text-[#2D3142] mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { href: `/calendars?clientId=${client.id}`, icon: "📅", label: "View Calendars" },
                  { href: `/shoots?clientId=${client.id}`, icon: "🎬", label: "View Shoots" },
                  { href: `/videos?clientId=${client.id}`, icon: "🎥", label: "View Videos" },
                  { href: `/projects?clientId=${client.id}`, icon: "💻", label: "View Projects" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-2 p-3 border border-[#E5E7EB] rounded-lg hover:border-[#6B5B95]/40 hover:bg-[#6B5B95]/5 transition-colors text-sm font-medium text-[#2D3142]">
                    <span>{item.icon}</span> {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Calendars tab */}
        {activeTab === "calendars" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Link href="/calendars" className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors">
                + New Calendar
              </Link>
            </div>
            {client.calendars.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 text-center">
                <p className="text-3xl mb-2">📅</p>
                <p className="text-[#9CA3AF] text-sm">No calendars for this client yet</p>
              </div>
            ) : (
              client.calendars.map((cal) => (
                <div key={cal.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#2D3142]">{cal.month} {cal.year}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(cal.status)}`}>
                        {getStatusLabel(cal.status)}
                      </span>
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{cal._count.briefs} briefs · Created {formatDate(cal.createdAt)}</p>
                  </div>
                  <Link href={`/calendars/${cal.id}`} className="text-sm text-[#6B5B95] font-medium hover:underline">View →</Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Projects tab */}
        {activeTab === "projects" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Link href="/projects" className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors">
                + New Project
              </Link>
            </div>
            {client.projects.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 text-center">
                <p className="text-3xl mb-2">💻</p>
                <p className="text-[#9CA3AF] text-sm">No projects for this client yet</p>
              </div>
            ) : (
              client.projects.map((proj) => (
                <div key={proj.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#2D3142]">{proj.name}</p>
                      <span className="text-xs px-2 py-0.5 bg-[#5DCCC4]/10 text-[#2BAAA0] rounded-full font-medium capitalize">{proj.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(proj.status)}`}>
                        {getStatusLabel(proj.status)}
                      </span>
                    </div>
                    <Link href={`/projects/${proj.id}`} className="text-sm text-[#6B5B95] font-medium hover:underline">View →</Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#6B5B95] rounded-full" style={{ width: `${proj.progressPercentage}%` }} />
                    </div>
                    <span className="text-xs text-[#6B7280]">{proj.progressPercentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
