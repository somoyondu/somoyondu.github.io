import Seo from '../components/Seo';
import BottomSection from '../layouts/BottomSection';
import MainSection from '../layouts/MainSection';
import TopSection from '../layouts/TopSection';

const LandingPage = () => (
  <>
    <Seo path="/" />
    <TopSection />
    <MainSection />
    <BottomSection />
  </>
);

export default LandingPage;
