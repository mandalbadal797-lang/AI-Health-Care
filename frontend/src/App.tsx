import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { StudentLayout } from './components/layout/StudentLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { BlogPage } from './pages/BlogPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { PodcastPage } from './pages/PodcastPage';
import { PodcastDetailPage } from './pages/PodcastDetailPage';
import { StoryPage } from './pages/StoryPage';
import { StoryDetailPage } from './pages/StoryDetailPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { LibraryPage } from './pages/LibraryPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { SearchPage } from './pages/SearchPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { Phase2VerificationPage } from './pages/Phase2VerificationPage';
import { DesignSystemShowcasePage } from './pages/DesignSystemShowcasePage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminAIContentStudioPage } from './pages/admin/AdminAIContentStudioPage';
import { AdminBlogsPage } from './pages/admin/AdminBlogsPage';
import { AdminBlogEditPage } from './pages/admin/AdminBlogEditPage';
import { AdminPodcastsPage } from './pages/admin/AdminPodcastsPage';
import { AdminStoriesPage } from './pages/admin/AdminStoriesPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AdminModerationPage } from './pages/admin/AdminModerationPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Site Layout Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticleDetailPage />} />
          <Route path="/podcasts" element={<PodcastPage />} />
          <Route path="/podcasts/:slug" element={<PodcastDetailPage />} />
          <Route path="/stories" element={<StoryPage />} />
          <Route path="/stories/:slug" element={<StoryDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:slug" element={<CategoryDetailPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/saved" element={<LibraryPage />} />
          <Route path="/bookmarks" element={<LibraryPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/phase2-verification" element={<Phase2VerificationPage />} />
          <Route path="/design-system" element={<DesignSystemShowcasePage />} />
          <Route path="/about" element={<PlaceholderPage title="About MindCampus Platform" targetPhase="Phase 12" />} />
          <Route path="/safety" element={<PlaceholderPage title="Mental Health Safety & Helplines" targetPhase="Phase 1" />} />
          <Route path="/login" element={<PlaceholderPage title="Student Login" targetPhase="Phase 8" />} />
          <Route path="/register" element={<PlaceholderPage title="Student Registration" targetPhase="Phase 8" />} />
        </Route>

        {/* Student Portal Layout Routes */}
        <Route element={<StudentLayout />}>
          <Route path="/profile" element={<PlaceholderPage title="Student Profile" targetPhase="Phase 8" />} />
          <Route path="/recommendations" element={<PlaceholderPage title="AI Smart Recommendations" targetPhase="Phase 9" />} />
        </Route>

        {/* Public Unprotected Admin Login Route */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Portal Layout Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/ai-content" element={<AdminAIContentStudioPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/articles" element={<AdminBlogsPage />} />
            <Route path="/admin/articles/new" element={<AdminBlogEditPage />} />
            <Route path="/admin/articles/:id/edit" element={<AdminBlogEditPage />} />
            <Route path="/admin/podcasts" element={<AdminPodcastsPage />} />
            <Route path="/admin/stories" element={<AdminStoriesPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
            <Route path="/admin/moderation" element={<AdminModerationPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
