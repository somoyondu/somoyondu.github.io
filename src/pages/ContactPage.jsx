import { useState } from 'react';
import { submitContact } from '../api/queries';
import { apiError } from '../api/client';
import Seo from '../components/Seo';
import { useSettings } from '../context/SettingsContext';

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '', website: '' };

const ContactPage = () => {
  const { settings } = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading', message: '' });
    try {
      const res = await submitContact(form);
      setStatus({ state: 'success', message: res?.message ?? 'বার্তা পাঠানো হয়েছে। ধন্যবাদ!' });
      setForm(EMPTY);
    } catch (err) {
      setStatus({ state: 'error', message: apiError(err) });
    }
  };

  return (
    <div className="mx-6 py-8 lg:mx-auto lg:max-w-2xl">
      <Seo title="যোগাযোগ" description="সময়নের সাথে যোগাযোগ করুন" path="/contact" />
      <h1 className="mb-2 text-center text-3xl font-bold text-[#1D0061]">যোগাযোগ</h1>
      <p className="mb-6 text-center text-gray-600">
        আপনার প্রশ্ন, পরামর্শ বা সহযোগিতার প্রস্তাব আমাদের জানান।
      </p>

      {status.state === 'success' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="font-semibold text-green-800">{status.message}</p>
          <button
            type="button"
            className="mt-3 text-sm text-[#6251A7] underline"
            onClick={() => setStatus({ state: 'idle', message: '' })}
          >
            আরেকটি বার্তা পাঠান
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="rounded-xl bg-white p-6 shadow-md">
          {/* Honeypot — hidden from humans, filled by bots. */}
          <input
            type="text" name="website" value={form.website} onChange={set('website')}
            tabIndex={-1} autoComplete="off" aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px' }}
          />

          <label className="mb-1 block text-sm font-semibold" htmlFor="name">নাম *</label>
          <input id="name" required className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.name} onChange={set('name')} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold" htmlFor="email">ইমেইল *</label>
              <input id="email" type="email" required className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold" htmlFor="phone">মোবাইল</label>
              <input id="phone" className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          <label className="mb-1 block text-sm font-semibold" htmlFor="subject">বিষয় *</label>
          <input id="subject" required minLength={3} className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.subject} onChange={set('subject')} />

          <label className="mb-1 block text-sm font-semibold" htmlFor="message">বার্তা *</label>
          <textarea id="message" required minLength={10} rows={5}
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.message} onChange={set('message')} />

          {status.state === 'error' && (
            <p className="mb-3 text-sm font-medium text-red-700">{status.message}</p>
          )}

          <button
            type="submit"
            disabled={status.state === 'loading'}
            className="w-full rounded-md bg-[#1D0061] px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            {status.state === 'loading' ? 'পাঠানো হচ্ছে…' : 'বার্তা পাঠান'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-gray-600">
        {settings.contact?.email && <p>ইমেইল: {settings.contact.email}</p>}
        {settings.contact?.phone && <p>মোবাইল: {settings.contact.phone}</p>}
      </div>
    </div>
  );
};

export default ContactPage;
