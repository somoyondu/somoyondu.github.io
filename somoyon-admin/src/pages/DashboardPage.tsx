import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays, FileText, Image, Mail, UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { dashboardApi } from '@/api/endpoints';
import { ErrorState, PageHeader, PageLoader } from '@/components/ui';
import { formatBytes, toBn } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';

function StatCard({
  label, value, sub, icon: Icon, to,
}: { label: string; value: string | number; sub?: string; icon: any; to: string }) {
  return (
    <Link to={to} className="card card-body transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-brand">{toBn(value)}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className="rounded-lg bg-brand/10 p-2">
          <Icon className="h-5 w-5 text-brand" />
        </div>
      </div>
    </Link>
  );
}

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.stats,
  });

  if (isLoading) return <PageLoader />;
  if (error || !data) return <ErrorState message="ড্যাশবোর্ড লোড করা যায়নি" onRetry={refetch} />;

  const c = data.counts;

  return (
    <>
      <PageHeader
        title="ড্যাশবোর্ড"
        description="সময়ন ওয়েবসাইটের কনটেন্টের সারসংক্ষেপ"
        actions={
          <Link to="/committees" className="btn-primary">নতুন বছরের কমিটি তৈরি করুন</Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="কার্যনির্বাহী পরিষদ" value={c.committees} icon={UsersRound} to="/committees"
          sub={c.draftCommittees ? `${toBn(c.draftCommittees)} টি খসড়া` : 'সব প্রকাশিত'} />
        <StatCard label="মোট সদস্য" value={c.people} icon={UsersRound} to="/people"
          sub={`${toBn(c.positions)} টি পদ`} />
        <StatCard label="গ্যালারি ছবি" value={c.photos} icon={Image} to="/gallery"
          sub={`${toBn(c.albums)} টি অ্যালবাম`} />
        <StatCard label="মিডিয়া" value={c.media} icon={Image} to="/media"
          sub={formatBytes(c.mediaBytes)} />
        <StatCard label="ইভেন্টস" value={c.events} icon={CalendarDays} to="/events"
          sub={`${toBn(c.upcomingEvents)} টি আসন্ন`} />
        <StatCard label="নোটিশ ও ব্লগ" value={c.posts} icon={FileText} to="/posts"
          sub={c.draftPosts ? `${toBn(c.draftPosts)} টি খসড়া` : undefined} />
        <StatCard label="উপদেষ্টা" value={c.advisors} icon={UsersRound} to="/advisors" />
        <StatCard label="অপঠিত বার্তা" value={c.unreadMessages} icon={Mail} to="/inbox" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card card-body lg:col-span-2">
          <h2 className="mb-4 font-bold text-slate-700">বছরভিত্তিক সদস্য সংখ্যা</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.membersByYear}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6251A7" radius={[6, 6, 0, 0]} name="সদস্য" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card card-body">
          <h2 className="mb-4 font-bold text-slate-700">সাম্প্রতিক কার্যক্রম</h2>
          <ul className="space-y-3">
            {data.recentActivity.map((log) => (
              <li key={log._id} className="border-b border-slate-100 pb-2 last:border-0">
                <p className="text-sm text-slate-700">{log.summary ?? `${log.action} ${log.entity}`}</p>
                <p className="text-xs text-slate-400">
                  {log.actor?.name ?? log.actorEmail ?? 'সিস্টেম'} · {formatDateTime(log.createdAt)}
                </p>
              </li>
            ))}
            {!data.recentActivity.length && (
              <li className="text-sm text-slate-400">এখনো কোনো কার্যক্রম নেই</li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
