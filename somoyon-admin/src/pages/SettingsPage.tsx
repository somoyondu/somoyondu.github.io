import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { settingsApi } from '@/api/endpoints';
import { ImageField } from '@/components/MediaPicker';
import { ErrorState, Field, PageHeader, PageLoader, Spinner } from '@/components/ui';
import type { Media, SiteSettings } from '@/lib/types';

const TABS = [
  { id: 'general', label: 'সাধারণ' },
  { id: 'content', label: 'পাতার লেখা' },
  { id: 'contact', label: 'যোগাযোগ' },
  { id: 'donation', label: 'দান' },
  { id: 'nav', label: 'মেনু' },
  { id: 'seo', label: 'SEO' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function SettingsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabId>('general');
  const [form, setForm] = useState<SiteSettings | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = useMutation({
    mutationFn: () => {
      if (!form) throw new Error('কিছু পরিবর্তন করা হয়নি');
      // Media fields are sent as ids, not populated objects.
      const body: any = {
        ...form,
        logo: form.logo?._id ?? null,
        whiteLogo: form.whiteLogo?._id ?? null,
        favicon: form.favicon?._id ?? null,
        heroBackground: form.heroBackground?._id ?? null,
      };
      return settingsApi.update(body);
    },
    onSuccess: () => {
      toast.success('সেটিংস সংরক্ষিত হয়েছে · ওয়েবসাইটে সাথে সাথে দেখাবে');
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (isLoading) return <PageLoader />;
  if (error || !form) return <ErrorState message="সেটিংস লোড করা যায়নি" onRetry={refetch} />;

  const set = (patch: Partial<SiteSettings>) => setForm({ ...form, ...patch });
  const setImage = (key: 'logo' | 'whiteLogo' | 'favicon' | 'heroBackground') => (media: Media | null) =>
    set({ [key]: media } as any);

  return (
    <>
      <PageHeader
        title="সাইট সেটিংস"
        description="ওয়েবসাইটের সব স্থায়ী লেখা, লোগো ও যোগাযোগের তথ্য এখান থেকে বদলান।"
        actions={
          <button className="btn-primary" type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Spinner className="h-4 w-4 text-white" />} সংরক্ষণ করুন
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === t.id ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card card-body max-w-3xl">
        {tab === 'general' && (
          <>
            <Field label="সাইটের নাম" required>
              <input className="input" value={form.siteName ?? ''}
                onChange={(e) => set({ siteName: e.target.value })} />
            </Field>
            <Field label="স্লোগান">
              <input className="input" value={form.tagline ?? ''}
                onChange={(e) => set({ tagline: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageField label="লোগো (নেভিগেশন)" value={form.logo} onChange={setImage('logo')} folder="site" />
              <ImageField label="সাদা লোগো (ফুটার)" value={form.whiteLogo} onChange={setImage('whiteLogo')} folder="site" />
              <ImageField label="ফেভিকন" value={form.favicon} onChange={setImage('favicon')} folder="site" size={64} />
              <ImageField label="হিরো ব্যাকগ্রাউন্ড" value={form.heroBackground}
                onChange={setImage('heroBackground')} folder="site" size={140} />
            </div>

            <p className="mb-2 mt-4 text-xs font-bold uppercase text-slate-400">হোমপেজের হিরো</p>
            <Field label="প্রধান শিরোনাম">
              <input className="input" value={form.hero?.headline ?? ''}
                onChange={(e) => set({ hero: { ...form.hero, headline: e.target.value } })} />
            </Field>
            <Field label="উপ-শিরোনাম">
              <input className="input" value={form.hero?.subheadline ?? ''}
                onChange={(e) => set({ hero: { ...form.hero, subheadline: e.target.value } })} />
            </Field>
            <Field label="পরিচিতি">
              <textarea className="input" rows={4} value={form.hero?.body ?? ''}
                onChange={(e) => set({ hero: { ...form.hero, body: e.target.value } })} />
            </Field>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.maintenanceMode ?? false}
                onChange={(e) => set({ maintenanceMode: e.target.checked })} />
              মেইনটেন্যান্স মোড চালু করুন (দর্শকরা রক্ষণাবেক্ষণের বার্তা দেখবেন)
            </label>
          </>
        )}

        {tab === 'content' && (
          <>
            {(['about', 'foundingBlurb', 'advisoryBlurb'] as const).map((key) => (
              <div key={key} className="mb-6 border-b border-slate-100 pb-4 last:border-0">
                <p className="mb-2 text-xs font-bold uppercase text-slate-400">
                  {key === 'about' ? 'আমাদের সম্পর্কে' : key === 'foundingBlurb' ? 'প্রতিষ্ঠাতা সদস্য' : 'উপদেষ্টামণ্ডলী'}
                </p>
                <Field label="শিরোনাম">
                  <input className="input" value={(form as any)[key]?.title ?? ''}
                    onChange={(e) => set({ [key]: { ...(form as any)[key], title: e.target.value } } as any)} />
                </Field>
                <Field label="বিবরণ">
                  <textarea className="input" rows={5} value={(form as any)[key]?.body ?? ''}
                    onChange={(e) => set({ [key]: { ...(form as any)[key], body: e.target.value } } as any)} />
                </Field>
              </div>
            ))}
            <p className="mb-2 text-xs font-bold uppercase text-slate-400">গ্যালারি</p>
            <Field label="শিরোনাম">
              <input className="input" value={form.galleryBlurb?.title ?? ''}
                onChange={(e) => set({ galleryBlurb: { ...form.galleryBlurb, title: e.target.value } })} />
            </Field>
            <Field label="উপ-শিরোনাম">
              <input className="input" value={form.galleryBlurb?.subtitle ?? ''}
                onChange={(e) => set({ galleryBlurb: { ...form.galleryBlurb, subtitle: e.target.value } })} />
            </Field>
          </>
        )}

        {tab === 'contact' && (
          <>
            <Field label="ইমেইল">
              <input className="input" value={form.contact?.email ?? ''}
                onChange={(e) => set({ contact: { ...form.contact, email: e.target.value } })} />
            </Field>
            <Field label="মোবাইল">
              <input className="input" value={form.contact?.phone ?? ''}
                onChange={(e) => set({ contact: { ...form.contact, phone: e.target.value } })} />
            </Field>
            <Field label="ঠিকানা">
              <input className="input" value={form.contact?.address ?? ''}
                onChange={(e) => set({ contact: { ...form.contact, address: e.target.value } })} />
            </Field>

            <p className="mb-2 mt-4 text-xs font-bold uppercase text-slate-400">সোশ্যাল মিডিয়া</p>
            {(form.socials ?? []).map((social, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <input
                  className="input w-32" placeholder="platform" value={social.platform}
                  onChange={(e) => {
                    const next = [...(form.socials ?? [])];
                    next[index] = { ...social, platform: e.target.value };
                    set({ socials: next });
                  }}
                />
                <input
                  className="input flex-1" placeholder="https://…" value={social.url}
                  onChange={(e) => {
                    const next = [...(form.socials ?? [])];
                    next[index] = { ...social, url: e.target.value };
                    set({ socials: next });
                  }}
                />
                <label className="flex shrink-0 items-center gap-1 text-xs">
                  <input type="checkbox" checked={social.isActive}
                    onChange={(e) => {
                      const next = [...(form.socials ?? [])];
                      next[index] = { ...social, isActive: e.target.checked };
                      set({ socials: next });
                    }} />
                  দেখান
                </label>
                <button
                  type="button" className="btn-ghost p-2 text-brand-accent"
                  onClick={() => set({ socials: (form.socials ?? []).filter((_, i) => i !== index) })}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button" className="btn-secondary mt-2"
              onClick={() =>
                set({
                  socials: [
                    ...(form.socials ?? []),
                    { platform: '', url: '', displayOrder: (form.socials?.length ?? 0) + 1, isActive: true },
                  ],
                })
              }
            >
              <Plus className="h-4 w-4" /> নতুন লিংক
            </button>
          </>
        )}

        {tab === 'donation' && (
          <>
            <label className="mb-4 flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.donation?.isEnabled ?? true}
                onChange={(e) => set({ donation: { ...form.donation, isEnabled: e.target.checked } })} />
              ওয়েবসাইটে দানের অপশন দেখান
            </label>
            <Field label="শিরোনাম">
              <input className="input" value={form.donation?.title ?? ''}
                onChange={(e) => set({ donation: { ...form.donation, title: e.target.value } })} />
            </Field>
            <Field label="বিবরণ">
              <textarea className="input" rows={4} value={form.donation?.description ?? ''}
                onChange={(e) => set({ donation: { ...form.donation, description: e.target.value } })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ফুটার শিরোনাম">
                <input className="input" value={form.donation?.footerTitle ?? ''}
                  onChange={(e) => set({ donation: { ...form.donation, footerTitle: e.target.value } })} />
              </Field>
              <Field label="ফুটার বাটন">
                <input className="input" value={form.donation?.footerCta ?? ''}
                  onChange={(e) => set({ donation: { ...form.donation, footerCta: e.target.value } })} />
              </Field>
            </div>

            <p className="mb-2 mt-4 text-xs font-bold uppercase text-slate-400">পেমেন্ট মাধ্যম</p>
            {(form.donation?.methods ?? []).map((method, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <input
                  className="input w-32" placeholder="bKash" value={method.name}
                  onChange={(e) => {
                    const next = [...(form.donation?.methods ?? [])];
                    next[index] = { ...method, name: e.target.value };
                    set({ donation: { ...form.donation, methods: next } });
                  }}
                />
                <input
                  className="input flex-1" placeholder="01xxxxxxxxx" value={method.number}
                  onChange={(e) => {
                    const next = [...(form.donation?.methods ?? [])];
                    next[index] = { ...method, number: e.target.value };
                    set({ donation: { ...form.donation, methods: next } });
                  }}
                />
                <button
                  type="button" className="btn-ghost p-2 text-brand-accent"
                  onClick={() =>
                    set({
                      donation: {
                        ...form.donation,
                        methods: (form.donation?.methods ?? []).filter((_, i) => i !== index),
                      },
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button" className="btn-secondary mt-2"
              onClick={() =>
                set({
                  donation: {
                    ...form.donation,
                    methods: [
                      ...(form.donation?.methods ?? []),
                      {
                        name: '', number: '',
                        displayOrder: (form.donation?.methods?.length ?? 0) + 1,
                        isActive: true,
                      },
                    ],
                  },
                })
              }
            >
              <Plus className="h-4 w-4" /> নতুন মাধ্যম
            </button>
          </>
        )}

        {tab === 'nav' && (
          <>
            <p className="mb-3 text-sm text-slate-500">
              ওয়েবসাইটের উপরের মেনু। নিষ্ক্রিয় করলে মেনু থেকে সরে যাবে।
            </p>
            {(form.navLinks ?? []).map((link, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <input
                  className="input w-28" placeholder="id" value={link.id}
                  onChange={(e) => {
                    const next = [...(form.navLinks ?? [])];
                    next[index] = { ...link, id: e.target.value };
                    set({ navLinks: next });
                  }}
                />
                <input
                  className="input flex-1" placeholder="মেনুর নাম" value={link.title}
                  onChange={(e) => {
                    const next = [...(form.navLinks ?? [])];
                    next[index] = { ...link, title: e.target.value };
                    set({ navLinks: next });
                  }}
                />
                <input
                  className="input w-40" placeholder="/#about" value={link.href ?? ''}
                  onChange={(e) => {
                    const next = [...(form.navLinks ?? [])];
                    next[index] = { ...link, href: e.target.value };
                    set({ navLinks: next });
                  }}
                />
                <label className="flex shrink-0 items-center gap-1 text-xs">
                  <input type="checkbox" checked={link.isActive}
                    onChange={(e) => {
                      const next = [...(form.navLinks ?? [])];
                      next[index] = { ...link, isActive: e.target.checked };
                      set({ navLinks: next });
                    }} />
                  দেখান
                </label>
                <button
                  type="button" className="btn-ghost p-2 text-brand-accent"
                  onClick={() => set({ navLinks: (form.navLinks ?? []).filter((_, i) => i !== index) })}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button" className="btn-secondary mt-2"
              onClick={() =>
                set({
                  navLinks: [
                    ...(form.navLinks ?? []),
                    { id: '', title: '', href: '', displayOrder: (form.navLinks?.length ?? 0) + 1, isActive: true },
                  ],
                })
              }
            >
              <Plus className="h-4 w-4" /> নতুন মেনু
            </button>
          </>
        )}

        {tab === 'seo' && (
          <>
            <Field label="ডিফল্ট টাইটেল">
              <input className="input" value={form.seo?.defaultTitle ?? ''}
                onChange={(e) => set({ seo: { ...form.seo, defaultTitle: e.target.value } })} />
            </Field>
            <Field label="ডিফল্ট বিবরণ" hint="সার্চ ইঞ্জিন ও শেয়ার প্রিভিউতে দেখাবে">
              <textarea className="input" rows={3} value={form.seo?.defaultDescription ?? ''}
                onChange={(e) => set({ seo: { ...form.seo, defaultDescription: e.target.value } })} />
            </Field>
            <Field label="ওয়েবসাইট URL">
              <input className="input" value={form.seo?.siteUrl ?? ''}
                onChange={(e) => set({ seo: { ...form.seo, siteUrl: e.target.value } })} />
            </Field>
            <Field label="Google Analytics ID" hint="যেমন: G-XXXXXXXXXX">
              <input className="input" value={form.seo?.gaTrackingId ?? ''}
                onChange={(e) => set({ seo: { ...form.seo, gaTrackingId: e.target.value } })} />
            </Field>
          </>
        )}
      </div>
    </>
  );
}
