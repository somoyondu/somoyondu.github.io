import { Link } from 'react-router-dom';
import { useEvents } from '../api/queries';
import { Skeleton } from '../components/Skeleton';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

/** Landing-page teaser: upcoming events only, hidden entirely when empty. */
const Events = () => {
  const { data, isLoading } = useEvents({ when: 'upcoming', limit: 3 });
  const events = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="bg-[#FFF3CF] py-8" id="events">
        <div className="mx-6 grid gap-4 lg:mx-20 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  if (!events.length) return null;

  return (
    <div className="bg-[#FFF3CF] py-8" id="events">
      <h2 className="text-2xl lg:text-3xl text-center font-bold pb-6 text-[#1D0061]">আসন্ন ইভেন্ট</h2>
      <div className="mx-6 grid gap-4 lg:mx-20 lg:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.slug}`}
            className="overflow-hidden rounded-xl bg-white shadow-md transition hover:scale-[1.02]"
          >
            {event.coverUrl && (
              <img src={event.coverUrl} alt="" className="h-40 w-full object-cover" loading="lazy" />
            )}
            <div className="p-4">
              <p className="text-xs text-[#6251A7]">{formatDate(event.startAt)}</p>
              <h3 className="mt-1 font-bold text-[#1D0061]">{event.title}</h3>
              {event.excerpt && <p className="mt-1 text-sm text-gray-600 line-clamp-3">{event.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link to="/events" className="rounded-md bg-[#1D0061] px-8 py-2 text-white">সব ইভেন্ট দেখুন</Link>
      </div>
    </div>
  );
};

export default Events;
