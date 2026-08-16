import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import BottomSection from './BottomSection';

/** Chrome for the inner pages (the landing page renders its own hero). */
const SiteLayout = () => (
  <div className="flex min-h-screen flex-col">
    <div className="relative bg-[#FFF3CF] pb-24">
      <NavBar />
    </div>
    <main className="flex-1">
      <Outlet />
    </main>
    <BottomSection />
  </div>
);

export default SiteLayout;
