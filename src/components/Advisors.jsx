import { useAdvisors } from '../api/queries';
import AdvisorCard from './AdvisorCard';
import { AdvisorSkeletonGrid, SectionError } from './Skeleton';

const Advisors = () => {
  const { data, isLoading, isError, refetch } = useAdvisors();

  if (isLoading) return <AdvisorSkeletonGrid />;
  if (isError) return <SectionError message="উপদেষ্টামণ্ডলীর তথ্য লোড করা যায়নি" onRetry={refetch} />;
  if (!data?.length) return null;

  return (
    <div className="mx-6 lg:mx-20 mt-5 lg:mt-10 grid gap-1 lg:gap-4 grid-cols-2 lg:grid-cols-3">
      {data.map((advisor) => (
        <AdvisorCard key={advisor.id ?? advisor.name} advisor={advisor} />
      ))}
    </div>
  );
};

export default Advisors;
