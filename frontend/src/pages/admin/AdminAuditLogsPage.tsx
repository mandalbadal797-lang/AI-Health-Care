import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Badge } from '../../components/badges/Badge';
import { CardSkeleton } from '../../components/feedback/Skeleton';
import { adminService, AuditLogItem } from '../../services/adminService';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFilter, setActionFilter] = useState<string>('');

  const loadLogs = () => {
    setIsLoading(true);
    adminService
      .getAuditLogs({ page: 1, limit: 25, action_filter: actionFilter })
      .then((res) => {
        setLogs(res.items);
        setTotal(res.total);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2>Administrative Audit Logs</h2>
          <p className="caption text-muted">Total Audit Records: {total}</p>
        </div>
      </div>

      <div className="card p-md flex items-center justify-between">
        <span className="caption font-semibold text-muted flex items-center gap-xs">
          <Filter size={14} /> Filter Audit Action:
        </span>
        <select
          className="form-input text-small"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="">All Actions</option>
          <option value="BLOG_CREATED">BLOG_CREATED</option>
          <option value="BLOG_UPDATED">BLOG_UPDATED</option>
          <option value="BLOG_PUBLISHED">BLOG_PUBLISHED</option>
          <option value="BLOG_UNPUBLISHED">BLOG_UNPUBLISHED</option>
          <option value="PODCAST_CREATED">PODCAST_CREATED</option>
          <option value="STORY_CREATED">STORY_CREATED</option>
        </select>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--color-primary-light)' }}>
                <th className="p-md text-small font-semibold">Timestamp</th>
                <th className="p-md text-small font-semibold">Admin Identity</th>
                <th className="p-md text-small font-semibold">Action</th>
                <th className="p-md text-small font-semibold">Content Type</th>
                <th className="p-md text-small font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="p-md caption text-muted">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-md">
                    <span className="font-semibold text-main block">{log.admin_name}</span>
                    <span className="caption text-muted">{log.admin_email}</span>
                  </td>
                  <td className="p-md">
                    <Badge variant="info">{log.action}</Badge>
                  </td>
                  <td className="p-md caption text-muted">{log.content_type}</td>
                  <td className="p-md caption text-main">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
