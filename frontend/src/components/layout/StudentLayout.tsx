import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { Bookmark, User, Sparkles, Compass } from 'lucide-react';

export const StudentLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-6 mt-6" style={{ flex: 1, padding: '1rem 0' }}>
        <aside className="card flex flex-col gap-2" style={{ height: 'fit-content' }}>
          <h3 className="mb-2 text-small text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Student Portal
          </h3>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'btn btn-primary btn-sm justify-start' : 'btn btn-secondary btn-sm justify-start')}>
            <User size={16} /> Profile
          </NavLink>
          <NavLink to="/bookmarks" className={({ isActive }) => (isActive ? 'btn btn-primary btn-sm justify-start' : 'btn btn-secondary btn-sm justify-start')}>
            <Bookmark size={16} /> Saved Bookmarks
          </NavLink>
          <NavLink to="/recommendations" className={({ isActive }) => (isActive ? 'btn btn-primary btn-sm justify-start' : 'btn btn-secondary btn-sm justify-start')}>
            <Compass size={16} /> Recommended Content
          </NavLink>
          <NavLink to="/ai-assistant" className={({ isActive }) => (isActive ? 'btn btn-primary btn-sm justify-start' : 'btn btn-secondary btn-sm justify-start')}>
            <Sparkles size={16} /> AI Mascot Assistant
          </NavLink>
        </aside>

        <main id="main-content" style={{ gridColumn: 'span 3' }}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </>
  );
};
