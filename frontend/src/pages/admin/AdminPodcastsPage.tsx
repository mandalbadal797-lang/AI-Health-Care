import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/buttons/Button';
import { Badge } from '../../components/badges/Badge';
import { Modal } from '../../components/modals/Modal';
import { CardSkeleton } from '../../components/feedback/Skeleton';
import { adminService, AdminPodcastItem } from '../../services/adminService';

export const AdminPodcastsPage: React.FC = () => {
  const [podcasts, setPodcasts] = useState<AdminPodcastItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New podcast form state
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('/audio/sample.mp3');
  const [duration, setDuration] = useState<number>(300);
  const [episodeNum, setEpisodeNum] = useState<number>(1);
  const [categoryId] = useState<number>(1);

  const loadPodcasts = () => {
    setIsLoading(true);
    adminService
      .getPodcasts()
      .then((res) => {
        setPodcasts(res.items);
        setTotal(res.total);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadPodcasts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.createPodcast({
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      description,
      audio_url: audioUrl,
      duration_seconds: duration,
      episode_number: episodeNum,
      category_id: categoryId,
      publication_status: 'draft',
    });
    setIsModalOpen(false);
    loadPodcasts();
  };

  const handleTogglePublish = async (pod: AdminPodcastItem) => {
    if (pod.publication_status === 'published') {
      await adminService.unpublishPodcast(pod.id);
    } else {
      await adminService.publishPodcast(pod.id);
    }
    loadPodcasts();
  };

  const handleDelete = async (id: string) => {
    await adminService.deletePodcast(id);
    loadPodcasts();
  };

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2>Podcast Management</h2>
          <p className="caption text-muted">Total Episodes: {total}</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>
          Create Episode
        </Button>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--color-primary-light)' }}>
                <th className="p-md text-small font-semibold">Episode</th>
                <th className="p-md text-small font-semibold">Title</th>
                <th className="p-md text-small font-semibold">Category</th>
                <th className="p-md text-small font-semibold">Status</th>
                <th className="p-md text-small font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {podcasts.map((pod) => (
                <tr key={pod.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="p-md font-semibold text-primary">Ep. #{pod.episode_number}</td>
                  <td className="p-md font-semibold text-main">{pod.title}</td>
                  <td className="p-md">
                    <Badge variant="info">{pod.category_name}</Badge>
                  </td>
                  <td className="p-md">
                    <Badge variant={pod.publication_status === 'published' ? 'success' : 'warning'}>
                      {pod.publication_status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-md text-right">
                    <div className="flex items-center justify-end gap-xs">
                      <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(pod)}>
                        {pod.publication_status === 'published' ? <XCircle size={16} className="text-warning" /> : <CheckCircle size={16} className="text-success" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(pod.id)}>
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

      {/* Create Episode Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Podcast Episode">
        <form onSubmit={handleCreate} className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label font-semibold">Episode Title</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label font-semibold">URL Slug</label>
            <input className="form-input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. ep-1-academic-stress" />
          </div>
          <div className="form-group">
            <label className="form-label font-semibold">Description</label>
            <textarea className="form-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="form-group">
              <label className="form-label font-semibold">Episode Number</label>
              <input type="number" className="form-input" value={episodeNum} onChange={(e) => setEpisodeNum(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label font-semibold">Duration (Seconds)</label>
              <input type="number" className="form-input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label font-semibold">Audio Reference URL</label>
            <input className="form-input" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-sm pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Draft Episode</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
