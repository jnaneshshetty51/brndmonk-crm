"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/context/AuthContext";
import type { Permissions } from "@/lib/permissions";
import { ALL_SECTIONS, DEFAULT_EMPTY_PERMISSIONS } from "@/lib/permissions";

interface SystemRole {
  id: string;
  name: string;
  displayName: string;
  permissions: Permissions;
  isSystem: boolean;
  createdAt: string;
}

const SECTION_LABELS: Record<string, string> = {
  clients:          "Clients",
  calendars:        "Calendars",
  briefs:           "Briefs",
  shoots:           "Shoots",
  videos:           "Videos",
  projects:         "Projects",
  teams:            "Team",
  notifications:    "Notifications",
  posting_calendar: "Posting Calendar",
  settings:         "Settings",
};

const SECTION_ACTIONS: Record<string, string[]> = {
  clients:          ["view", "create", "edit", "delete"],
  calendars:        ["view", "create", "edit", "delete"],
  briefs:           ["view", "create", "edit", "delete"],
  shoots:           ["view", "create", "edit", "delete"],
  videos:           ["view", "create", "edit", "delete"],
  projects:         ["view", "create", "edit", "delete"],
  teams:            ["view", "create", "edit", "delete"],
  notifications:    ["view"],
  posting_calendar: ["view"],
  settings:         ["view", "manage_roles"],
};

function PermissionGrid({
  permissions,
  onChange,
  disabled,
}: {
  permissions: Permissions;
  onChange: (p: Permissions) => void;
  disabled?: boolean;
}) {
  const toggle = (section: string, action: string) => {
    if (disabled) return;
    const current = (permissions[section as keyof Permissions] as Record<string, boolean>)[action];
    const updated = {
      ...permissions,
      [section]: {
        ...(permissions[section as keyof Permissions] as Record<string, boolean>),
        [action]: !current,
      },
    };
    onChange(updated as Permissions);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            <th className="text-left py-2 pr-4 text-[#9CA3AF] font-medium text-xs uppercase w-40">Section</th>
            <th className="text-center py-2 px-3 text-[#9CA3AF] font-medium text-xs uppercase">View</th>
            <th className="text-center py-2 px-3 text-[#9CA3AF] font-medium text-xs uppercase">Create</th>
            <th className="text-center py-2 px-3 text-[#9CA3AF] font-medium text-xs uppercase">Edit</th>
            <th className="text-center py-2 px-3 text-[#9CA3AF] font-medium text-xs uppercase">Delete</th>
            <th className="text-center py-2 px-3 text-[#9CA3AF] font-medium text-xs uppercase">Extra</th>
          </tr>
        </thead>
        <tbody>
          {ALL_SECTIONS.map((section) => {
            const actions = SECTION_ACTIONS[section];
            const perms = permissions[section] as Record<string, boolean>;
            const standardActions = ["view", "create", "edit", "delete"];
            const extraActions = actions.filter(a => !standardActions.includes(a));
            return (
              <tr key={section} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
                <td className="py-3 pr-4 font-medium text-[#2D3142]">{SECTION_LABELS[section]}</td>
                {standardActions.map((action) => (
                  <td key={action} className="py-3 px-3 text-center">
                    {actions.includes(action) ? (
                      <button
                        onClick={() => toggle(section, action)}
                        disabled={disabled}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-colors text-xs font-bold ${
                          perms[action]
                            ? "bg-[#6B5B95] border-[#6B5B95] text-white"
                            : disabled
                            ? "bg-gray-50 border-gray-200 text-transparent"
                            : "border-[#E5E7EB] hover:border-[#6B5B95]/50"
                        }`}
                      >
                        {perms[action] ? "✓" : ""}
                      </button>
                    ) : (
                      <span className="text-gray-200 text-base">—</span>
                    )}
                  </td>
                ))}
                <td className="py-3 px-3 text-center">
                  {extraActions.length > 0 ? (
                    <div className="flex flex-col gap-1 items-center">
                      {extraActions.map(action => (
                        <div key={action} className="flex items-center gap-1">
                          <button
                            onClick={() => toggle(section, action)}
                            disabled={disabled}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors text-[10px] font-bold ${
                              perms[action]
                                ? "bg-[#6B5B95] border-[#6B5B95] text-white"
                                : "border-[#E5E7EB]"
                            }`}
                          >
                            {perms[action] ? "✓" : ""}
                          </button>
                          <span className="text-xs text-[#9CA3AF] capitalize">{action.replace(/_/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-200">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function RolesPage() {
  const { can } = useAuth();
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SystemRole | null>(null);
  const [editPerms, setEditPerms] = useState<Permissions>(DEFAULT_EMPTY_PERMISSIONS);
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const canManage = can("settings", "manage_roles");

  const fetchRoles = () => {
    fetch("/api/roles")
      .then(r => r.json())
      .then(d => { if (d.success) { setRoles(d.data); if (!selected && d.data.length) { setSelected(d.data[0]); setEditPerms(d.data[0].permissions); } } })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRoles(); }, []);

  const selectRole = (role: SystemRole) => {
    setSelected(role);
    setEditPerms(role.permissions);
  };

  const savePermissions = async () => {
    if (!selected || !canManage) return;
    setSaving(true);
    await fetch(`/api/roles/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: editPerms }),
    });
    fetchRoles();
    setSaving(false);
  };

  const createRole = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: newName }),
    });
    const data = await res.json();
    if (data.success) {
      setNewName("");
      setShowNew(false);
      fetchRoles();
      setSelected(data.data);
      setEditPerms(data.data.permissions);
    }
    setCreating(false);
  };

  const deleteRole = async (role: SystemRole) => {
    if (!confirm(`Delete role "${role.displayName}"?`)) return;
    await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
    setSelected(null);
    fetchRoles();
  };

  if (loading) return (
    <div><Topbar title="Roles & Permissions" />
      <div className="p-6 space-y-4">{[1,2].map(i=><div key={i} className="bg-white rounded-xl border border-[#E5E7EB] h-40 animate-pulse"/>)}</div>
    </div>
  );

  return (
    <div>
      <Topbar title="Roles & Permissions" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/settings" className="text-sm text-[#9CA3AF] hover:text-[#6B5B95]">Settings</Link>
          <span className="text-[#9CA3AF]">/</span>
          <span className="text-sm text-[#2D3142] font-medium">Roles</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Role list */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#2D3142]">Roles</span>
                {canManage && (
                  <button onClick={() => setShowNew(!showNew)} className="text-xs text-[#6B5B95] font-medium hover:underline">+ New</button>
                )}
              </div>

              {showNew && (
                <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#FAFAFA]">
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && createRole()}
                    placeholder="Role name..."
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 mb-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowNew(false)} className="flex-1 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280]">Cancel</button>
                    <button onClick={createRole} disabled={creating || !newName.trim()} className="flex-1 py-1.5 text-xs bg-[#6B5B95] text-white rounded-lg disabled:opacity-50">
                      {creating ? "..." : "Create"}
                    </button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-[#F3F4F6]">
                {roles.map(role => (
                  <div key={role.id}
                    onClick={() => selectRole(role)}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                      selected?.id === role.id ? "bg-[#6B5B95]/5 border-l-2 border-[#6B5B95]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-[#2D3142]">{role.displayName}</p>
                      {role.isSystem && <p className="text-xs text-[#9CA3AF]">System</p>}
                    </div>
                    {!role.isSystem && canManage && (
                      <button onClick={e => { e.stopPropagation(); deleteRole(role); }} className="text-xs text-red-400 hover:text-red-600">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Permission grid */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-[#2D3142]">{selected.displayName}</h3>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      {selected.isSystem ? "System role — permissions can be adjusted" : "Custom role"}
                    </p>
                  </div>
                  {canManage && (
                    <button onClick={savePermissions} disabled={saving} className="px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
                      {saving ? "Saving..." : "Save Permissions"}
                    </button>
                  )}
                </div>
                <PermissionGrid
                  permissions={editPerms}
                  onChange={setEditPerms}
                  disabled={!canManage}
                />
                {!canManage && (
                  <p className="text-xs text-[#9CA3AF] mt-4 text-center">You don&apos;t have permission to edit roles.</p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 text-center">
                <p className="text-3xl mb-2">🔐</p>
                <p className="text-[#9CA3AF] text-sm">Select a role to view or edit permissions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
