import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Star, CheckCircle, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../buttons/Button';
import { feedbackService, FeedbackSummary, StudentFeedbackRecord } from '../../services/feedbackService';

export interface ContentFeedbackProps {
  contentId: string;
  contentType: 'article' | 'podcast' | 'story';
  title?: string;
}

const CATEGORY_TAGS_MAP: Record<'article' | 'podcast' | 'story', string[]> = {
  article: ['Easy to understand', 'Useful information', 'Practical', 'Length appropriate'],
  podcast: ['Audio quality', 'Easy to follow', 'Useful duration', 'Engaging discussion'],
  story: ['Engaging storytelling', 'Motivating', 'Relatable experience', 'Clear reflection'],
};

export const ContentFeedback: React.FC<ContentFeedbackProps> = ({
  contentId,
  contentType,
}) => {
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<StudentFeedbackRecord | null>(null);

  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      feedbackService.getFeedbackSummary(contentId, contentType),
      feedbackService.getMyFeedback(contentId, contentType),
    ]).then(([sumData, myData]) => {
      if (!isMounted) return;
      setSummary(sumData);
      if (myData) {
        setExistingFeedback(myData);
        setIsHelpful(myData.is_helpful);
        setRating(myData.rating || null);
        setSelectedTags(myData.category_tags || []);
        setComment(myData.comment || '');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [contentId, contentType]);

  const handleHelpfulSelect = async (helpfulValue: boolean) => {
    setIsHelpful(helpfulValue);
    setErrorMessage(null);
    setIsSubmitting(true);

    const success = await feedbackService.submitFeedback(contentId, {
      content_type: contentType,
      is_helpful: helpfulValue,
      rating: rating || undefined,
      category_tags: selectedTags.length > 0 ? selectedTags : undefined,
      comment: comment.trim() ? comment.trim() : undefined,
    });

    setIsSubmitting(false);
    if (success) {
      setSubmittedMessage('Thanks for your feedback!');
      refreshSummary();
    } else {
      setErrorMessage('Unable to submit feedback. Please try again.');
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFullSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isHelpful === null) {
      setErrorMessage('Please select whether this content was helpful.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);

    const success = await feedbackService.submitFeedback(contentId, {
      content_type: contentType,
      is_helpful: isHelpful,
      rating: rating || undefined,
      category_tags: selectedTags.length > 0 ? selectedTags : undefined,
      comment: comment.trim() ? comment.trim() : undefined,
    });

    setIsSubmitting(false);
    if (success) {
      setSubmittedMessage('Thanks for helping us improve MindCampus content!');
      refreshSummary();
    } else {
      setErrorMessage('Failed to submit feedback. Please check your connection.');
    }
  };

  const handleDeleteFeedback = async () => {
    if (!existingFeedback) return;
    setIsSubmitting(true);
    const success = await feedbackService.deleteMyFeedback(contentId, contentType);
    setIsSubmitting(false);

    if (success) {
      setExistingFeedback(null);
      setIsHelpful(null);
      setRating(null);
      setSelectedTags([]);
      setComment('');
      setSubmittedMessage(null);
      refreshSummary();
    }
  };

  const refreshSummary = () => {
    feedbackService.getFeedbackSummary(contentId, contentType).then(setSummary);
  };

  const availableTags = CATEGORY_TAGS_MAP[contentType] || CATEGORY_TAGS_MAP.article;

  return (
    <section
      className="card p-6 my-8 animate-fade-in"
      style={{
        backgroundColor: 'var(--color-surface-elevated, #ffffff)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg, 12px)',
      }}
      aria-labelledby="feedback-heading"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b mb-4" style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h3 id="feedback-heading" className="text-h4 font-bold flex items-center gap-xs">
            Was this content helpful?
          </h3>
          <p className="text-muted text-small">
            Your feedback helps us continuously refine and improve educational wellness resources.
          </p>
        </div>

        {summary && summary.total_responses > 0 && (
          <div className="flex items-center gap-md bg-subtle p-xs px-md rounded-pill text-small">
            <span className="font-semibold text-main">
              {summary.helpful_rate}% helpful
            </span>
            {summary.average_rating > 0 && (
              <span className="flex items-center gap-xs text-muted">
                <Star size={14} className="fill-warning text-warning" />
                {summary.average_rating.toFixed(1)} / 5 ({summary.rating_count} {summary.rating_count === 1 ? 'rating' : 'ratings'})
              </span>
            )}
          </div>
        )}
      </div>

      {submittedMessage && (
        <div className="alert alert-success flex items-center justify-between gap-2 p-sm mb-4">
          <span className="flex items-center gap-xs text-small font-medium">
            <CheckCircle size={16} /> {submittedMessage}
          </span>
          {existingFeedback && (
            <button
              onClick={handleDeleteFeedback}
              disabled={isSubmitting}
              className="btn btn-ghost text-muted hover:text-error text-xs p-1"
              title="Remove my feedback"
            >
              <Trash2 size={14} /> Remove
            </button>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error flex items-center gap-2 p-sm mb-4 text-small">
          <AlertCircle size={16} /> {errorMessage}
        </div>
      )}

      {/* Primary Helpful Yes/No Controls */}
      <div className="flex items-center gap-md my-4">
        <button
          type="button"
          onClick={() => handleHelpfulSelect(true)}
          disabled={isSubmitting}
          className={`btn ${isHelpful === true ? 'btn-primary' : 'btn-secondary'} flex items-center gap-xs`}
          aria-label="Mark content as helpful"
        >
          <ThumbsUp size={16} /> Yes, Helpful
        </button>

        <button
          type="button"
          onClick={() => handleHelpfulSelect(false)}
          disabled={isSubmitting}
          className={`btn ${isHelpful === false ? 'btn-primary' : 'btn-secondary'} flex items-center gap-xs`}
          aria-label="Mark content as not helpful"
        >
          <ThumbsDown size={16} /> No, Needs Improvement
        </button>
      </div>

      {/* Optional Rating & Written Feedback Form */}
      {isHelpful !== null && (
        <form onSubmit={handleFullSubmit} className="mt-6 pt-4 border-t gap-md flex flex-col animate-fade-in" style={{ borderColor: 'var(--border-color)' }}>
          {/* Star Rating */}
          <div>
            <label className="form-label text-small font-semibold mb-2 block">
              Optional Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-xs" role="radiogroup" aria-label="Content star rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? null : star)}
                  className="btn btn-ghost p-1 hover:scale-110 transition-transform"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={22}
                    className={rating && star <= rating ? 'fill-warning text-warning' : 'text-muted'}
                  />
                </button>
              ))}
              {rating && (
                <span className="text-small text-muted ml-2 font-medium">
                  {rating} out of 5
                </span>
              )}
            </div>
          </div>

          {/* Structured Feedback Tags */}
          <div>
            <label className="form-label text-small font-semibold mb-2 block">
              Quick Feedback Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-xs">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`btn btn-xs ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ borderRadius: 'var(--radius-pill)', padding: '0.25rem 0.65rem' }}
                  >
                    {isSelected ? '✓ ' : '+ '} {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Written Comment */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="feedback-comment" className="form-label text-small font-semibold">
                Anything else you'd like to share? (Optional)
              </label>
              <span className="text-xs text-muted">{comment.length} / 1000</span>
            </div>
            <textarea
              id="feedback-comment"
              className="form-input text-small w-full"
              rows={3}
              maxLength={1000}
              placeholder="Tell us what you liked or how we can improve this content..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <p className="text-xs text-muted mt-1 italic">
              Notice: Please avoid sharing personal health or sensitive information.
            </p>
          </div>

          <div className="flex items-center justify-end gap-sm mt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              leftIcon={isSubmitting ? <Loader2 size={14} className="animate-spin" /> : undefined}
            >
              {isSubmitting ? 'Saving...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
};
