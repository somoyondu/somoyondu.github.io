import { Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToHash from './components/ScrollToHash';
import StaleContentBanner from './components/StaleContentBanner';
import { useSettings } from './context/SettingsContext';
import SiteLayout from './layouts/SiteLayout';
import { AlbumPage, GalleryIndexPage } from './pages/GalleryPage';
import CommitteePage from './pages/CommitteePage';
import ContactPage from './pages/ContactPage';
import { EventDetailPage, EventsIndexPage } from './pages/EventsPage';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import { PostDetailPage, PostsIndexPage } from './pages/PostsPage';

function MaintenanceScreen({ siteName }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF3CF] px-6 text-center">
      <h1 className="text-4xl font-bold text-[#1D0061]">{siteName}</h1>
      <p className="mt-4 text-lg text-gray-700">
        ওয়েবসাইটটি সাময়িকভাবে রক্ষণাবেক্ষণের কাজে বন্ধ আছে। শীঘ্রই ফিরে আসছি।
      </p>
    </div>
  );
}

function App() {
  const { settings } = useSettings();

  if (settings?.maintenanceMode) {
    return <MaintenanceScreen siteName={settings.siteName} />;
  }

  return (
    <ErrorBoundary>
      <ScrollToHash />
      <StaleContentBanner />
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<SiteLayout />}>
          <Route path="/committee/:year" element={<CommitteePage />} />
          <Route path="/gallery" element={<GalleryIndexPage />} />
          <Route path="/gallery/:slug" element={<AlbumPage />} />
          <Route path="/events" element={<EventsIndexPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
          <Route path="/notices" element={<PostsIndexPage />} />
          <Route path="/notices/:slug" element={<PostDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
