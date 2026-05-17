import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, MessageSquare, Star, Users, CalendarDays,
  BarChart3, PieChart as PieIcon, Activity, Calendar,
  Eye, Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import { dashboardService } from '@/services/dashboard.service';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/admin/StatCard';
import { DonutCard } from '@/components/admin/DonutCard';
import { Skeleton } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { timeAgo, propertyTypeLabels, formatDate } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .stats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-32" />))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <Skeleton className="h-80" /><Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const c = stats?.counts || {};
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const propertyTypeData = (stats?.propertyTypeDistribution || []).map((d) => ({
    name: propertyTypeLabels[d._id] || d._id,
    value: d.count,
  }));
  const listingTypeData = (stats?.listingTypeDistribution || []).map((d) => ({
    name: d._id === 'sale' ? 'For Sale' : 'For Rent',
    value: d.count,
  }));
  const inquiryStatusData = (stats?.inquiryStatusDistribution || []).map((d) => ({
    name: d._id,
    value: d.count,
  }));
  const monthlyData = (stats?.monthlyInquiries || []).map((d) => ({
    name: new Date(d._id.y, d._id.m - 1).toLocaleString('en-IN', { month: 'short' }),
    inquiries: d.count,
  }));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name?.split(' ')[0]}</span>. Here's your business overview.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/70 text-sm shadow-card">
          <Calendar size={14} className="text-slate-400" />
          <span className="font-medium text-slate-700">{today}</span>
        </div>
      </div>

      {/* PRIMARY STATS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard index={0} icon={Building2}      label="Total Properties" value={c.totalProperties || 0} accent="brand" />
        <StatCard index={1} icon={MessageSquare}  label="Total Inquiries"  value={c.totalInquiries || 0}  accent="emerald" />
        <StatCard index={2} icon={Star}           label="Total Reviews"    value={c.totalReviews || 0}    accent="amber" />
        <StatCard index={3} icon={CalendarDays}   label="Active Events"    value={c.liveEvents || 0}      accent="accent" />
      </div>

      {/* SECONDARY STATS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat icon={Sparkles} label="Featured properties" value={c.featuredProperties || 0} accent="accent" />
        <MiniStat icon={Eye}      label="Available now"       value={c.availableProperties || 0} accent="emerald" />
        <MiniStat icon={Activity} label="New inquiries"       value={c.newInquiries || 0} accent="brand" />
        <MiniStat icon={Users}    label="Team members"        value={c.totalUsers || 0} accent="violet" />
      </div>

      {/* DONUT CHARTS — matches the screenshot */}
      <div className="grid lg:grid-cols-2 gap-4">
        <DonutCard
          icon={PieIcon}
          title="Property Type Distribution"
          data={propertyTypeData}
          centerLabel="Properties"
        />
        <DonutCard
          icon={PieIcon}
          title="Sale vs Rent"
          data={listingTypeData}
          colors={['#f97316', '#6366f1']}
          centerLabel="Listings"
        />
      </div>

      {/* BAR + INQUIRY STATUS */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <BarChart3 size={16} className="text-brand-500" />
              <h3 className="font-display font-bold">Inquiries by Month</h3>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 px-2.5 py-1 rounded-md bg-slate-100">
              Last 6 months
            </span>
          </div>
          <div className="p-5">
            {monthlyData.length === 0 ? (
              <div className="h-[260px] grid place-items-center text-sm text-slate-400">No inquiry data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <defs>
                    <linearGradient id="bar-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#312e81" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: 'none',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="inquiries" fill="url(#bar-grad)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <Activity size={16} className="text-brand-500" />
              <h3 className="font-display font-bold">Inquiry Status</h3>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 px-2.5 py-1 rounded-md bg-slate-100">
              All time
            </span>
          </div>
          <div className="p-5 space-y-3">
            {inquiryStatusData.length === 0 ? (
              <div className="h-[200px] grid place-items-center text-sm text-slate-400">No inquiries yet</div>
            ) : (
              inquiryStatusData.map((d) => {
                const total = inquiryStatusData.reduce((a, x) => a + x.value, 0);
                const pct = total ? Math.round((d.value / total) * 100) : 0;
                return (
                  <div key={d.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <Badge status={d.name} />
                      <span className="font-semibold text-slate-700">{d.value} <span className="text-xs text-slate-400">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* PROPERTY GROWTH LINE + UPCOMING EVENTS */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <Activity size={16} className="text-brand-500" />
              <h3 className="font-display font-bold">Engagement Trend</h3>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 px-2.5 py-1 rounded-md bg-slate-100">
              6 months
            </span>
          </div>
          <div className="p-5">
            {monthlyData.length === 0 ? (
              <div className="h-[220px] grid place-items-center text-sm text-slate-400">Not enough data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="area-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                  <Area type="monotone" dataKey="inquiries" stroke="#f97316" strokeWidth={2.5} fill="url(#area-grad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <UpcomingEvents events={stats?.recent?.events || []} />
      </div>

      {/* RECENT INQUIRIES + REVIEWS */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RecentList
          title="Recent Inquiries"
          empty="No inquiries yet"
          link="/admin/inquiries"
          items={(stats?.recent?.inquiries || []).map((i) => ({
            id: i._id,
            initial: i.name?.[0]?.toUpperCase(),
            title: i.name,
            subtitle: `${i.email} · ${i.property?.title || i.inquiryType}`,
            right: <Badge status={i.status} />,
            sub: timeAgo(i.createdAt),
            accent: 'brand',
          }))}
        />
        <RecentList
          title="Recent Reviews"
          empty="No reviews yet"
          link="/admin/reviews"
          items={(stats?.recent?.reviews || []).map((r) => ({
            id: r._id,
            initial: r.name?.[0]?.toUpperCase(),
            title: r.name,
            subtitle: r.review,
            right: <div className="text-sm font-bold text-amber-500">★ {r.rating}</div>,
            sub: <Badge status={r.status} />,
            accent: 'accent',
          }))}
        />
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, accent = 'brand' }) {
  const colors = {
    brand:   { text: 'text-brand-600',   bg: 'bg-brand-50' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50' },
    amber:   { text: 'text-amber-600',   bg: 'bg-amber-50' },
    accent:  { text: 'text-accent-600',  bg: 'bg-accent-50' },
    violet:  { text: 'text-violet-600',  bg: 'bg-violet-50' },
  };
  const c = colors[accent] || colors.brand;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4 flex items-center gap-3 shadow-card">
      <div className={`w-10 h-10 rounded-xl grid place-items-center ${c.bg} ${c.text}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-widest text-slate-500 truncate">{label}</div>
        <div className={`font-display font-extrabold text-2xl mt-0.5 ${c.text}`}>{value}</div>
      </div>
    </div>
  );
}

function UpcomingEvents({ events }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700">
          <CalendarDays size={16} className="text-accent-500" />
          <h3 className="font-display font-bold">Upcoming Events</h3>
        </div>
        <Link to="/admin/events" className="text-xs font-semibold text-brand-600 hover:underline">View all</Link>
      </div>
      <div className="divide-y divide-slate-100">
        {events.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No upcoming events</div>
        ) : (
          events.map((ev) => (
            <div key={ev._id} className="px-5 py-3 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl grid place-items-center text-white shrink-0"
                style={{ background: ev.color || '#f97316' }}
              >
                <CalendarDays size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate text-slate-800">{ev.title}</div>
                <div className="text-xs text-slate-500 truncate">
                  {ev.type} · {formatDate(ev.startDate)}
                </div>
              </div>
              {ev.discountPercent > 0 && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-accent-50 text-accent-700">
                  -{ev.discountPercent}%
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RecentList({ title, link, items, empty }) {
  const accentBg = {
    brand: 'from-brand-500 to-brand-700',
    accent: 'from-accent-500 to-accent-700',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between">
        <h3 className="font-display font-bold text-slate-700">{title}</h3>
        <Link to={link} className="text-xs font-semibold text-brand-600 hover:underline">View all</Link>
      </div>
      <div className="divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">{empty}</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="px-5 py-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentBg[it.accent || 'brand']} text-white grid place-items-center font-bold text-sm shrink-0`}>
                {it.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate text-slate-800">{it.title}</div>
                <div className="text-xs text-slate-500 line-clamp-1">{it.subtitle}</div>
              </div>
              <div className="text-right text-xs text-slate-500">
                {it.right}
                <div className="mt-1">{it.sub}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
