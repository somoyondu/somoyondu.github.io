import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { committeesApi, designationsApi, peopleApi } from '@/api/endpoints';
import { ImageField } from '@/components/MediaPicker';
import { SortableList } from '@/components/SortableList';
import {
  ConfirmDialog, EmptyState, ErrorState, Field, Modal, PageHeader, PageLoader, Spinner, StatusBadge,
} from '@/components/ui';
import { GROUP_LABELS, GROUP_ORDER, toBn } from '@/lib/constants';
import type { Media, Position, PositionGroup } from '@/lib/types';
import { thumb } from '@/lib/utils';

export function CommitteeDetailPage() {
  const { id = '' } = useParams();
  const qc = useQueryClient();

  const [tab, setTab] = useState<PositionGroup>('TOP_LEADER');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<Position[] | null>(null);

  const committeeQ = useQuery({ queryKey: ['committee', id], queryFn: () => committeesApi.get(id) });
  const positionsQ = useQuery({
    queryKey: ['positions', id],
    queryFn: () => committeesApi.positions(id),
  });
  const designationsQ = useQuery({ queryKey: ['designations'], queryFn: designationsApi.all });

  const positions = positionsQ.data ?? [];
  const groupPositions = (localOrder ?? positions)
    .filter((p) => p.group === tab)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  useEffect(() => setLocalOrder(null), [positions]);

  const reorder = useMutation({
    mutationFn: (items: Position[]) =>
      committeesApi.reorderPositions(
        id,
        items.map((p, index) => ({ id: p._id, displayOrder: index * 10 })),
      ),
    onError: (err) => {
      toast.error(apiError(err));
      setLocalOrder(null);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['positions', id] }),
  });

  const removePosition = useMutation({
    mutationFn: (positionId: string) => committeesApi.removePosition(positionId),
    onSuccess: () => {
      toast.success('পদ থেকে সরানো হয়েছে');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['positions', id] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const updatePhoto = useMutation({
    mutationFn: ({ positionId, media }: { positionId: string; media: Media | null }) =>
      committeesApi.updatePosition(positionId, { photoOverride: media?._id ?? null }),
    onSuccess: () => {
      toast.success('ছবি হালনাগাদ হয়েছে');
      qc.invalidateQueries({ queryKey: ['positions', id] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (committeeQ.isLoading || positionsQ.isLoading) return <PageLoader />;
  if (committeeQ.error) return <ErrorState message="কমিটি লোড করা যায়নি" onRetry={committeeQ.refetch} />;

  const committee = committeeQ.data!;
  const counts = GROUP_ORDER.reduce<Record<string, number>>((acc, g) => {
    acc[g] = positions.filter((p) => p.group === g).length;
    return acc;
  }, {});

  return (
    <>
      <Link to="/committees" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> সব কমিটি
      </Link>

      <PageHeader
        title={`${committee.title}`}
        description={`মোট ${toBn(positions.length)} জন সদস্য · টেনে এনে ক্রম পরিবর্তন করুন`}
        actions={
          <>
            <StatusBadge status={committee.status} />
            <button className="btn-primary" type="button" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> সদস্য যোগ করুন
            </button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200">
        {GROUP_ORDER.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setTab(group)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === group
                ? 'border-brand text-brand'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {GROUP_LABELS[group]}
            <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 text-xs">{toBn(counts[group] ?? 0)}</span>
          </button>
        ))}
      </div>

      {!groupPositions.length ? (
        <EmptyState
          title={`${GROUP_LABELS[tab]} বিভাগে কেউ নেই`}
          description="এই বিভাগে সদস্য যোগ করুন। খালি বিভাগ ওয়েবসাইটে দেখানো হয় না।"
          action={
            <button className="btn-primary" type="button" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> সদস্য যোগ করুন
            </button>
          }
        />
      ) : (
        <SortableList
          items={groupPositions}
          onReorder={(next) => {
            const others = (localOrder ?? positions).filter((p) => p.group !== tab);
            setLocalOrder([
              ...others,
              ...next.map((p, index) => ({ ...p, displayOrder: index * 10 })),
            ]);
            reorder.mutate(next);
          }}
          renderItem={(position) => (
            <div className="flex items-center gap-3">
              <img
                src={thumb(position.photoOverride ?? position.person?.photo, 80) ?? ''}
                alt=""
                className="h-12 w-12 rounded-full border border-slate-200 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">{position.person?.name}</p>
                <p className="text-sm text-slate-500">{position.designation?.nameBn}</p>
              </div>
              <PhotoOverrideButton
                position={position}
                onChange={(media) => updatePhoto.mutate({ positionId: position._id, media })}
              />
              <button
                type="button"
                className="btn-ghost text-brand-accent"
                onClick={() => setDeleteId(position._id)}
                aria-label="সরান"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      )}

      <AddPositionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        committeeId={id}
        defaultGroup={tab}
        designations={designationsQ.data ?? []}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="সদস্যকে সরাবেন?"
        message="এই বছরের কমিটি থেকে সরানো হবে। ব্যক্তির রেকর্ড ও অন্য বছরের পদ অক্ষত থাকবে।"
        confirmLabel="হ্যাঁ, সরান"
        loading={removePosition.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && removePosition.mutate(deleteId)}
      />
    </>
  );
}

function PhotoOverrideButton({
  position, onChange,
}: { position: Position; onChange: (media: Media | null) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn-ghost text-xs" onClick={() => setOpen(true)}>
        ছবি বদলান
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="এই বছরের ছবি">
        <ImageField
          label={`${position.person?.name} — ${position.designation?.nameBn}`}
          value={position.photoOverride ?? position.person?.photo ?? null}
          folder={`committee/${position.committee}`}
          onChange={(media) => {
            onChange(media);
            setOpen(false);
          }}
        />
        <p className="hint">
          এখানে ছবি না দিলে ব্যক্তির প্রধান ছবিটি ব্যবহার হবে।
        </p>
      </Modal>
    </>
  );
}

function AddPositionModal({
  open, onClose, committeeId, defaultGroup, designations,
}: {
  open: boolean;
  onClose: () => void;
  committeeId: string;
  defaultGroup: PositionGroup;
  designations: { _id: string; nameBn: string; group: PositionGroup }[];
}) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [personId, setPersonId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [newName, setNewName] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);

  const peopleQ = useQuery({
    queryKey: ['people-search', search],
    queryFn: () => peopleApi.list({ q: search || undefined, limit: 30 }),
    enabled: open,
  });

  const add = useMutation({
    mutationFn: async () => {
      let finalPersonId = personId;
      if (creatingNew) {
        if (!newName.trim()) throw new Error('নাম দিন');
        const created = await peopleApi.create({ name: newName.trim() });
        finalPersonId = created._id;
      }
      if (!finalPersonId) throw new Error('একজন ব্যক্তি নির্বাচন করুন');
      if (!designationId) throw new Error('পদবি নির্বাচন করুন');
      return committeesApi.addPosition(committeeId, {
        person: finalPersonId,
        designation: designationId,
      });
    },
    onSuccess: () => {
      toast.success('সদস্য যোগ হয়েছে');
      setPersonId('');
      setNewName('');
      setCreatingNew(false);
      qc.invalidateQueries({ queryKey: ['positions', committeeId] });
      qc.invalidateQueries({ queryKey: ['people'] });
      onClose();
    },
    onError: (err: any) => toast.error(err?.message ?? apiError(err)),
  });

  const relevant = designations.filter((d) => d.group === defaultGroup);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="কমিটিতে সদস্য যোগ করুন"
      footer={
        <>
          <button className="btn-secondary" type="button" onClick={onClose}>বাতিল</button>
          <button className="btn-primary" type="button" disabled={add.isPending} onClick={() => add.mutate()}>
            {add.isPending && <Spinner className="h-4 w-4 text-white" />} যোগ করুন
          </button>
        </>
      }
    >
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className={creatingNew ? 'btn-secondary flex-1' : 'btn-primary flex-1'}
          onClick={() => setCreatingNew(false)}
        >
          বিদ্যমান ব্যক্তি
        </button>
        <button
          type="button"
          className={creatingNew ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
          onClick={() => setCreatingNew(true)}
        >
          নতুন ব্যক্তি
        </button>
      </div>

      {creatingNew ? (
        <Field label="নাম (বাংলায়)" required hint="পরে সদস্য তালিকা থেকে ছবি ও বিস্তারিত যোগ করা যাবে">
          <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </Field>
      ) : (
        <>
          <Field label="ব্যক্তি খুঁজুন" required>
            <input
              className="input" placeholder="নাম লিখুন…"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </Field>
          <div className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-slate-200">
            {peopleQ.data?.data.map((person) => (
              <button
                key={person._id}
                type="button"
                onClick={() => setPersonId(person._id)}
                className={`flex w-full items-center gap-3 border-b border-slate-100 px-3 py-2 text-left last:border-0 ${
                  personId === person._id ? 'bg-brand/10' : 'hover:bg-slate-50'
                }`}
              >
                <img
                  src={thumb(person.photo, 60) ?? ''}
                  alt=""
                  className="h-8 w-8 rounded-full bg-slate-200 object-cover"
                />
                <span className="flex-1 text-sm">{person.name}</span>
                <span className="text-xs text-slate-400">{toBn(person.positionCount ?? 0)} পদ</span>
              </button>
            ))}
            {!peopleQ.data?.data.length && (
              <p className="p-3 text-sm text-slate-400">কেউ পাওয়া যায়নি</p>
            )}
          </div>
        </>
      )}

      <Field label="পদবি" required>
        <select className="input" value={designationId} onChange={(e) => setDesignationId(e.target.value)}>
          <option value="">নির্বাচন করুন…</option>
          <optgroup label={GROUP_LABELS[defaultGroup]}>
            {relevant.map((d) => (
              <option key={d._id} value={d._id}>{d.nameBn}</option>
            ))}
          </optgroup>
          <optgroup label="অন্যান্য">
            {designations.filter((d) => d.group !== defaultGroup).map((d) => (
              <option key={d._id} value={d._id}>
                {d.nameBn} ({GROUP_LABELS[d.group]})
              </option>
            ))}
          </optgroup>
        </select>
      </Field>
    </Modal>
  );
}
