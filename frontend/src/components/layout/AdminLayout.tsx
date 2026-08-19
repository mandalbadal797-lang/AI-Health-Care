import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Headphones,
  HeartHandshake,
  FolderTree,
  ShieldAlert,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Sparkles,
  LogOut,
  ExternalLink,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Badge } from '../badges/Badge';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const currentUser = adminService.getCurrentAdminUser();

  const handleLogout = () => {
    adminService.clearAuth();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'AI Content Studio', path: '/admin/ai-content', icon: <Sparkles size={18} /> },
    { label: 'Content Analytics', path: '/admin/analytics', icon: <BarChart3 size={18} /> },
    { label: 'Blogs', path: '/admin/articles', icon: <FileText size={18} /> },
    { label: 'Podcasts', path: '/admin/podcasts', icon: <Headphones size={18} /> },
    { label: 'Stories', path: '/admin/stories', icon: <HeartHandshake size={18} /> },
    { label: 'Categories', path: '/admin/categories', icon: <FolderTree size={18} /> },
    { label: 'Content Feedback', path: '/admin/feedback', icon: <MessageSquare size={18} /> },
    { label: 'Moderation Queue', path: '/admin/moderation', icon: <ShieldAlert size={18} /> },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: <ClipboardList size={18} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-64 glass p-md flex flex-col justify-between ${
          isMobileMenuOpen ? 'block' : 'hidden md:flex'
        }`}
        style={{
          borderRight: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
          zIndex: 100,
        }}
      >
        <div className="flex flex-col gap-md">
          {/* Admin Header / Logo */}
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <NavLink to="/admin" style={{ textDecoration: 'none' }} className="flex items-center gap-xs">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                MC
              </div>
              <span className="font-semibold text-lg" style={{ color: 'var(--color-text-main)' }}>
                MindCampus Admin
              </span>
            </NavLink>
            <button className="md:hidden btn btn-ghost" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-xs">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-sm px-md py-sm rounded-md font-medium text-small text-decoration-none ${
                    isActive ? 'bg-primary-light text-primary' : 'text-muted hover:text-main'
                  }`
                }
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Actions / Logout */}
        <div className="flex flex-col gap-sm pt-4 mt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
          <NavLink to="/" style={{ textDecoration: 'none' }} className="flex items-center gap-xs caption text-muted hover:text-main">
            <ExternalLink size={14} /> Back to Public Platform
          </NavLink>
          <button
            onClick={handleLogout}
            className="btn btn-ghost w-full justify-start text-danger"
            style={{ padding: '0.5rem 0.75rem' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header
          className="p-md flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center gap-sm">
            <button className="md:hidden btn btn-ghost" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <h3 style={{ fontSize: '1.15rem' }}>Platform Control Portal</h3>
          </div>

          <div className="flex items-center gap-sm">
            <div className="flex items-center gap-xs caption font-semibold text-muted">
              <UserCheck size={16} className="text-success" />
              <span>{currentUser?.email || 'admin@mindcampus.edu'}</span>
            </div>
            <Badge variant="info">ADMIN</Badge>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="p-lg flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
