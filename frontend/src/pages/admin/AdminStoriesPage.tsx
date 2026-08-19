import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/buttons/Button';
import { Badge } from '../../components/badges/Badge';
import { Modal } from '../../components/modals/Modal';
import { CardSkeleton } from '../../components/feedback/Skeleton';
import { adminService, AdminStoryItem } from '../../services/adminService';

export const AdminStoriesPage: React.FC = () => {
  const [stories, setStories] = useState<AdminStoryItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('Anonymous Student');

  const loadStories = () => {
    setIsLoading(true);
    adminService
      .getStories()
      .then((res) => {
        setStories(res.items);
        setTotal(res.total);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.createStory({
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      subtitle,
      content,
      author_name: authorName,
      category_id: 1,
      publication_status: 'draft',
    });
    setIsModalOpen(false);
    loadStories();
  };

  const handleTogglePublish = async (st: AdminStoryItem) => {
    if (st.publication_status === 'published') {
      await adminService.unpublishStory(st.id);
    } else {
      await adminService.publishStory(st.id);
    }
    loadStories();
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteStory(id);
    loadStories();
  };

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2>Digital Storytelling Management</h2>
          <p className="caption text-muted">Total Stories: {total}</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>
          Create Student Story
        </Button>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--color-primary-light)' }}>
                <th className="p-md text-small font-semibold">Title</th>
                <th className="p-md text-small font-semibold">Author</th>
                <th className="p-md text-small font-semibold">Category</th>
                <th className="p-md text-small font-semibold">Status</th>
                <th className="p-md text-small font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((st) => (
                <tr key={st.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="p-md font-semibold text-main">{st.title}</td>
                  <td className="p-md text-muted caption">{st.author_name}</td>
                  <td className="p-md">
                    <Badge variant="info">{st.category_name}</Badge>
                  </td>
                  <td className="p-md">
                    <Badge variant={st.publication_status === 'published' ? 'success' : 'warning'}>
                      {st.publication_status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-md text-right">
                    <div className="flex items-center justify-end gap-xs">
                      <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(st)}>
                        {st.publication_status === 'published' ? <XCircle size={16} className="text-warning" /> : <CheckCircle size={16} className="text-success" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(st.id)}>
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

      {/* Create Story Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Student Digital Story">
        <form onSubmit={handleCreate} className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label font-semibold">Story Title</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label font-semibold">URL Slug</label>
            <input className="form-input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. overcoming-academic-burnout" />
          </div>
          <div className="form-group">
            <label className="form-label font-semibold">Subtitle / Summary</label>
            <input className="form-input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label font-semibold">Author / Attribution</label>
            <input className="form-input" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label font-semibold">Story Body Narrative</label>
            <textarea className="form-input" rows={6} value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-sm pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Draft Story</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
