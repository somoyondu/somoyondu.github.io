import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Merge, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { peopleApi } from '@/api/endpoints';
import { ImageField } from '@/components/MediaPicker';
import {
  ConfirmDialog, EmptyState, ErrorState, Field, Modal, PageHeader, PageLoader, Pagination, Spinner,
} from '@/components/ui';
import { toBn } from '@/lib/constants';
import type { Media, Person } from '@/lib/types';
import { thumb } from '@/lib/utils';

export function PeoplePage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Person | null | 'new'>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['people', page, search],
    queryFn: () => peopleApi.list({ page, limit: 24, q: search || undefined }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => peopleApi.remove(id),
    onSuccess: () => {
      toast.success('মুছে ফেলা হয়েছে');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['people'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState message="সদস্য তালিকা লোড করা যায়নি" onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="সদস্য তালিকা"
        description="একজন ব্যক্তির একটিই রেকর্ড — প্রতি বছরের পদ সেই রেকর্ডের সাথে যুক্ত হয়।"
        actions={
          <>
            <button className="btn-secondary" type="button" onClick={() => setMergeOpen(true)}>
              <Merge className="h-4 w-4" /> ডুপ্লিকেট মেলান
            </button>
            <button className="btn-primary" type="button" onClick={() => setEditing('new')}>
              <Plus className="h-4 w-4" /> নতুন ব্যক্তি
            </button>
          </>
        }
      />

      <input
        className="input mb-4 max-w-sm"
        placeholder="নাম দিয়ে খুঁজুন…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {!data?.data.length ? (
        <EmptyState title="কেউ পাওয়া যায়নি" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.data.map((person) => (
            <div key={person._id} className="card card-body flex items-center gap-3">
              <img
                src={thumb(person.photo, 96) ?? ''}
                alt=""
                className="h-14 w-14 rounded-full border border-slate-200 bg-slate-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">{person.name}</p>
                <p className="text-xs text-slate-500">
                  {toBn(person.positionCount ?? 0)} টি পদ
                  {person.department ? ` · ${person.department}` : ''}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button className="btn-ghost p-1" type="button" onClick={() => setEditing(person)}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="btn-ghost p-1 text-brand-accent"
                  type="button"
                  onClick={() => setDeleteId(person._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination meta={data?.meta} onPage={setPage} />

      <PersonModal
        person={editing}
        onClose={() => setEditing(null)}
        onSaved={() => qc.invalidateQueries({ queryKey: ['people'] })}
      />

      <MergeModal open={mergeOpen} onClose={() => setMergeOpen(false)} />

      <ConfirmDialog
        open={!!deleteId}
        title="ব্যক্তিকে মুছে ফেলবেন?"
        message="কোনো কমিটিতে পদ থাকলে মুছে ফেলা যাবে না — আগে সেসব পদ সরান।"
        loading={remove.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </>
  );
}

function PersonModal({
  person, onClose, onSaved,
}: { person: Person | null | 'new'; onClose: () => void; onSaved: () => void }) {
  const isNew = person === 'new';
  const current = isNew ? null : person;

  const [form, setForm] = useState({
    name: '', nameEn: '', department: '', session: '', bio: '', isPublic: false,
    facebook: '', linkedin: '', email: '', phone: '',
  });
  const [photo, setPhoto] = useState<Media | null>(null);
  const [ready, setReady] = useState(false);

  // Populate the form when the modal opens for a specific person.
  if (person && !ready) {
    setForm({
      name: current?.name ?? '',
      nameEn: current?.nameEn ?? '',
      department: current?.department ?? '',
      session: current?.session ?? '',
      bio: current?.bio ?? '',
      isPublic: current?.isPublic ?? false,
      facebook: current?.socials?.facebook ?? '',
      linkedin: current?.socials?.linkedin ?? '',
      email: current?.socials?.email ?? '',
      phone: current?.socials?.phone ?? '',
    });
    setPhoto(current?.photo ?? null);
    setReady(true);
  }

  const close = () => { setReady(false); onClose(); };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name: form.name,
        nameEn: form.nameEn || undefined,
        department: form.department || undefined,
        session: form.session || undefined,
        bio: form.bio || undefined,
        isPublic: form.isPublic,
        photo: photo?._id,
        socials: {
          facebook: form.facebook || undefined,
          linkedin: form.linkedin || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
        },
      };
      return isNew ? peopleApi.create(body) : peopleApi.update(current!._id, body);
    },
    onSuccess: () => {
      toast.success('সংরক্ষিত হয়েছে');
      onSaved();
      close();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <Modal
      open={!!person}
      onClose={close}
      title={isNew ? 'নতুন ব্যক্তি' : 'তথ্য সম্পাদনা'}
      footer={
        <>
          <button className="btn-secondary" type="button" onClick={close}>বাতিল</button>
          <button className="btn-primary" type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Spinner className="h-4 w-4 text-white" />} সংরক্ষণ
          </button>
        </>
      }
    >
      <ImageField label="প্রধান ছবি" value={photo} onChange={setPhoto} folder="people" />

      <Field label="নাম (বাংলায়)" required>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="নাম (ইংরেজিতে)" hint="URL ও ভবিষ্যতের ইংরেজি সংস্করণের জন্য">
        <input className="input" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="বিভাগ">
          <input className="input" value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })} />
        </Field>
        <Field label="সেশন">
          <input className="input" value={form.session}
            onChange={(e) => setForm({ ...form, session: e.target.value })} />
        </Field>
      </div>
      <Field label="সংক্ষিপ্ত পরিচিতি">
        <textarea className="input" rows={3} value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="ফেসবুক">
          <input className="input" value={form.facebook}
            onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
        </Field>
        <Field label="লিংকডইন">
          <input className="input" value={form.linkedin}
            onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
        </Field>
        <Field label="ইমেইল">
          <input className="input" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="মোবাইল">
          <input className="input" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.isPublic}
          onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
        যোগাযোগের তথ্য ওয়েবসাইটে দেখান
      </label>
    </Modal>
  );
}

function MergeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['people-duplicates'],
    queryFn: peopleApi.duplicates,
    enabled: open,
  });

  const merge = useMutation({
    mutationFn: (body: { keepId: string; mergeIds: string[] }) => peopleApi.merge(body),
    onSuccess: (res) => {
      toast.success(`${res.merged} টি ডুপ্লিকেট মেলানো হয়েছে`);
      qc.invalidateQueries({ queryKey: ['people'] });
      qc.invalidateQueries({ queryKey: ['people-duplicates'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title="সম্ভাব্য ডুপ্লিকেট" wide>
      <p className="mb-4 rounded-lg bg-brand-cream p-3 text-sm text-slate-700">
        একই নাম আলাদা রেকর্ড হিসেবে থাকলে এখানে দেখানো হয়। মেলালে সব পদ প্রথম রেকর্ডে
        সরে যাবে এবং বাকিগুলো মুছে যাবে।
      </p>

      {isLoading ? (
        <Spinner className="mx-auto" />
      ) : !data?.length ? (
        <p className="py-6 text-center text-sm text-slate-500">কোনো ডুপ্লিকেট পাওয়া যায়নি ✓</p>
      ) : (
        <ul className="space-y-2">
          {data.map((group) => (
            <li key={group.normalizedName} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              <div className="flex-1">
                <p className="text-sm font-semibold">{group.names.join(' · ')}</p>
                <p className="text-xs text-slate-500">{toBn(group.count)} টি রেকর্ড</p>
              </div>
              <button
                className="btn-secondary"
                type="button"
                disabled={merge.isPending}
                onClick={() => merge.mutate({ keepId: group.ids[0], mergeIds: group.ids.slice(1) })}
              >
                মেলান
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
