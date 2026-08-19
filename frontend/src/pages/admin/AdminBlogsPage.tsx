import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Edit, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/buttons/Button';
import { Badge } from '../../components/badges/Badge';
import { Modal } from '../../components/modals/Modal';
import { CardSkeleton } from '../../components/feedback/Skeleton';
import { adminService, AdminArticleItem } from '../../services/adminService';

export const AdminBlogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<AdminArticleItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<AdminArticleItem | null>(null);

  const loadArticles = () => {
    setIsLoading(true);
    adminService
      .getArticles({ page: 1, limit: 20, search, status_filter: statusFilter })
      .then((res) => {
        setArticles(res.items);
        setTotal(res.total);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadArticles();
  }, [search, statusFilter]);

  const handleTogglePublish = async (art: AdminArticleItem) => {
    if (art.publication_status === 'published') {
      await adminService.unpublishArticle(art.id);
    } else {
      await adminService.publishArticle(art.id);
    }
    loadArticles();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await adminService.deleteArticle(deleteTarget.id);
    setDeleteTarget(null);
    loadArticles();
  };

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md">
        <div>
          <h2>Blog Content Management</h2>
          <p className="caption text-muted">Total Articles: {total}</p>
        </div>
        <NavLink to="/admin/articles/new" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
            Create New Article
          </Button>
        </NavLink>
      </div>

      {/* Filters and Search Bar */}
      <div className="card p-md flex flex-col md:flex-row items-center justify-between gap-md">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            className="form-input text-small pl-8"
            placeholder="Search title, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-sm w-full md:w-auto">
          <label className="caption text-muted font-semibold">Status:</label>
          <select
            className="form-input text-small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--color-primary-light)' }}>
                <th className="p-md text-small font-semibold">Title</th>
                <th className="p-md text-small font-semibold">Category</th>
                <th className="p-md text-small font-semibold">Status</th>
                <th className="p-md text-small font-semibold">Created Date</th>
                <th className="p-md text-small font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((art) => (
                <tr key={art.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="p-md">
                    <span className="font-semibold text-main block">{art.title}</span>
                    <span className="caption text-muted">{art.slug}</span>
                  </td>
                  <td className="p-md">
                    <Badge variant="info">{art.category_name}</Badge>
                  </td>
                  <td className="p-md">
                    <Badge variant={art.publication_status === 'published' ? 'success' : art.publication_status === 'draft' ? 'warning' : 'danger'}>
                      {art.publication_status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-md caption text-muted">
                    {new Date(art.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-md text-right">
                    <div className="flex items-center justify-end gap-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(art)}
                        title={art.publication_status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {art.publication_status === 'published' ? <XCircle size={16} className="text-warning" /> : <CheckCircle size={16} className="text-success" />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/articles/${art.id}/edit`)}
                        title="Edit Article"
                      >
                        <Edit size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(art)}
                        title="Archive Article"
                      >
                        <Trash2 size={16} className="text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Archive Article?">
        <p className="body-regular text-muted mb-4">
          Are you sure you want to archive <strong>"{deleteTarget?.title}"</strong>? Archived articles will no longer appear on the public student platform.
        </p>
        <div className="flex justify-end gap-sm">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Archive Article
          </Button>
        </div>
      </Modal>
    </div>
  );
};
