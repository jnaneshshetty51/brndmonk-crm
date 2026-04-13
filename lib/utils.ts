import { NextResponse } from "next/server";

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

// Use for GET list endpoints — serves cached response immediately, refreshes in background
export function apiSuccessCached(data: unknown, maxAge = 30) {
  const res = NextResponse.json({ success: true, data });
  res.headers.set("Cache-Control", `private, max-age=${maxAge}, stale-while-revalidate=60`);
  return res;
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    sent_to_client: "bg-blue-100 text-blue-600",
    in_review: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-600",
    revision_requested: "bg-orange-100 text-orange-600",
    in_progress: "bg-purple-100 text-purple-600",
    completed: "bg-emerald-100 text-emerald-700",
    scheduled: "bg-blue-100 text-blue-600",
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    archived: "bg-gray-100 text-gray-500",
    pending: "bg-yellow-100 text-yellow-700",
    posted: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-600",
  };
  return colors[status] || "bg-gray-100 text-gray-600";
}

export function getStatusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const CONTENT_TYPES = ["Reel", "Post", "Carousel", "Story"];

export const PROJECT_STATUSES = [
  "discovery",
  "design",
  "development",
  "testing",
  "deployment",
  "maintenance",
];

export const SHOOT_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "failed",
];

export const BRIEF_STATUSES = [
  "draft",
  "sent_to_client",
  "approved",
  "rejected",
  "revision_requested",
];
