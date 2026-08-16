import { useState } from 'react';
import { useCommittee } from '../api/queries';
import AllExecutives from '../components/AllExecutives';
import PositionGrid from '../components/Executives/PositionGrid';
import { CardSkeletonGrid, SectionError } from '../components/Skeleton';
import ViewMoreOrLessButton from '../components/ViewMoreOrLessButton';

const ExecutiveCommittee = ({ committee }) => {
  const [isDetails, setIsDetails] = useState(false);
  const { data, isLoading, isError, refetch } = useCommittee(committee.year);

  const groups = data?.groups ?? {};
  const topLeaders = groups.TOP_LEADER ?? [];

  return (
    <div className="py-2 my-6">
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl text-center font-bold text-[#1D0061]">
          {committee.title}
        </h2>
      </div>

      {isLoading && <CardSkeletonGrid count={4} />}
      {isError && (
        <SectionError message={`${committee.title} লোড করা যায়নি`} onRetry={refetch} />
      )}

      {!isLoading && !isError && (
        <>
          <PositionGrid positions={topLeaders} />

          {!isDetails ? (
            <ViewMoreOrLessButton
              isDetails={isDetails}
              setIsDetails={setIsDetails}
              buttonText={committee.expandButtonText}
            />
          ) : (
            <div>
              <div className="m-10" />
              <AllExecutives groups={groups} />
              <ViewMoreOrLessButton
                isDetails={isDetails}
                setIsDetails={setIsDetails}
                buttonText={committee.collapseButtonText}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExecutiveCommittee;
