"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";

interface ScheduledVideo {
  id: string;
  scheduledPostDate: string;
  scheduledPostPlatform?: string;
  scheduledPostCaption?: string;
  postedAt?: string;
  status: string;
  clientApprovalStatus: string;
  client: { id: string; name: string };
  brief?: { ideaTitle: string; contentType: string };
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const platformColors: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  youtube: "bg-red-100 text-red-700",
  facebook: "bg-blue-100 text-blue-700",
  tiktok: "bg-gray-900 text-white",
  linkedin: "bg-blue-600 text-white",
  twitter: "bg-sky-100 text-sky-700",
};

const contentTypeIcon: Record<string, string> = {
  Reel: "🎬",
  Post: "📸",
  Carousel: "📑",
  Story: "⭕",
};

export default function PostingCalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [videos, setVideos] = useState<ScheduledVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [clientFilter, setClientFilter] = useState("");
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => { if (d.success) setClients(d.data); });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "200" });
    if (clientFilter) params.set("clientId", clientFilter);
    fetch(`/api/videos?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const scheduled = d.data.filter((v: ScheduledVideo) => v.scheduledPostDate);
          setVideos(scheduled);
        }
      })
      .finally(() => setLoading(false));
  }, [clientFilter]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group videos by day for this month/year
  const videosByDay: Record<number, ScheduledVideo[]> = {};
  videos.forEach((v) => {
    const d = new Date(v.scheduledPostDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!videosByDay[day]) videosByDay[day] = [];
      videosByDay[day].push(v);
    }
  });

  const selectedVideos = selectedDay ? (videosByDay[selectedDay] || []) : [];

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const totalScheduled = Object.values(videosByDay).flat().length;
  const totalPosted = Object.values(videosByDay).flat().filter(v => v.postedAt).length;

  return (
    <div>
      <Topbar title="Posting Calendar" />
      <div className="p-6 space-y-4">

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2">
            <button onClick={prevMonth} className="text-[#6B7280] hover:text-[#2D3142] px-1 text-lg font-light">‹</button>
            <span className="font-semibold text-[#2D3142] text-sm min-w-[130px] text-center">{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} className="text-[#6B7280] hover:text-[#2D3142] px-1 text-lg font-light">›</button>
          </div>
          <button onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); setSelectedDay(null); }}
            className="px-3 py-2 text-sm border border-[#E5E7EB] bg-white rounded-xl text-[#6B7280] hover:bg-gray-50">
            Today
          </button>
          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 bg-white">
            <option value="">All Clients</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex-1" />
          <div className="flex gap-4 text-sm">
            <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold text-[#6B5B95]">{totalScheduled}</p>
              <p className="text-xs text-[#9CA3AF]">Scheduled</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold text-green-500">{totalPosted}</p>
              <p className="text-xs text-[#9CA3AF]">Posted</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-[#9CA3AF] py-2">{d}</div>
              ))}
            </div>
            {/* Grid */}
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#6B5B95] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} className="aspect-square" />;
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  const hasVideos = !!videosByDay[day];
                  const isSelected = selectedDay === day;
                  const dayVideos = videosByDay[day] || [];
                  const allPosted = dayVideos.length > 0 && dayVideos.every(v => v.postedAt);
                  return (
                    <button key={i} onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={`aspect-square rounded-lg p-1 text-xs transition-all flex flex-col items-center justify-start relative ${
                        isSelected ? "bg-[#6B5B95] text-white" :
                        isToday ? "bg-[#6B5B95]/10 text-[#6B5B95] font-bold" :
                        hasVideos ? "hover:bg-gray-50" : "hover:bg-gray-50"
                      }`}>
                      <span className={`font-medium ${isSelected ? "text-white" : isToday ? "text-[#6B5B95]" : "text-[#2D3142]"}`}>{day}</span>
                      {hasVideos && (
                        <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                          {dayVideos.slice(0, 3).map((v, vi) => (
                            <div key={vi} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : v.postedAt ? "bg-green-400" : "bg-[#6B5B95]"}`} />
                          ))}
                          {dayVideos.length > 3 && <span className={`text-[8px] ${isSelected ? "text-white" : "text-[#9CA3AF]"}`}>+{dayVideos.length-3}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#F3F4F6] text-xs text-[#9CA3AF]">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#6B5B95]" /> Scheduled</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400" /> Posted</div>
            </div>
          </div>

          {/* Day detail */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            {selectedDay ? (
              <>
                <h3 className="font-semibold text-[#2D3142] mb-3">
                  {MONTHS[month]} {selectedDay}
                </h3>
                {selectedVideos.length === 0 ? (
                  <p className="text-[#9CA3AF] text-sm">Nothing scheduled for this day.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedVideos.map((v) => (
                      <Link key={v.id} href={`/videos/${v.id}`}
                        className="block p-3 border border-[#E5E7EB] rounded-lg hover:border-[#6B5B95]/40 hover:bg-[#6B5B95]/5 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-sm font-medium text-[#2D3142] leading-tight">
                            {contentTypeIcon[v.brief?.contentType || ""] || "🎥"} {v.brief?.ideaTitle || "Video"}
                          </span>
                          {v.postedAt && <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full font-medium flex-shrink-0">Posted</span>}
                        </div>
                        <p className="text-xs text-[#9CA3AF]">{v.client.name}</p>
                        {v.scheduledPostPlatform && (
                          <span className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize ${platformColors[v.scheduledPostPlatform.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                            {v.scheduledPostPlatform}
                          </span>
                        )}
                        {v.scheduledPostCaption && (
                          <p className="text-xs text-[#6B7280] mt-1.5 line-clamp-2">{v.scheduledPostCaption}</p>
                        )}
                        <p className="text-xs text-[#6B5B95] mt-2 font-medium">View details →</p>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-sm font-medium text-[#2D3142]">Select a day</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Click any day to see scheduled posts</p>
              </div>
            )}
          </div>
        </div>

        {/* All scheduled this month */}
        {totalScheduled > 0 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="font-semibold text-[#2D3142] mb-4">All Posts — {MONTHS[month]} {year}</h3>
            <div className="space-y-2">
              {Object.entries(videosByDay)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .flatMap(([day, dayVideos]) =>
                  dayVideos.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#6B5B95]/10 flex items-center justify-center text-sm font-bold text-[#6B5B95]">
                          {day}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2D3142]">
                            {contentTypeIcon[v.brief?.contentType || ""] || "🎥"} {v.brief?.ideaTitle || "Video"}
                          </p>
                          <p className="text-xs text-[#9CA3AF]">{v.client.name} {v.scheduledPostPlatform ? `· ${v.scheduledPostPlatform}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {v.postedAt ? (
                          <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">Posted</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-[#6B5B95]/10 text-[#6B5B95] rounded-full font-medium">Scheduled</span>
                        )}
                        <Link href={`/videos/${v.id}`} className="text-sm text-[#6B5B95] font-medium hover:underline">View →</Link>
                      </div>
                    </div>
                  ))
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
