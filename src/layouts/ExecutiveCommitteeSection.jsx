import { useCommittees } from '../api/queries';
import { CardSkeletonGrid, SectionError } from '../components/Skeleton';
import ExecutiveCommittee from '../features/ExecutiveCommittee';

/**
 * Renders every published committee year returned by the API. Adding 2027 is
 * a CMS action now — this file never needs editing again.
 */
const ExecutiveCommitteeSection = () => {
  const { data, isLoading, isError, refetch } = useCommittees();

  if (isLoading) {
    return (
      <div id="executives" className="py-2 my-6">
        <CardSkeletonGrid count={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div id="executives">
        <SectionError message="কার্যনির্বাহী পরিষদের তথ্য লোড করা যায়নি" onRetry={refetch} />
      </div>
    );
  }

  // The founding committee has its own section on the landing page.
  const committees = (data ?? []).filter((c) => !c.isFounding || (data ?? []).length === 1);

  return (
    <div id="executives">
      {committees.map((committee) => (
        <ExecutiveCommittee key={committee.year} committee={committee} />
      ))}
    </div>
  );
};

export default ExecutiveCommitteeSection;
