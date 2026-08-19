import React, { useState, useEffect } from 'react';
import { Sliders, ShieldCheck, Trash2, RefreshCw, Sparkles, Check } from 'lucide-react';
import { Hero } from '../components/typography/Hero';
import { Card } from '../components/cards/Card';
import { Button } from '../components/buttons/Button';
import { Modal } from '../components/modals/Modal';
import { personalizationStorage } from '../utils/personalizationStorage';

const ALL_INTERESTS = [
  { slug: 'academic-stress', label: 'Academic Stress' },
  { slug: 'failure-resilience', label: 'Failure & Resilience' },
  { slug: 'study-habits', label: 'Study Habits' },
  { slug: 'confidence', label: 'Confidence & Imposter Syndrome' },
  { slug: 'mental-wellness', label: 'Mental Wellness' },
  { slug: 'college-life', label: 'College & Dorm Life' },
  { slug: 'career-stress', label: 'Career & Goal Pressure' },
  { slug: 'self-care', label: 'Self-Care & Micro-Rest' },
];

export const PreferencesPage: React.FC = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedInterests(personalizationStorage.getSelectedInterests());
  }, []);

  const handleToggleInterest = (slug: string) => {
    let updated: string[];
    if (selectedInterests.includes(slug)) {
      updated = selectedInterests.filter((i) => i !== slug);
    } else {
      updated = [...selectedInterests, slug];
    }
    setSelectedInterests(updated);
    personalizationStorage.setSelectedInterests(updated);
    showFeedback('Interest preferences saved.');
  };

  const handleResetInterests = () => {
    personalizationStorage.resetInterests();
    setSelectedInterests(personalizationStorage.getSelectedInterests());
    showFeedback('Interests reset to defaults.');
  };

  const handleClearBookmarks = () => {
    personalizationStorage.clearBookmarks();
    showFeedback('Saved resources cleared.');
  };

  const handleClearHistory = () => {
    personalizationStorage.clearRecentlyViewed();
    showFeedback('Recently viewed history cleared.');
  };

  const handleClearProgress = () => {
    personalizationStorage.clearProgress();
    showFeedback('Reading progress cleared.');
  };

  const handleClearAll = () => {
    personalizationStorage.clearAllData();
    setSelectedInterests(personalizationStorage.getSelectedInterests());
    setIsClearModalOpen(false);
    showFeedback('All personalization data has been cleared.');
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className="container py-6 animate-fade-in">
      {/* Hero Banner */}
      <Hero
        eyebrow="Student Control"
        title="Personalization & Resource Preferences"
        subtitle="Manage your content interests, control reading history, and clear personal resource data anytime."
        visualElement={
          <div className="card p-lg flex flex-col items-center text-center gap-xs">
            <Sliders size={40} className="text-primary" />
            <h4 style={{ fontSize: '1.1rem' }}>Data Control</h4>
            <span className="caption text-muted">User Preferences</span>
          </div>
        }
      />

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div className="card glass p-sm mb-6 flex items-center gap-xs" style={{ borderLeft: '4px solid var(--color-success)', backgroundColor: 'var(--color-primary-light)' }}>
          <Check size={16} className="text-success" />
          <span className="caption font-semibold">{feedbackMessage}</span>
        </div>
      )}

      {/* Privacy Guarantee Explanation */}
      <Card glass className="p-lg mb-8" style={{ borderLeft: '4px solid var(--color-info)' }}>
        <div className="flex items-center gap-sm mb-2 text-info font-semibold">
          <ShieldCheck size={20} /> Personalization Privacy Guarantee
        </div>
        <p className="body-regular text-muted" style={{ lineHeight: 1.6 }}>
          MindCampus recommendations are based strictly on content topic interests and usage history that you control locally.
          We do <strong>not</strong> create psychological profiles, infer mental health conditions, or share personal activity. You can reset or delete your data at any time.
        </p>
      </Card>

      {/* Interest Preference Selection */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3>Select Content Topics & Interests</h3>
            <p className="caption text-muted">Choose the academic and wellness topics you'd like to prioritize in recommendations.</p>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={handleResetInterests}>
            Reset Defaults
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {ALL_INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest.slug);
            return (
              <button
                key={interest.slug}
                onClick={() => handleToggleInterest(interest.slug)}
                className={`card p-md flex items-center justify-between gap-xs cursor-pointer ${
                  isSelected ? 'border-primary' : ''
                }`}
                style={{
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                  textAlign: 'left',
                }}
              >
                <span className="text-small font-medium" style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                  {interest.label}
                </span>
                {isSelected ? <Check size={16} className="text-primary flex-shrink-0" /> : <Sparkles size={14} className="text-muted flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Data Management Controls */}
      <section className="mb-8">
        <h3 className="mb-4">Personal Data Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-lg flex flex-col justify-between gap-md">
            <div>
              <h4 className="mb-1" style={{ fontSize: '1.05rem' }}>Clear Saved Resources</h4>
              <p className="caption text-muted">Remove all bookmarks from your saved library.</p>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Trash2 size={14} />} onClick={handleClearBookmarks}>
              Clear Bookmarks
            </Button>
          </Card>

          <Card className="p-lg flex flex-col justify-between gap-md">
            <div>
              <h4 className="mb-1" style={{ fontSize: '1.05rem' }}>Clear Recently Viewed History</h4>
              <p className="caption text-muted">Delete recent viewing activity records.</p>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Trash2 size={14} />} onClick={handleClearHistory}>
              Clear History
            </Button>
          </Card>

          <Card className="p-lg flex flex-col justify-between gap-md">
            <div>
              <h4 className="mb-1" style={{ fontSize: '1.05rem' }}>Clear Reading Progress</h4>
              <p className="caption text-muted">Reset article and podcast completion tracking.</p>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Trash2 size={14} />} onClick={handleClearProgress}>
              Clear Progress
            </Button>
          </Card>
        </div>

        <div className="mt-6 pt-6 flex justify-end" style={{ borderTop: '1px solid var(--border-color)' }}>
          <Button variant="destructive" leftIcon={<Trash2 size={16} />} onClick={() => setIsClearModalOpen(true)}>
            Clear All Personalization Data
          </Button>
        </div>
      </section>

      {/* Clear All Modal Confirmation */}
      <Modal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} title="Clear All Personalization Data?">
        <p className="body-regular text-muted mb-4">
          This action will delete all saved library items, recent reading history, completion progress, and selected topic preferences. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-sm">
          <Button variant="ghost" onClick={() => setIsClearModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleClearAll}>
            Yes, Delete All Personal Data
          </Button>
        </div>
      </Modal>
    </div>
  );
};
