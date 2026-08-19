import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { ArrowLeft, Save, Eye, CheckCircle } from 'lucide-react';
import { Button } from '../../components/buttons/Button';
import { ReadingContainer } from '../../components/content/ReadingContainer';
import { Badge } from '../../components/badges/Badge';
import { SafetyNotice } from '../../components/content/SafetyNotice';
import { adminService } from '../../services/adminService';

export const AdminBlogEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id && id !== 'new';

  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [excerpt, setExcerpt] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [readingTime, setReadingTime] = useState<number>(5);
  const [status, setStatus] = useState<string>('draft');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      adminService
        .getArticleById(id)
        .then((art) => {
          setTitle(art.title);
          setSlug(art.slug);
          setExcerpt(art.excerpt);
          setContent(art.content);
          setCategoryId(art.category_id);
          setReadingTime(art.reading_time_minutes);
          setStatus(art.publication_status);
        })
        .catch((err) => setError(err?.message || 'Failed to load article details.'))
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditing]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleSave = async (targetStatus: string = status) => {
    setIsLoading(true);
    setError(null);

    const payload = {
      title,
      slug,
      excerpt,
      content,
      category_id: categoryId,
      reading_time_minutes: readingTime,
      publication_status: targetStatus,
    };

    try {
      if (isEditing && id) {
        await adminService.updateArticle(id, payload);
      } else {
        await adminService.createArticle(payload);
      }
      navigate('/admin/articles');
    } catch (err: any) {
      setError(err?.message || 'Failed to save article.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <div className="flex items-center justify-between">
        <NavLink to="/admin/articles" style={{ textDecoration: 'none' }} className="inline-flex items-center gap-xs text-primary font-semibold">
          <ArrowLeft size={18} /> Back to Blogs List
        </NavLink>
        <div className="flex items-center gap-sm">
          <Button variant="outline" size="sm" leftIcon={<Eye size={14} />} onClick={() => setIsPreviewOpen(!isPreviewOpen)}>
            {isPreviewOpen ? 'Hide Preview' : 'Preview Article'}
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Save size={14} />} onClick={() => handleSave('draft')} isLoading={isLoading}>
            Save Draft
          </Button>
          <Button variant="primary" size="sm" leftIcon={<CheckCircle size={14} />} onClick={() => handleSave('published')} isLoading={isLoading}>
            Publish Article
          </Button>
        </div>
      </div>

      {error && (
        <div className="card p-md text-danger" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          {error}
        </div>
      )}

      {/* Editor & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Fields */}
        <div className="card glass p-lg flex flex-col gap-md">
          <h3>{isEditing ? 'Edit Article' : 'Create New Article'}</h3>

          <div className="form-group">
            <label className="form-label font-semibold">Article Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Navigating Academic Pressure"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label font-semibold">URL Slug</label>
            <input
              type="text"
              className="form-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label font-semibold">Excerpt</label>
            <textarea
              className="form-input"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of article content..."
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="form-group">
              <label className="form-label font-semibold">Category</label>
              <select
                className="form-input"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
              >
                <option value={1}>Exam Stress</option>
                <option value={2}>Failure & Resilience</option>
                <option value={3}>Study Habits</option>
                <option value={4}>Imposter Syndrome</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label font-semibold">Est. Reading Time (Mins)</label>
              <input
                type="number"
                className="form-input"
                value={readingTime}
                onChange={(e) => setReadingTime(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-semibold">Article Body (Markdown Supported)</label>
            <textarea
              className="form-input"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write body content here..."
            />
          </div>
        </div>

        {/* Live Public Preview Panel */}
        <div className="card glass p-lg overflow-y-auto" style={{ maxHeight: '750px' }}>
          <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <span className="caption font-semibold text-muted flex items-center gap-xs">
              <Eye size={14} /> Student Platform Preview
            </span>
            <Badge variant={status === 'published' ? 'success' : 'warning'}>{status.toUpperCase()}</Badge>
          </div>

          <ReadingContainer>
            <h1 className="display-heading">{title || 'Untitled Article'}</h1>
            <p className="body-lg text-muted my-2">{excerpt || 'Article excerpt preview...'}</p>

            <div className="my-6 body-regular" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {content || 'Article body content preview will render here...'}
            </div>

            <SafetyNotice />
          </ReadingContainer>
        </div>
      </div>
    </div>
  );
};
