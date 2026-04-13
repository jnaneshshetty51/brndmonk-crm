"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";

interface Deliverable {
  id: string;
  title: string;
  approved: boolean;
  link?: string;
}

interface Credential {
  label: string;
  url?: string;
  username?: string;
  password?: string;
  note?: string;
}

interface Integration {
  name: string;
  type: string;
  status: string;
  note?: string;
}

interface ClientFeedbackEntry {
  date: string;
  note: string;
  phase: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  description?: string;
  type: string;
  subType?: string;
  features: string[];
  status: string;
  progressPercentage: number;
  projectManagerId?: string;
  designerId?: string;
  devTeamIds: string[];
  deliverables: Deliverable[];
  credentials: Credential[];
  integrations: Integration[];
  clientFeedback: ClientFeedbackEntry[];
  deploymentLink?: string;
  deploymentDate?: string;
  maintenanceStatus?: string;
  maintenanceEndDate?: string;
  discoveryDeadline?: string;
  designDeadline?: string;
  devDeadline?: string;
  testingDeadline?: string;
  deploymentDeadline?: string;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; email: string };
}

const PHASES = [
  { key: "discovery", label: "Discovery" },
  { key: "design", label: "Design" },
  { key: "development", label: "Development" },
  { key: "testing", label: "Testing" },
  { key: "deployment", label: "Deployment" },
  { key: "maintenance", label: "Maintenance" },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "deliverables" | "credentials" | "integrations" | "feedback">("overview");
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editFields, setEditFields] = useState({ status: "", progressPercentage: 0, deploymentLink: "" });
  const [showAddFeedback, setShowAddFeedback] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ note: "", phase: "" });
  const [showCredential, setShowCredential] = useState<number | null>(null);

  const fetchProject = () => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProject(d.data);
          setEditFields({
            status: d.data.status,
            progressPercentage: d.data.progressPercentage,
            deploymentLink: d.data.deploymentLink || "",
          });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProject(); }, [id]);

  const updateProject = async () => {
    setUpdating(true);
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editFields),
    });
    setShowUpdate(false);
    fetchProject();
    setUpdating(false);
  };

  const addFeedback = async () => {
    if (!newFeedback.note.trim() || !project) return;
    const updated = [...project.clientFeedback, { ...newFeedback, date: new Date().toISOString(), phase: newFeedback.phase || project.status }];
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientFeedback: updated }),
    });
    setNewFeedback({ note: "", phase: "" });
    setShowAddFeedback(false);
    fetchProject();
  };

  const toggleDeliverable = async (i: number) => {
    if (!project) return;
    const updated = project.deliverables.map((d, idx) => idx === i ? { ...d, approved: !d.approved } : d);
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliverables: updated }),
    });
    fetchProject();
  };

  if (loading) return (
    <div><Topbar title="Project" />
      <div className="p-6 space-y-4">{[1,2,3].map(i=><div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-28 animate-pulse"/>)}</div>
    </div>
  );

  if (!project) return (
    <div><Topbar title="Project" />
      <div className="p-6"><p className="text-[#9CA3AF]">Project not found.</p></div>
    </div>
  );

  const phaseIndex = PHASES.findIndex(p => p.key === project.status);
  const tabs = ["overview", "deliverables", "credentials", "integrations", "feedback"] as const;

  return (
    <div>
      <Topbar title={project.name} />
      <div className="p-6 space-y-4">

        {/* Header */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-[#2D3142]">{project.name}</h2>
                <span className="text-xs px-2 py-0.5 bg-[#5DCCC4]/10 text-[#2BAAA0] rounded-full font-medium capitalize">
                  {project.type}{project.subType ? ` · ${project.subType}` : ""}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              <p className="text-sm text-[#6B7280]">{project.client.name}</p>
              {project.description && <p className="text-sm text-[#9CA3AF] mt-1">{project.description}</p>}
            </div>
            <button onClick={() => setShowUpdate(!showUpdate)} className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors flex-shrink-0">
              Update Phase
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[#9CA3AF] mb-1.5">
              <span>Overall Progress</span>
              <span className="font-medium text-[#6B5B95]">{project.progressPercentage}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#6B5B95] rounded-full transition-all" style={{ width: `${project.progressPercentage}%` }} />
            </div>
          </div>

          {/* Phase stepper */}
          <div className="mt-5 overflow-x-auto">
            <div className="flex items-center min-w-max gap-0">
              {PHASES.map((phase, i) => (
                <div key={phase.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= phaseIndex ? "bg-[#6B5B95] text-white" : "bg-gray-100 text-gray-400"}`}>
                      {i < phaseIndex ? "✓" : i + 1}
                    </div>
                    <p className={`text-xs mt-1 whitespace-nowrap ${i <= phaseIndex ? "text-[#6B5B95] font-medium" : "text-[#9CA3AF]"}`}>{phase.label}</p>
                  </div>
                  {i < PHASES.length - 1 && (
                    <div className={`h-0.5 w-10 mx-1 mb-4 ${i < phaseIndex ? "bg-[#6B5B95]" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Update form */}
          {showUpdate && (
            <div className="mt-5 pt-5 border-t border-[#F3F4F6] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Phase</label>
                  <select value={editFields.status} onChange={(e) => setEditFields({ ...editFields, status: e.target.value })} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30">
                    {PHASES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Progress ({editFields.progressPercentage}%)</label>
                  <input type="range" min="0" max="100" value={editFields.progressPercentage} onChange={(e) => setEditFields({ ...editFields, progressPercentage: parseInt(e.target.value) })} className="w-full accent-[#6B5B95] mt-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Deployment Link</label>
                <input value={editFields.deploymentLink} onChange={(e) => setEditFields({ ...editFields, deploymentLink: e.target.value })} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30" placeholder="https://yourapp.com" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowUpdate(false)} className="px-3 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={updateProject} disabled={updating} className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-[#E5E7EB] p-1 w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? "bg-[#6B5B95] text-white" : "text-[#6B7280] hover:bg-gray-50"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-semibold text-[#2D3142] mb-4">Project Info</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Client", value: project.client.name },
                  { label: "Type", value: `${project.type}${project.subType ? ` · ${project.subType}` : ""}` },
                  { label: "Created", value: formatDate(project.createdAt) },
                  { label: "Last Updated", value: formatDate(project.updatedAt) },
                  { label: "Maintenance", value: project.maintenanceStatus || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#9CA3AF]">{label}</span>
                    <span className="text-[#2D3142] font-medium">{value}</span>
                  </div>
                ))}
                {project.deploymentLink && (
                  <div className="pt-2 border-t border-[#F3F4F6]">
                    <a href={project.deploymentLink} target="_blank" rel="noreferrer" className="text-[#6B5B95] hover:underline text-sm font-medium">
                      🌐 View Live Project →
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-semibold text-[#2D3142] mb-4">Deadlines</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Discovery", value: project.discoveryDeadline },
                  { label: "Design", value: project.designDeadline },
                  { label: "Development", value: project.devDeadline },
                  { label: "Testing", value: project.testingDeadline },
                  { label: "Deployment", value: project.deploymentDeadline },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#9CA3AF]">{label}</span>
                    <span className="text-[#2D3142] font-medium">{value ? formatDate(value) : "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {project.features.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 lg:col-span-2">
                <h3 className="font-semibold text-[#2D3142] mb-4">Features ({project.features.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {project.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-[#F9FAFB] rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6B5B95] flex-shrink-0" />
                      <span className="text-sm text-[#2D3142]">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deliverables */}
        {activeTab === "deliverables" && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="font-semibold text-[#2D3142] mb-4">Deliverables</h3>
            {project.deliverables.length === 0 ? (
              <p className="text-[#9CA3AF] text-sm">No deliverables added yet.</p>
            ) : (
              <div className="space-y-3">
                {project.deliverables.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleDeliverable(i)}
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs border-2 flex-shrink-0 transition-colors ${d.approved ? "bg-green-500 border-green-500 text-white" : "border-[#E5E7EB]"}`}>
                        {d.approved ? "✓" : ""}
                      </button>
                      <div>
                        <p className={`text-sm font-medium ${d.approved ? "line-through text-[#9CA3AF]" : "text-[#2D3142]"}`}>{d.title}</p>
                        {d.link && <a href={d.link} target="_blank" rel="noreferrer" className="text-xs text-[#6B5B95] hover:underline">View →</a>}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.approved ? "bg-green-50 text-green-600" : "bg-gray-100 text-[#9CA3AF]"}`}>
                      {d.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-[#F3F4F6] text-xs text-[#9CA3AF]">
              {project.deliverables.filter(d => d.approved).length} of {project.deliverables.length} approved
            </div>
          </div>
        )}

        {/* Credentials */}
        {activeTab === "credentials" && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="font-semibold text-[#2D3142] mb-4">Credentials Vault</h3>
            {project.credentials.length === 0 ? (
              <p className="text-[#9CA3AF] text-sm">No credentials stored for this project.</p>
            ) : (
              <div className="space-y-3">
                {project.credentials.map((c, i) => (
                  <div key={i} className="border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-[#2D3142] text-sm">{c.label}</p>
                      <button onClick={() => setShowCredential(showCredential === i ? null : i)}
                        className="text-xs text-[#6B5B95] hover:underline">
                        {showCredential === i ? "Hide" : "Show"}
                      </button>
                    </div>
                    {showCredential === i && (
                      <div className="space-y-1.5 text-sm">
                        {c.url && <div className="flex gap-2"><span className="text-[#9CA3AF] w-20">URL</span><a href={c.url} target="_blank" rel="noreferrer" className="text-[#6B5B95] hover:underline truncate">{c.url}</a></div>}
                        {c.username && <div className="flex gap-2"><span className="text-[#9CA3AF] w-20">Username</span><span className="text-[#2D3142] font-mono text-xs">{c.username}</span></div>}
                        {c.password && <div className="flex gap-2"><span className="text-[#9CA3AF] w-20">Password</span><span className="text-[#2D3142] font-mono text-xs">{c.password}</span></div>}
                        {c.note && <div className="flex gap-2"><span className="text-[#9CA3AF] w-20">Note</span><span className="text-[#2D3142] text-xs">{c.note}</span></div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Integrations */}
        {activeTab === "integrations" && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="font-semibold text-[#2D3142] mb-4">Integrations</h3>
            {project.integrations.length === 0 ? (
              <p className="text-[#9CA3AF] text-sm">No integrations configured.</p>
            ) : (
              <div className="space-y-3">
                {project.integrations.map((int, i) => (
                  <div key={i} className="flex items-start justify-between p-3 border border-[#E5E7EB] rounded-lg">
                    <div>
                      <p className="font-medium text-[#2D3142] text-sm">{int.name}</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{int.type}</p>
                      {int.note && <p className="text-xs text-[#6B7280] mt-1">{int.note}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(int.status)}`}>
                      {getStatusLabel(int.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Client Feedback */}
        {activeTab === "feedback" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => setShowAddFeedback(!showAddFeedback)} className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors">
                + Add Feedback
              </button>
            </div>
            {showAddFeedback && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Phase</label>
                  <select value={newFeedback.phase} onChange={(e) => setNewFeedback({ ...newFeedback, phase: e.target.value })} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30">
                    <option value="">Current Phase ({project.status})</option>
                    {PHASES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Feedback Note</label>
                  <textarea rows={3} value={newFeedback.note} onChange={(e) => setNewFeedback({ ...newFeedback, note: e.target.value })} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 resize-none" placeholder="Client feedback..." />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddFeedback(false)} className="px-3 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-gray-50">Cancel</button>
                  <button onClick={addFeedback} disabled={!newFeedback.note.trim()} className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">Save</button>
                </div>
              </div>
            )}
            {project.clientFeedback.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 text-center">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-[#9CA3AF] text-sm">No client feedback recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...project.clientFeedback].reverse().map((fb, i) => (
                  <div key={i} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium capitalize">{fb.phase || "General"}</span>
                      <span className="text-xs text-[#9CA3AF]">{formatDate(fb.date)}</span>
                    </div>
                    <p className="text-sm text-orange-800">{fb.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Link href="/projects" className="inline-block text-sm text-[#6B5B95] hover:underline pb-4">← Back to Projects</Link>
      </div>
    </div>
  );
}
