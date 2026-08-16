import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEvent, useEvents } from '../api/queries';
import Seo from '../components/Seo';
import { SectionError, Skeleton } from '../components/Skeleton';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '';

export const EventsIndexPage = () => {
  const [when, setWhen] = useState('upcoming');
  const { data, isLoading, isError, refetch } = useEvents({ when, limit: 12 });
  const events = data?.items ?? [];

  return (
    <div className="mx-6 py-8 lg:mx-20">
      <Seo title="ইভেন্টস" description="সময়নের আসন্ন ও অতীত কার্যক্রম" path="/events" />
      <h1 className="mb-4 text-center text-3xl font-bold text-[#1D0061]">ইভেন্টস</h1>

      <div className="mb-6 flex justify-center gap-2">
        {[
          { id: 'upcoming', label: 'আসন্ন' },
          { id: 'past', label: 'অতীত' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setWhen(tab.id)}
            className={`rounded-md px-5 py-2 text-sm font-bold ${
              when === tab.id ? 'bg-[#1D0061] text-white' : 'bg-white text-[#1D0061] ring-1 ring-[#CBBEFF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />)}
        </div>
      )}
      {isError && <SectionError message="ইভেন্ট লোড করা যায়নি" onRetry={refetch} />}

      {!isLoading && !isError && (
        events.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.slug}`}
                className="overflow-hidden rounded-xl bg-white shadow-md transition hover:scale-[1.02]"
              >
                {event.coverUrl && (
                  <img src={event.coverUrl} alt="" className="h-44 w-full object-cover" loading="lazy" />
                )}
                <div className="p-4">
                  <p className="text-xs text-[#6251A7]">{formatDate(event.startAt)}</p>
                  <h2 className="mt-1 font-bold text-[#1D0061]">{event.title}</h2>
                  {event.venue && <p className="text-xs text-gray-500">{event.venue}</p>}
                  {event.excerpt && <p className="mt-2 text-sm text-gray-600">{event.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-gray-500">
            {when === 'upcoming' ? 'এই মুহূর্তে কোনো আসন্ন ইভেন্ট নেই' : 'কোনো অতীত ইভেন্ট নেই'}
          </p>
        )
      )}
    </div>
  );
};

export const EventDetailPage = () => {
  const { slug } = useParams();
  const { data, isLoading, isError, refetch } = useEvent(slug);

  if (isLoading) return <Skeleton className="mx-6 my-8 h-96 lg:mx-40" />;
  if (isError || !data) return <SectionError message="ইভেন্টটি পাওয়া যায়নি" onRetry={refetch} />;

  return (
    <article className="mx-6 py-8 lg:mx-auto lg:max-w-3xl">
      <Seo
        title={data.title}
        description={data.excerpt}
        image={data.coverUrl}
        type="article"
        path={`/events/${slug}`}
      />
      <Link to="/events" className="text-sm text-[#6251A7] hover:underline">← সব ইভেন্ট</Link>

      {data.coverUrl && (
        <img src={data.coverUrl} alt="" className="mt-4 w-full rounded-xl object-cover" />
      )}
      <h1 className="mt-4 text-3xl font-bold text-[#1D0061]">{data.title}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {formatDate(data.startAt)}
        {data.venue ? ` · ${data.venue}` : ''}
      </p>

      {data.registrationUrl && (
        <a
          href={data.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-md bg-[#1D0061] px-6 py-2 text-white"
        >
          রেজিস্ট্রেশন করুন
        </a>
      )}

      {data.content && (
        <div
          className="prose mt-6 max-w-none"
          // Content is sanitised server-side on write with sanitize-html.
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      )}

      {!!data.gallery?.length && (
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {data.gallery.map((img, i) => (
            <img key={i} src={img.url} alt="" className="aspect-square rounded-lg object-cover" loading="lazy" />
          ))}
        </div>
      )}
    </article>
  );
};
