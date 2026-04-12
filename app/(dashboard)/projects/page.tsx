"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import type { Project, Client } from "@/types";

const PROJECT_STATUSES = ["discovery", "design", "development", "testing", "deployment", "maintenance"];

function ProjectModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    clientId: "", name: "", description: "", type: "app", subType: "", features: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then((d) => { if (d.success) setClients(d.data); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      }),
    });
    if (res.ok) { onSave(); onClose(); }
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]";
  const labelClass = "block text-sm font-medium text-[#2D3142] mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#2D3142]">New Project</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#2D3142] text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Client *</label>
            <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className={inputClass}>
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Project Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="My Awesome App" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type *</label>
              <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                <option value="app">App Development</option>
                <option value="web">Web Development</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Sub-type</label>
              <input value={form.subType} onChange={(e) => setForm({ ...form, subType: e.target.value })} className={inputClass} placeholder="iOS, Android, React Native..." />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} placeholder="Brief project description..." />
          </div>
          <div>
            <label className={labelClass}>Features (one per line)</label>
            <textarea rows={4} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className={`${inputClass} resize-none`} placeholder={"User authentication\nDashboard\nPayment integration\n..."} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
              {saving ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateProjectModal({ project, onClose, onSave }: { project: Project; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    status: project.status,
    progressPercentage: project.progressPercentage.toString(),
    deploymentLink: project.deploymentLink || "",
    maintenanceStatus: project.maintenanceStatus || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, progressPercentage: parseInt(form.progressPercentage) }),
    });
    onSave();
    onClose();
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]";
  const labelClass = "block text-sm font-medium text-[#2D3142] mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#2D3142]">Update Project</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#2D3142] text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Phase / Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Progress ({form.progressPercentage}%)</label>
            <input type="range" min="0" max="100" value={form.progressPercentage} onChange={(e) => setForm({ ...form, progressPercentage: e.target.value })} className="w-full accent-[#6B5B95]" />
          </div>
          <div>
            <label className={labelClass}>Deployment Link</label>
            <input value={form.deploymentLink} onChange={(e) => setForm({ ...form, deploymentLink: e.target.value })} className={inputClass} placeholder="https://yourapp.com" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
              {saving ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updateProject, setUpdateProject] = useState<Project | null>(null);
  const [typeFilter, setTypeFilter] = useState("");

  const fetchProjects = () => {
    const params = typeFilter ? `?type=${typeFilter}` : "";
    fetch(`/api/projects${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setProjects(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, [typeFilter]);

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <Topbar title="Projects" />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30">
            <option value="">All Types</option>
            <option value="app">App Development</option>
            <option value="web">Web Development</option>
          </select>
          <div className="flex-1" />
          <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors">
            + New Project
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-32 animate-pulse" />)}</div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <p className="text-4xl mb-3">💻</p>
            <p className="font-semibold text-[#2D3142]">No projects yet</p>
            <p className="text-[#9CA3AF] text-sm mt-1">Create your first project</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[#2D3142]">{project.name}</p>
                      <span className="text-xs px-2 py-0.5 bg-[#5DCCC4]/10 text-[#2BAAA0] rounded-full font-medium capitalize">
                        {project.type} {project.subType ? `· ${project.subType}` : ""}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280]">{(project.client as { name: string })?.name}</p>
                    {project.description && <p className="text-xs text-[#9CA3AF] mt-1">{project.description}</p>}

                    {/* Progress bar */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6B5B95] rounded-full transition-all"
                          style={{ width: `${project.progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#6B7280] font-medium whitespace-nowrap">{project.progressPercentage}%</span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#9CA3AF]">
                      {(project.features as string[]).length > 0 && (
                        <span>{(project.features as string[]).length} features</span>
                      )}
                      {project.deploymentLink && (
                        <a href={project.deploymentLink} target="_blank" rel="noreferrer" className="text-[#6B5B95] hover:underline">🌐 Live →</a>
                      )}
                      <span>Created {formatDate(project.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button onClick={() => setUpdateProject(project)} className="text-xs px-3 py-1.5 bg-[#6B5B95]/10 text-[#6B5B95] font-medium rounded-lg hover:bg-[#6B5B95]/20 transition-colors">
                      Update Phase
                    </button>
                    <button onClick={() => deleteProject(project.id)} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <ProjectModal onClose={() => setShowModal(false)} onSave={fetchProjects} />}
      {updateProject && <UpdateProjectModal project={updateProject} onClose={() => setUpdateProject(null)} onSave={fetchProjects} />}
    </div>
  );
}
