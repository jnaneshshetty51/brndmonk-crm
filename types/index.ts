export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "social_team" | "dev_team";
  status: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  contactPerson?: string;
  timezone?: string;
  status: "active" | "paused" | "archived";
  services: ServiceSubscription[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    calendars?: number;
    projects?: number;
  };
}

export interface ServiceSubscription {
  type: "social_media" | "app_dev" | "web_dev";
  status: "active" | "paused" | "ended";
  startDate?: string;
  tier?: string;
  monthlyCost?: number;
}

export interface Calendar {
  id: string;
  clientId: string;
  client?: Client;
  month: string;
  year: number;
  totalReels: number;
  totalPosts: number;
  totalCarousels: number;
  status: string;
  sentToClientAt?: string;
  fullyApprovedAt?: string;
  completedAt?: string;
  notes?: string;
  briefs?: ContentBrief[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentBrief {
  id: string;
  calendarId: string;
  calendar?: Calendar;
  briefNumber: string;
  contentType: "Reel" | "Post" | "Carousel" | "Story";
  ideaTitle: string;
  ideaDescription: string;
  visualDescription: string;
  script: string;
  music?: string;
  hashtags?: string;
  cta?: string;
  moodBoardLinks?: string;
  specialRequirements?: string;
  status: string;
  approvalDeadline?: string;
  clientFeedback?: string;
  revisionNotes?: string;
  currentVersion: number;
  versions: BriefVersion[];
  sentToClientAt?: string;
  approvedAt?: string;
  lastRevisedAt?: string;
  scheduledPostDate?: string;
  postTime?: string;
  phase?: string;
  caption?: string;
  driveLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BriefVersion {
  version: number;
  createdAt: string;
  changes: string;
}

export interface Shoot {
  id: string;
  calendarId?: string;
  clientId: string;
  client?: Client;
  shootDate: string;
  duration?: number;
  location?: string;
  shootName?: string;
  briefIds: string[];
  assignedMembers: ShootMember[];
  equipmentNeeded?: string;
  specialInstructions?: string;
  rawFootageLocation?: string;
  status: string;
  reminderSent24h: boolean;
  reminderSent1h: boolean;
  startedAt?: string;
  completedAt?: string;
  notesPostShoot?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShootMember {
  memberId: string;
  name?: string;
  role: string;
}

export interface Video {
  id: string;
  briefId?: string;
  brief?: ContentBrief;
  shootId?: string;
  calendarId: string;
  clientId: string;
  client?: Client;
  rawFootageLink?: string;
  rawFootageUploadedAt?: string;
  editorId?: string;
  editingStatus: string;
  finalVideoLink?: string;
  finalVideoVersion: number;
  clientApprovalStatus: string;
  clientFeedback?: string;
  sentToClientAt?: string;
  clientApprovedAt?: string;
  versions: VideoVersion[];
  status: string;
  scheduledPostDate?: string;
  scheduledPostPlatform?: string;
  scheduledPostCaption?: string;
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoVersion {
  version: number;
  link: string;
  uploadedAt: string;
  feedback?: string;
}

export interface Project {
  id: string;
  clientId: string;
  client?: Client;
  name: string;
  description?: string;
  type: "app" | "web";
  subType?: string;
  features: string[];
  discoveryDeadline?: string;
  designDeadline?: string;
  devDeadline?: string;
  testingDeadline?: string;
  deploymentDeadline?: string;
  status: string;
  progressPercentage: number;
  projectManagerId?: string;
  designerId?: string;
  devTeamIds: string[];
  deliverables: Deliverable[];
  credentials: Credential[];
  integrations: Integration[];
  deploymentLink?: string;
  deploymentDate?: string;
  maintenanceStatus?: string;
  maintenanceEndDate?: string;
  clientFeedback: ProjectFeedback[];
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  name: string;
  link?: string;
  approved: boolean;
  approvedAt?: string;
}

export interface Credential {
  type: string;
  service: string;
  username?: string;
  url?: string;
  notes?: string;
}

export interface Integration {
  name: string;
  status: string;
  notes?: string;
}

export interface ProjectFeedback {
  phase: string;
  feedback: string;
  date: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: "social_media" | "app_web";
  skills: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  clientId?: string;
  teamMemberId?: string;
  type: string;
  message: string;
  actionLink?: string;
  status: "unread" | "read";
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}
