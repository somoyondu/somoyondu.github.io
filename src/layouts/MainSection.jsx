import AdvisoryCommittee from '../features/AdvisoryCommittee';
import Events from '../features/Events';
import FoundingMembers from '../features/FoundingMembers';
import Gallery from '../features/Gallery';
import ExecutiveCommitteeSection from './ExecutiveCommitteeSection';

const MainSection = () => (
  <div>
    <Gallery />
    <FoundingMembers />
    <ExecutiveCommitteeSection />
    <AdvisoryCommittee />
    <Events />
  </div>
);

export default MainSection;
