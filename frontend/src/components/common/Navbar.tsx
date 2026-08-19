import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon, Sparkles, Activity, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useHealth } from '../../hooks/useHealth';
import { IconButton } from '../buttons/IconButton';
import { MobileNavDrawer } from '../navigation/MobileNavDrawer';
import { GlobalSearchBar } from '../navigation/GlobalSearchBar';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isConnected, isLoading } = useHealth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <header className="navbar">
        <div className="flex items-center gap-md">
          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <IconButton
              icon={<Menu size={20} />}
              aria-label="Open navigation menu"
              onClick={() => setIsMobileOpen(false)}
            />
          </div>

          <NavLink to="/" className="navbar-brand">
            <Sparkles className="text-primary" size={24} />
            <span>MindCampus</span>
          </NavLink>
        </div>

        {/* Global Search Bar Integrated */}
        <div className="hidden lg:block w-72">
          <GlobalSearchBar placeholder="Search platform..." />
        </div>

        <ul className="navbar-nav">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/blog" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Blog
            </NavLink>
          </li>
          <li>
            <NavLink to="/podcasts" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Podcasts
            </NavLink>
          </li>
          <li>
            <NavLink to="/stories" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Stories
            </NavLink>
          </li>
          <li>
            <NavLink to="/categories" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Topics
            </NavLink>
          </li>
          <li>
            <NavLink to="/saved" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Saved
            </NavLink>
          </li>
          <li>
            <NavLink to="/ai-assistant" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              AI Mascot
            </NavLink>
          </li>
        </ul>

        <div className="flex items-center gap-4">
          {/* Backend Status Indicator */}
          <div className="flex items-center gap-2 text-small hidden sm:flex">
            <Activity size={16} className={isConnected ? 'text-success' : 'text-danger'} />
            <span className={`badge ${isLoading ? 'badge-info' : isConnected ? 'badge-success' : 'badge-danger'}`}>
              {isLoading ? 'Checking API...' : isConnected ? 'API Connected' : 'API Offline'}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            aria-label="Toggle dark mode"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* Accessible Mobile Nav Drawer */}
      <MobileNavDrawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </>
  );
};
