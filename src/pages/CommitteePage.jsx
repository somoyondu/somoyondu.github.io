import { Link, useParams } from 'react-router-dom';
import { useCommittee } from '../api/queries';
import AllExecutives from '../components/AllExecutives';
import PositionGrid from '../components/Executives/PositionGrid';
import Seo from '../components/Seo';
import { CardSkeletonGrid, SectionError } from '../components/Skeleton';

/** Deep-linkable single committee year — /committee/2026 */
const CommitteePage = () => {
  const { year } = useParams();
  const { data, isLoading, isError, refetch } = useCommittee(year);

  if (isLoading) return <CardSkeletonGrid count={8} />;
  if (isError || !data) {
    return (
      <SectionError message={`${year} সালের কমিটি পাওয়া যায়নি`} onRetry={refetch} />
    );
  }

  return (
    <div className="py-8">
      <Seo
        title={data.title}
        description={data.description ?? `সময়নের ${year} সালের কার্যনির্বাহী পরিষদ`}
        path={`/committee/${year}`}
      />

      <div className="text-center">
        <Link to="/" className="text-sm text-[#6251A7] hover:underline">← হোমপেজ</Link>
        <h1 className="mt-2 text-3xl font-bold text-[#1D0061] lg:text-4xl">{data.title}</h1>
        <p className="mt-1 text-gray-600">মোট {data.totalMembers} জন সদস্য</p>
      </div>

      <PositionGrid positions={data.groups?.TOP_LEADER ?? []} />
      <div className="m-10" />
      <AllExecutives groups={data.groups ?? {}} />
    </div>
  );
};

export default CommitteePage;
