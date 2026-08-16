import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdvisorsPage } from '@/pages/AdvisorsPage';
import { AuditPage } from '@/pages/AuditPage';
import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
import { CommitteeDetailPage } from '@/pages/CommitteeDetailPage';
import { CommitteesPage } from '@/pages/CommitteesPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DesignationsPage } from '@/pages/DesignationsPage';
import { EventsPage } from '@/pages/EventsPage';
import { AlbumDetailPage, GalleryPage } from '@/pages/GalleryPage';
import { InboxPage } from '@/pages/InboxPage';
import { LoginPage } from '@/pages/LoginPage';
import { MediaPage } from '@/pages/MediaPage';
import { PeoplePage } from '@/pages/PeoplePage';
import { PostsPage } from '@/pages/PostsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { UsersPage } from '@/pages/UsersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="change-password" element={<ChangePasswordPage />} />

                <Route path="committees" element={<CommitteesPage />} />
                <Route path="committees/:id" element={<CommitteeDetailPage />} />
                <Route path="people" element={<PeoplePage />} />
                <Route path="designations" element={<DesignationsPage />} />
                <Route path="advisors" element={<AdvisorsPage />} />

                <Route path="gallery" element={<GalleryPage />} />
                <Route path="gallery/:id" element={<AlbumDetailPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="posts" element={<PostsPage />} />
                <Route path="media" element={<MediaPage />} />

                <Route element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']} />}>
                  <Route path="inbox" element={<InboxPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="audit" element={<AuditPage />} />
                </Route>

                <Route element={<ProtectedRoute roles={['SUPER_ADMIN']} />}>
                  <Route path="users" element={<UsersPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
