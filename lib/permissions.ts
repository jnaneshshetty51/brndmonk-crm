// Defines the shape of a role's permissions
export interface Permissions {
  clients:          { view: boolean; create: boolean; edit: boolean; delete: boolean };
  calendars:        { view: boolean; create: boolean; edit: boolean; delete: boolean };
  briefs:           { view: boolean; create: boolean; edit: boolean; delete: boolean };
  shoots:           { view: boolean; create: boolean; edit: boolean; delete: boolean };
  videos:           { view: boolean; create: boolean; edit: boolean; delete: boolean };
  projects:         { view: boolean; create: boolean; edit: boolean; delete: boolean };
  teams:            { view: boolean; create: boolean; edit: boolean; delete: boolean };
  notifications:    { view: boolean };
  posting_calendar: { view: boolean };
  settings:         { view: boolean; manage_roles: boolean };
}

export const ALL_SECTIONS = [
  "clients", "calendars", "briefs", "shoots", "videos",
  "projects", "teams", "notifications", "posting_calendar", "settings",
] as const;

export type Section = typeof ALL_SECTIONS[number];

export const FULL_PERMISSIONS: Permissions = {
  clients:          { view: true, create: true, edit: true, delete: true },
  calendars:        { view: true, create: true, edit: true, delete: true },
  briefs:           { view: true, create: true, edit: true, delete: true },
  shoots:           { view: true, create: true, edit: true, delete: true },
  videos:           { view: true, create: true, edit: true, delete: true },
  projects:         { view: true, create: true, edit: true, delete: true },
  teams:            { view: true, create: true, edit: true, delete: true },
  notifications:    { view: true },
  posting_calendar: { view: true },
  settings:         { view: true, manage_roles: true },
};

export const SOCIAL_TEAM_PERMISSIONS: Permissions = {
  clients:          { view: true,  create: false, edit: false, delete: false },
  calendars:        { view: true,  create: true,  edit: true,  delete: false },
  briefs:           { view: true,  create: true,  edit: true,  delete: false },
  shoots:           { view: true,  create: true,  edit: true,  delete: false },
  videos:           { view: true,  create: true,  edit: true,  delete: false },
  projects:         { view: false, create: false, edit: false, delete: false },
  teams:            { view: false, create: false, edit: false, delete: false },
  notifications:    { view: true },
  posting_calendar: { view: true },
  settings:         { view: true, manage_roles: false },
};

export const DEV_TEAM_PERMISSIONS: Permissions = {
  clients:          { view: true,  create: false, edit: false, delete: false },
  calendars:        { view: false, create: false, edit: false, delete: false },
  briefs:           { view: false, create: false, edit: false, delete: false },
  shoots:           { view: false, create: false, edit: false, delete: false },
  videos:           { view: false, create: false, edit: false, delete: false },
  projects:         { view: true,  create: true,  edit: true,  delete: false },
  teams:            { view: true,  create: false, edit: false, delete: false },
  notifications:    { view: true },
  posting_calendar: { view: false },
  settings:         { view: true, manage_roles: false },
};

export const DEFAULT_EMPTY_PERMISSIONS: Permissions = {
  clients:          { view: false, create: false, edit: false, delete: false },
  calendars:        { view: false, create: false, edit: false, delete: false },
  briefs:           { view: false, create: false, edit: false, delete: false },
  shoots:           { view: false, create: false, edit: false, delete: false },
  videos:           { view: false, create: false, edit: false, delete: false },
  projects:         { view: false, create: false, edit: false, delete: false },
  teams:            { view: false, create: false, edit: false, delete: false },
  notifications:    { view: false },
  posting_calendar: { view: false },
  settings:         { view: false, manage_roles: false },
};

export const DEFAULT_ROLES = [
  { name: "admin",       displayName: "Admin",             permissions: FULL_PERMISSIONS,         isSystem: true },
  { name: "social_team", displayName: "Social Media Team", permissions: SOCIAL_TEAM_PERMISSIONS,  isSystem: true },
  { name: "dev_team",    displayName: "Dev Team",          permissions: DEV_TEAM_PERMISSIONS,     isSystem: true },
];

export function can(permissions: Permissions | null, section: Section, action: string): boolean {
  if (!permissions) return false;
  const s = permissions[section] as Record<string, boolean>;
  return s?.[action] === true;
}
