import { useFoundingMembers } from '../../api/queries';
import { CardSkeletonGrid, SectionError } from '../Skeleton';
import PositionGrid from './PositionGrid';

const FoundingLeaders = () => {
  const { data, isLoading, isError, refetch } = useFoundingMembers();

  if (isLoading) return <CardSkeletonGrid count={6} />;
  if (isError) return <SectionError message="প্রতিষ্ঠাতা সদস্যদের তথ্য লোড করা যায়নি" onRetry={refetch} />;

  return <PositionGrid positions={data ?? []} />;
};

export default FoundingLeaders;
