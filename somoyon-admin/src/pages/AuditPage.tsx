import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { auditApi } from '@/api/endpoints';
import { EmptyState, ErrorState, PageHeader, PageLoader, Pagination } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'REORDER', 'CLONE', 'LOGIN', 'LOGOUT'];

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audit', page, action, entity],
    queryFn: () => auditApi.list({ page, limit: 30, action: action || undefined, entity: entity || undefined }),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState message="লগ লোড করা যায়নি" onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="কার্যক্রমের লগ"
        description="কে কখন কী পরিবর্তন করেছেন তার পূর্ণ রেকর্ড (১ বছর সংরক্ষিত)।"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <select className="input w-auto" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
          <option value="">সব কাজ</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          className="input max-w-xs" placeholder="এন্টিটি (যেমন Committee)"
          value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }}
        />
      </div>

      {!data?.data.length ? (
        <EmptyState title="কোনো লগ নেই" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="w-44">সময়</th>
                <th className="w-48">কে</th>
                <th className="w-28">কাজ</th>
                <th className="w-36">এন্টিটি</th>
                <th>বিবরণ</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((log) => (
                <tr key={log._id}>
                  <td className="text-sm text-slate-500">{formatDateTime(log.createdAt)}</td>
                  <td className="text-sm">{log.actor?.name ?? log.actorEmail ?? 'সিস্টেম'}</td>
                  <td><span className="badge bg-slate-100 text-slate-700">{log.action}</span></td>
                  <td className="text-sm text-slate-600">{log.entity}</td>
                  <td className="text-sm">{log.summary ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={data?.meta} onPage={setPage} />
    </>
  );
}
