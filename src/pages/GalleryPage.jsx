import { Link, useParams } from 'react-router-dom';
import { useAlbum, useAlbums } from '../api/queries';
import Seo from '../components/Seo';
import { SectionError, Skeleton } from '../components/Skeleton';

export const GalleryIndexPage = () => {
  const { data, isLoading, isError, refetch } = useAlbums();

  return (
    <div className="mx-6 py-8 lg:mx-20">
      <Seo title="গ্যালারি" description="সময়নের কার্যক্রমের ছবি" path="/gallery" />
      <h1 className="mb-6 text-center text-3xl font-bold text-[#1D0061]">গ্যালারি</h1>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-video" />)}
        </div>
      )}
      {isError && <SectionError message="অ্যালবাম লোড করা যায়নি" onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(data ?? []).map((album) => (
            <Link
              key={album.id}
              to={`/gallery/${album.slug}`}
              className="overflow-hidden rounded-xl bg-white shadow-md transition hover:scale-[1.02]"
            >
              {album.coverUrl ? (
                <img src={album.coverUrl} alt="" className="aspect-video w-full object-cover" loading="lazy" />
              ) : (
                <div className="aspect-video bg-gray-100" />
              )}
              <div className="p-3">
                <h2 className="font-bold text-[#1D0061]">{album.title}</h2>
                <p className="text-xs text-gray-500">
                  {album.itemCount} টি ছবি{album.year ? ` · ${album.year}` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const AlbumPage = () => {
  const { slug } = useParams();
  const { data, isLoading, isError, refetch } = useAlbum(slug);

  if (isLoading) {
    return (
      <div className="mx-6 grid gap-3 py-8 sm:grid-cols-3 lg:mx-20">
        {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
      </div>
    );
  }
  if (isError || !data) return <SectionError message="অ্যালবাম পাওয়া যায়নি" onRetry={refetch} />;

  return (
    <div className="mx-6 py-8 lg:mx-20">
      <Seo title={data.title} description={data.description} path={`/gallery/${slug}`} image={data.coverUrl} />
      <Link to="/gallery" className="text-sm text-[#6251A7] hover:underline">← সব অ্যালবাম</Link>
      <h1 className="mb-2 mt-2 text-3xl font-bold text-[#1D0061]">{data.title}</h1>
      {data.description && <p className="mb-6 text-gray-600">{data.description}</p>}

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(data.items ?? []).map((item) => (
          <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
            <img
              src={item.thumbUrl ?? item.url}
              alt={item.title}
              className="aspect-square w-full rounded-lg object-cover transition hover:scale-105"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </div>
  );
};
