import { Link, useParams } from 'react-router-dom';
import { usePost, usePosts } from '../api/queries';
import Seo from '../components/Seo';
import { SectionError, Skeleton } from '../components/Skeleton';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

export const PostsIndexPage = () => {
  const { data, isLoading, isError, refetch } = usePosts({ limit: 20 });
  const posts = data?.items ?? [];

  return (
    <div className="mx-6 py-8 lg:mx-auto lg:max-w-4xl">
      <Seo title="নোটিশ ও ব্লগ" description="সময়নের ঘোষণা, নোটিশ ও লেখা" path="/notices" />
      <h1 className="mb-6 text-center text-3xl font-bold text-[#1D0061]">নোটিশ ও ব্লগ</h1>

      {isLoading && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      )}
      {isError && <SectionError message="লেখা লোড করা যায়নি" onRetry={refetch} />}

      {!isLoading && !isError && (
        posts.length ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/notices/${post.slug}`}
                className="flex gap-4 rounded-xl bg-white p-4 shadow-md transition hover:scale-[1.01]"
              >
                {post.coverUrl && (
                  <img src={post.coverUrl} alt="" className="h-24 w-32 rounded-lg object-cover" loading="lazy" />
                )}
                <div>
                  <p className="text-xs text-[#6251A7]">{formatDate(post.publishedAt)}</p>
                  <h2 className="font-bold text-[#1D0061]">{post.title}</h2>
                  {post.excerpt && <p className="mt-1 text-sm text-gray-600">{post.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-gray-500">এখনো কোনো লেখা প্রকাশ করা হয়নি</p>
        )
      )}
    </div>
  );
};

export const PostDetailPage = () => {
  const { slug } = useParams();
  const { data, isLoading, isError, refetch } = usePost(slug);

  if (isLoading) return <Skeleton className="mx-6 my-8 h-96 lg:mx-40" />;
  if (isError || !data) return <SectionError message="লেখাটি পাওয়া যায়নি" onRetry={refetch} />;

  return (
    <article className="mx-6 py-8 lg:mx-auto lg:max-w-3xl">
      <Seo
        title={data.seo?.metaTitle ?? data.title}
        description={data.seo?.metaDescription ?? data.excerpt}
        image={data.coverUrl}
        type="article"
        path={`/notices/${slug}`}
      />
      <Link to="/notices" className="text-sm text-[#6251A7] hover:underline">← সব লেখা</Link>

      {data.coverUrl && <img src={data.coverUrl} alt="" className="mt-4 w-full rounded-xl object-cover" />}
      <h1 className="mt-4 text-3xl font-bold text-[#1D0061]">{data.title}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {formatDate(data.publishedAt)}
        {data.author?.name ? ` · ${data.author.name}` : ''}
      </p>

      {data.content && (
        <div className="prose mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: data.content }} />
      )}
    </article>
  );
};
